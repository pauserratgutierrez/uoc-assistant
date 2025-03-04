import express, { json } from 'express'

import { CONFIG } from './config.js'

import { OpenAIAssistants } from './utils/openai/Assistants.js'
import { OpenAIVectorStores } from './utils/openai/VectorStores.js'
import { OpenAIVectorStoresFiles } from './utils/openai/VectorStoresFiles.js'
import { OpenAIFiles } from './utils/openai/Files.js'

import { DBService } from './utils/db/Service.js'
import { Schema } from './utils/db/Schema.js'
import { DBDatasetFiles } from './utils/db/DatasetFiles.js'

import { createAssistantRouter } from './routes/assistant.js'
import { createHealthRouter } from './routes/health.js'

import { AssistantModel } from './models/assistant.js'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) throw new Error('OpenAI API key is required.')

// OpenAI API
const AssistantInstance = OpenAIAssistants.getInstance(OPENAI_API_KEY)
const VectorStoresInstance = OpenAIVectorStores.getInstance(OPENAI_API_KEY)
const VectorStoresFilesInstance = OpenAIVectorStoresFiles.getInstance(OPENAI_API_KEY)
const FilesInstance = OpenAIFiles.getInstance(OPENAI_API_KEY)

// Database
const DBInstance = DBService.getInstance({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
})
const schema = new Schema(DBInstance)
await schema.initialize()

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
  datasetGithub: CONFIG.DATASET.GITHUB
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

const PORT = process.env.ASSISTANT_PORT
server.listen(PORT, () => console.log(`API Server running on port ${PORT}`))