import { toFile } from 'openai'
import { GHContent, GHMetadata } from '../github/fetch.js'

// Helper to cleanup file from OpenAI and Vector Store (Modified, Deleted)
async function cleanupFile(openaiM, vectorStoreId, openaiId) {
  if (!openaiId) return
  const openaiFile = await openaiM.filesM.retrieveFile(openaiId)
  if (openaiFile) {
    const vectorStoreFile = await openaiM.vectorStoresFilesM.retrieveVectorStoresFiles(vectorStoreId, openaiId)
    if (vectorStoreFile) {
      await openaiM.vectorStoresFilesM.deleteVectorStoresFiles(vectorStoreId, openaiId)
      console.log(` • Deleted from Vector Store.`)
    }
    await openaiM.filesM.deleteFile(openaiId)
    console.log(` • Deleted from OpenAI.`)
  }
}

// Helper to get file content, convert to file, upload to OpenAI and add to Vector Store (Added, Modified)
async function processUpload(openaiM, vectorStoreId, owner, repo, filePath, ref, name) {
  const content = await GHContent(owner, repo, filePath, ref)
  const fileObj = await toFile(Buffer.from(content), name)

  const uploadedFile = await openaiM.filesM.uploadFile({
    file: fileObj,
    purpose: 'assistants'
  })
  console.log(' • Uploaded to OpenAI')
  await openaiM.vectorStoresFilesM.createVectorStoresFiles(vectorStoreId, {
    file_id: uploadedFile.id
  })
  console.log(' • Added to Vector Store')

  return uploadedFile.id
}

export async function sync(DBInstance, openaiM, vectorStoreId, datasetGithub) {
  const { owner, repo, dirPath, ref } = datasetGithub

  const [ghFiles, dbFiles] = await Promise.all([
    GHMetadata(owner, repo, dirPath, ref),
    DBInstance.findAll('dataset_files', { gh_repo: repo, gh_file_dir_path: dirPath }, '*')
  ])
  const dbFilesMap = new Map(dbFiles.map(f => [f.gh_file_name, f]))

  for (const ghFile of ghFiles) {
    if (ghFile.type !== 'file') continue

    const { name, path: filePath, sha, /*size*/ } = ghFile
    const dbFile = dbFilesMap.get(name)

    // (Added) File exists in GitHub but doesn't exist in DB
    if (!dbFile) {
      console.log(`(+) File "${name}":`)
      const openaiId = await processUpload(openaiM, vectorStoreId, owner, repo, filePath, ref, name)
      await DBInstance.upsert('dataset_files', {
        gh_file_name: name,
        gh_repo: repo,
        gh_file_dir_path: dirPath,
        gh_file_hash: sha,
        openai_file_id: openaiId
      }, ['gh_file_name', 'gh_repo', 'gh_file_dir_path'])

    // (Unchanged) File exists in GitHub and exists in DB and hashes are identical
    } else if (dbFile.gh_file_hash === sha) {
      console.log(`(=) File "${name}" has not changed.`)
      dbFilesMap.delete(name)

    // (Modified) File exists in GitHub and exists DB but hashes are different
    } else {
      console.log(`(!=) File "${name}":`)
      await cleanupFile(openaiM, vectorStoreId, dbFile.openai_file_id)
      dbFilesMap.delete(name)
      const openaiId = await processUpload(openaiM, vectorStoreId, owner, repo, filePath, ref, name)
      await DBInstance.upsert('dataset_files', {
        gh_file_name: name,
        gh_repo: repo,
        gh_file_dir_path: dirPath,
        gh_file_hash: sha,
        openai_file_id: openaiId
      }, ['gh_file_name', 'gh_repo', 'gh_file_dir_path'])
    }
  }

  // (Deleted) File doesn't exist in GitHub but exists in DB
  for (const [name, dbFile] of dbFilesMap) {
    console.log(`(-) File "${name}":`)
    await cleanupFile(openaiM, vectorStoreId, dbFile.openai_file_id)
    DBInstance.delete('dataset_files', { gh_file_name: name, gh_repo: repo, gh_file_dir_path: dirPath })
  }
}

// DBInstance.findOne('dataset_files', {
//   gh_file_name: name,
//   gh_repo: repo,
//   gh_file_dir_path: dirPath
// }, '*')

// If DB is empty, the Vector Store could still have files but we can't track them. Fetch all files from the Vector Store, delete them from OpenAI and the Vector Store. Then do the sync.

// OpenAI Files can't have metadata, so I don't know the hash of the file itself.
// GitHub files are the source of truth.
// The database is used to store file hashes and openai file ids.
// The DB could still store the file info such as hash while already deleted from OpenAI.
// If the db is out of sync or empty, and openai already has the files and the vector store already has files, there's no way to know if the files are the same. In this case, openai files and vector store files should be all deleted and reuploaded.
// An OpenAI file has the upload date, maybe it can be used for something?
// The file name can be up to 255, maybe I can append the hash?

// IDEA: Instead of automatic sync, implement a manual upload of files from Discord. Provide simple commands to list, compare, upload, delete.