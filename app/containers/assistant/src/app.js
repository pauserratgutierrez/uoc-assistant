import express, { json } from 'express'

import { CONFIG } from './config.js'

import { OpenAIWrapper } from './utils/openai/OpenAI.js'

import { DBClient } from './utils/db/Client.js'

import { createHealthRouter } from './routes/health.js'
import { createAssistantRouter } from './routes/assistant.js'
import { createDiscordRouter } from './routes/discord.js'

import { AssistantModel } from './models/assistant.js'
import { DiscordModel } from './models/discord.js'

// OpenAI
const openaiWrapper = new OpenAIWrapper({ apiKey: process.env.OPENAI_API_KEY })
const openai = openaiWrapper.getClient()

// Database
const db = DBClient.getInstance({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
})

// Initialize Models
const assistantModel = new AssistantModel({ db, openai, vectorStoreParams: CONFIG.VECTOR_STORE_PARAMS, dataset: CONFIG.DATASET_GITHUB })
const discordModel = new DiscordModel({ db })

async function cleanup(db) {
  try {
    await db.close()
    console.log('Database connection closed.')
  } catch (error) {
    console.error('Error in cleanup process:', error)
  }
}

process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error)
  await cleanup(db)
  process.exit(1)
})

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...')
  await cleanup(db)
  process.exit(0)
})

// API Server
const server = express()
server.use(json())
server.disable('x-powered-by')

// API Routes
server.use('/health', createHealthRouter())
server.use('/agent', createAssistantRouter({ assistantModel }))
server.use('/discord', createDiscordRouter({ discordModel }))

// 404 Route
server.use((req, res) => res.status(404).send({ error: 'Not Found' }))

// Auto-sync Dataset on Startup
await assistantModel.setupDataset()

const PORT = process.env.ASSISTANT_PORT
server.listen(PORT, () => console.log(`API Server running on port ${PORT}`))