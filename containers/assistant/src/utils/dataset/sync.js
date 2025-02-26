import { GHContent, GHMetadata } from '../github/fetch.js'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

// Helper to cleanup file from OpenAI and Vector Store (Modified, Deleted)
async function cleanupFile(FilesInstance, VectorStoresFilesInstance, vectorStoreId, openaiId) {
  if (!openaiId) return
  const openaiFile = await FilesInstance.retrieveFile(openaiId)
  if (openaiFile) {
    const vectorStoreFile = await VectorStoresFilesInstance.retrieveVectorStoresFiles(vectorStoreId, openaiId)
    if (vectorStoreFile) {
      await VectorStoresFilesInstance.deleteVectorStoresFiles(vectorStoreId, openaiId)
      console.log(` • Deleted from Vector Store.`)
    }
    await FilesInstance.deleteFile(openaiId)
    console.log(` • Deleted from OpenAI.`)
  }
}

// Helper to write locally, upload to OpenAI and add to Vector Store (Added, Modified)
async function processUpload(FilesInstance, VectorStoresFilesInstance, vectorStoreId, owner, repo, filePath, ref, datasetPath, name) {
  const content = await GHContent(owner, repo, filePath, ref)
  const localFilePath = path.join(datasetPath, name)

  await fsp.writeFile(localFilePath, JSON.stringify(content), 'utf-8')

  try {
    const fileStream = fs.createReadStream(localFilePath)
    const uploadedFile = await FilesInstance.uploadFile({
      file: fileStream,
      purpose: 'assistants'
    })
    console.log(' • Uploaded to OpenAI')
    await VectorStoresFilesInstance.createVectorStoresFiles(vectorStoreId, {
      file_id: uploadedFile.id
    })
    console.log(' • Added to Vector Store')
  
    return uploadedFile.id
  } finally {
    await fsp.unlink(localFilePath)
  }
}

export async function sync(DBDatasetFilesClass, VectorStoresFilesInstance, FilesInstance, vectorStoreId, datasetGithub, datasetPath) {
  const { owner, repo, dirPath, ref } = datasetGithub

  const [ghFiles, dbFiles] = await Promise.all([
    GHMetadata(owner, repo, dirPath, ref),
    DBDatasetFilesClass.getAll(repo, dirPath)
  ])
  const dbFilesMap = new Map(dbFiles.map(f => [f.gh_file_name, f]))

  for (const ghFile of ghFiles) {
    if (ghFile.type !== 'file') continue

    const { name, path: filePath, sha, /*size*/ } = ghFile
    const dbFile = dbFilesMap.get(name)

    // (Added) File exists in GitHub but doesn't exist in DB
    if (!dbFile) {
      console.log(`(+) File "${name}":`)
      const openaiId = await processUpload(FilesInstance, VectorStoresFilesInstance, vectorStoreId, owner, repo, filePath, ref, datasetPath, name)
      await DBDatasetFilesClass.saveFileInfo(name, repo, dirPath, sha, openaiId)

    // (Unchanged) File exists in GitHub and exists in DB and hashes are identical
    } else if (dbFile.gh_file_hash === sha) {
      console.log(`(=) File "${name}" has not changed.`)
      dbFilesMap.delete(name)

    // (Modified) File exists in GitHub and exists DB but hashes are different
    } else {
      console.log(`(!=) File "${name}":`)
      await cleanupFile(FilesInstance, VectorStoresFilesInstance, vectorStoreId, dbFile.openai_file_id)
      dbFilesMap.delete(name)
      const openaiId = await processUpload(FilesInstance, VectorStoresFilesInstance, vectorStoreId, owner, repo, filePath, ref, datasetPath, name)
      await DBDatasetFilesClass.saveFileInfo(name, repo, dirPath, sha, openaiId)
    }
  }

  // (Deleted) File doesn't exist in GitHub but exists in DB
  for (const [name, dbFile] of dbFilesMap) {
    console.log(`(-) File "${name}":`)
    await cleanupFile(FilesInstance, VectorStoresFilesInstance, vectorStoreId, dbFile.openai_file_id)
    await DBDatasetFilesClass.deleteFile(name, repo, dirPath)
  }
}

// OpenAI Files can't have metadata, so I don't know the hash of the file itself.
// GitHub files are the source of truth.
// The database is used to store file hashes and openai file ids.
// If the db is out of sync or empty, and openai already has the files and the vector store already has files, there's no way to know if the files are the same. In this case, openai files and vector store files should be all deleted and reuploaded.

// An OpenAI file has the upload date, maybe it can be used for something?
// The file name can be up to 255, maybe I can append the hash?