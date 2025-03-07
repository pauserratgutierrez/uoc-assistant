import express, { json } from 'express'

import { CONFIG } from './config.js'

import { OpenAIClient } from './utils/openai/Client.js'
import { OpenAIAssistants } from './utils/openai/managers/Assistants.js'
import { OpenAIVectorStores } from './utils/openai/managers/VectorStores.js'
import { OpenAIVectorStoresFiles } from './utils/openai/managers/VectorStoresFiles.js'
import { OpenAIFiles } from './utils/openai/managers/Files.js'

import { DBClient } from './utils/db/Client.js'
import { Schema } from './utils/db/Schema.js'

import { createHealthRouter } from './routes/health.js'
import { createAssistantRouter } from './routes/assistant.js'
import { createDiscordConfigRouter } from './routes/discordConfig.js'

import { AssistantModel } from './models/assistant.js'
import { DiscordConfigModel } from './models/discordConfig.js'

// OpenAI
const aiClient = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })

const assistantsManager = new OpenAIAssistants(aiClient)
const vectorStoresManager = new OpenAIVectorStores(aiClient)
const vectorStoresFilesManager = new OpenAIVectorStoresFiles(aiClient)
const filesManager = new OpenAIFiles(aiClient)

// Database
const DBInstance = DBClient.getInstance({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
})
const schema = new Schema(DBInstance)
await schema.initialize()

// Initialize Models
const assistantModel = new AssistantModel({
  DBInstance,
  assistantsManager,
  vectorStoresManager,
  vectorStoresFilesManager,
  filesManager,
  assistantParams: CONFIG.ASSISTANTS.ASSISTANT.PARAMS,
  vectorStoreParams: CONFIG.ASSISTANTS.VECTOR_STORE.PARAMS,
  datasetGithub: CONFIG.DATASET.GITHUB
})

const discordConfigModel = new DiscordConfigModel({
  DBInstance
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
server.use('/discord-config', createDiscordConfigRouter({ discordConfigModel }))

// 404 Route
server.use((req, res) => res.status(404).send({ error: 'Not Found' }))

const PORT = process.env.ASSISTANT_PORT
server.listen(PORT, () => console.log(`API Server running on port ${PORT}`))