export class OpenAIVectorStores {
  constructor(openai) {
    if (!openai) throw new Error('OpenAI Client is required')
    this.openai = openai
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