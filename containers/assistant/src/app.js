import express, { json } from 'express'

import { CONFIG } from './config.js'

import { OpenAIAssistants } from './utils/openai/Assistants.js'
import { OpenAIVectorStores } from './utils/openai/VectorStores.js'
import { OpenAIVectorStoresFiles } from './utils/openai/VectorStoresFiles.js'
import { OpenAIFiles } from './utils/openai/Files.js'

import { DBWrapper } from './utils/database/Wrapper.js'
import { DBDatasetFiles } from './utils/database/DatasetFiles.js'

import { createAssistantRouter } from './routes/assistant.js'
import { createHealthRouter } from './routes/health.js'

import { AssistantModel } from './models/assistant.js'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) throw new Error('OpenAI API key is required.')

const DB_CREDENTIALS = {
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
}

// OpenAI API
const AssistantInstance = OpenAIAssistants.getInstance(OPENAI_API_KEY)
const VectorStoresInstance = OpenAIVectorStores.getInstance(OPENAI_API_KEY)
const VectorStoresFilesInstance = OpenAIVectorStoresFiles.getInstance(OPENAI_API_KEY)
const FilesInstance = OpenAIFiles.getInstance(OPENAI_API_KEY)

// Database
const DBInstance = DBWrapper.getInstance(DB_CREDENTIALS)
const DBDatasetFilesClass = new DBDatasetFiles(DBInstance)

// Initialize Models
const assistantModel = new AssistantModel({
  AssistantInstance,
  VectorStoresInstance,
  VectorStoresFilesInstance,
  FilesInstance,
  DBDatasetFilesClass,
  assistantParams: CONFIG.ASSISTANTS.ASSISTANT.PARAMS,
  vectorStoreParams: CONFIG.ASSISTANTS.VECTOR_STORE.PARAMS,
  datasetGithub: CONFIG.DATASET.GITHUB,
  datasetPath: CONFIG.DATASET.PATH
})

async function cleanup(DBInstance) {
  try {
    await DBInstance.close()
    console.log('Database connection closed.')
  } catch (error) {
    console.error('Error in cleanup process:', error)
  }
}

process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error)
  await cleanup(DBInstance)
  process.exit(1)
})

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...')
  await cleanup(DBInstance)
  process.exit(0)
})

// API Server
const server = express()
server.use(json())
server.disable('x-powered-by')

// API Routes
server.use('/health', createHealthRouter())
server.use('/assistant', createAssistantRouter({ assistantModel }))

// 404 Route
server.use((req, res) => res.status(404).send({ error: 'Not Found' }))

const PORT = process.env.ASSISTANT_API_PORT
server.listen(PORT, () => console.log(`API Server running on port ${PORT}`))