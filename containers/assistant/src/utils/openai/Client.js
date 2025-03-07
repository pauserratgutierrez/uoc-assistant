import OpenAI from 'openai'

import { OpenAIAssistants } from './managers/Assistants.js'
import { OpenAIVectorStores } from './managers/VectorStores.js'
import { OpenAIVectorStoresFiles } from './managers/VectorStoresFiles.js'
import { OpenAIFiles } from './managers/Files.js'

// Not a singleton (multiple instances with different API keys could be needed)
export class OpenAIClient {
  constructor(config = {}) {
    const { apiKey } = config
    if (!apiKey) throw new Error('API key is required to initialize OpenAI client')

    this.client = new OpenAI({ apiKey: apiKey })

    this.assistantsM = new OpenAIAssistants(this.client)
    this.vectorStoresM = new OpenAIVectorStores(this.client)
    this.vectorStoresFilesM = new OpenAIVectorStoresFiles(this.client)
    this.filesM = new OpenAIFiles(this.client)
  }
}