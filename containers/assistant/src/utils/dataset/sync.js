import { toFile } from 'openai'
import { GHContent, GHMetadata } from '../github/fetch.js'

// OpenAI API Files have an upload date (Could be used for tracking instead of the hash?)
// OpenAI Files can't store metadata so using DB for hash and id (Could the file name manipulated to store metadata?)(up to 255 chars)
// Add a validation step to check if all DB files exist in OpenAI and Vector Store

// Helper to cleanup file from OpenAI and Vector Store (Modified, Deleted)
async function cleanupFile(openaiM, vectorStoreId, openaiId) {
  if (!openaiId) return

  try {
    const openaiFile = await openaiM.filesM.retrieveFile(openaiId)
    if (!openaiFile) return
  
    // Delete from Vector Store if exists
    try {
      const vectorStoreFile = await openaiM.vectorStoresFilesM.retrieveVectorStoresFiles(vectorStoreId, openaiId)
      if (vectorStoreFile) {
        await openaiM.vectorStoresFilesM.deleteVectorStoresFiles(vectorStoreId, openaiId)
        console.log(` • Deleted from Vector Store.`)
      }
    } catch (error) {
      // File likely already deleted from Vector Store
      console.error(` • Error cleaning up file from Vector Store (ID: ${openaiId}): ${error.message}`)
    }

    // Delete from OpenAI
    await openaiM.filesM.deleteFile(openaiId)
    console.log(` • Deleted from OpenAI.`)
  } catch (error) {
    // File likely already deleted from OpenAI
    console.error(` • Error cleaning up file (ID: ${openaiId}): ${error.message}`)
  }
}

// Helper to clean all files from OpenAI and Vector Store
async function cleanupAllFiles(openaiM, vectorStoreId) {
  console.log('Cleaning up all files from OpenAI and Vector Store...')

  // Get all vector store files (with pagination)
  const files = await getAllVectorStoresFiles(openaiM, vectorStoreId)

  if (files.length > 0) {
    for (const file of files) await cleanupFile(openaiM, vectorStoreId, file.id)
  } else {
    console.log('No files to cleanup')
  }

  console.log('Cleanup complete.')
}

async function getAllVectorStoresFiles(openaiM, vectorStoreId) {
  const vectorStoresFiles = []
  let after = null

  while (true) {
    const { data } = await openaiM.vectorStoresFilesM.listVectorStoresFiles(vectorStoreId, { limit: 100, after })
    if (!data || data.length === 0) break
    vectorStoresFiles.push(...data)
    after = data[data.length - 1].id
  }

  return vectorStoresFiles
}

// Helper to get file content, convert to file, upload to OpenAI and to Vector Store (Added, Modified)
async function processUpload(openaiM, vectorStoreId, owner, repo, filePath, ref, name) {
  const content = await GHContent(owner, repo, filePath, ref)
  const fileObj = await toFile(Buffer.from(content), name)

  const uploadedFile = await openaiM.filesM.uploadFile({ file: fileObj, purpose: 'assistants' })
  console.log(' • Uploaded to OpenAI')

  await openaiM.vectorStoresFilesM.createAndPollVectorStoresFiles(vectorStoreId, { file_id: uploadedFile.id })
  console.log(' • Added to Vector Store')

  return uploadedFile.id
}

// Helper to save file metadata to DB
async function saveFileMetadata(DBInstance, repo, dirPath, name, sha, openaiId) {
  await DBInstance.upsert('dataset_files', {
    gh_file_name: name,
    gh_repo: repo,
    gh_file_dir_path: dirPath,
    gh_file_hash: sha,
    openai_file_id: openaiId
  }, ['gh_file_name', 'gh_repo', 'gh_file_dir_path'])
}

export async function sync(DBInstance, openaiM, vectorStoreId, datasetGithub) {
  const { owner, repo, dirPath, ref } = datasetGithub

  // Clean up if no files in DB (fresh start)
  const dbCount = await DBInstance.count('dataset_files', { gh_repo: repo, gh_file_dir_path: dirPath })
  if (dbCount === 0) {
    console.log('No files found in the DB. Trying to clean up all Assistant Vector Store files before syncing')
    await cleanupAllFiles(openaiM, vectorStoreId)
  }

  const [ghFiles, dbFiles] = await Promise.all([
    GHMetadata(owner, repo, dirPath, ref),
    DBInstance.findAll('dataset_files', { gh_repo: repo, gh_file_dir_path: dirPath }, '*')
  ])
  const dbFilesMap = new Map(dbFiles.map(f => [f.gh_file_name, f]))

  // Process GitHub files
  for (const ghFile of ghFiles) {
    if (ghFile.type !== 'file') continue

    const { name, path: filePath, sha, /*size*/ } = ghFile
    const dbFile = dbFilesMap.get(name)

    if (!dbFile) {
      console.log(`(+) File "${name}":`)
      const openaiId = await processUpload(openaiM, vectorStoreId, owner, repo, filePath, ref, name)
      await saveFileMetadata(DBInstance, repo, dirPath, name, sha, openaiId)
    } else if (dbFile.gh_file_hash === sha) {
      console.log(`(=) File "${name}" has not changed.`)
      dbFilesMap.delete(name)
    } else {
      console.log(`(!=) File "${name}":`)
      await cleanupFile(openaiM, vectorStoreId, dbFile.openai_file_id)
      const openaiId = await processUpload(openaiM, vectorStoreId, owner, repo, filePath, ref, name)
      await saveFileMetadata(DBInstance, repo, dirPath, name, sha, openaiId)
      dbFilesMap.delete(name)
    }
  }

  // Process deleted files
  for (const [name, dbFile] of dbFilesMap) {
    console.log(`(-) File "${name}":`)
    await cleanupFile(openaiM, vectorStoreId, dbFile.openai_file_id)
    DBInstance.delete('dataset_files', { gh_file_name: name, gh_repo: repo, gh_file_dir_path: dirPath })
  }
}