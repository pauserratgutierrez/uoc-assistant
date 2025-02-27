import { OpenAIWrapper } from './Wrapper.js'

export class OpenAIVectorStores extends OpenAIWrapper {
  static instance

  constructor(apiKey) {
    if (OpenAIVectorStores.instance) return OpenAIVectorStores.instance
    super(apiKey)
    OpenAIVectorStores.instance = this
  }

  static getInstance(apiKey) {
    if (!OpenAIVectorStores.instance) OpenAIVectorStores.instance = new OpenAIVectorStores(apiKey)
    return OpenAIVectorStores.instance
  }

  /**
   * Create vector store
   * https://platform.openai.com/docs/api-reference/vector-stores/create
   */
  async createVectorStore({
    file_ids,
    name,
    expires_after,
    chunking_strategy,
    metadata
  }) {
    try {
      const response = await this.openai.beta.vectorStores.create({
        file_ids,
        name,
        expires_after,
        chunking_strategy,
        metadata
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * Update vector store
   * https://platform.openai.com/docs/api-reference/vector-stores/modify
   */
  async updateVectorStore(vector_store_id, {
    name,
    expires_after,
    metadata
  }) {
    try {
      const response = await this.openai.beta.vectorStores.update(vector_store_id, {
        name,
        expires_after,
        metadata
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }
}