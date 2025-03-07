export class OpenAIVectorStoresFiles {
  constructor(openai) {
    if (!openai) throw new Error('OpenAI Client is required')
    this.openai = openai
  }

  /**
   * Create vector store file
   * https://platform.openai.com/docs/api-reference/vector-stores-files/createFile
   */
  async createVectorStoresFiles(vector_store_id, {
    file_id,
    chunking_strategy
  }) {
    try {
      const response = await this.openai.beta.vectorStores.files.create(vector_store_id, {
        file_id,
        chunking_strategy
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * List vector store files
   * https://platform.openai.com/docs/api-reference/vector-stores-files/listFiles
   */
  async listVectorStoresFiles(vector_store_id, {
    limit,
    order,
    after,
    before,
    filter
  }) {
    try {
      const response = await this.openai.beta.vectorStores.files.list(vector_store_id, {
        limit,
        order,
        after,
        before,
        filter
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * Retrieve vector store files
   * https://platform.openai.com/docs/api-reference/vector-stores-files/getFile
   */
  async retrieveVectorStoresFiles(vector_store_id, file_id) {
    try {
      const response = await this.openai.beta.vectorStores.files.retrieve(vector_store_id, file_id)
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * Delete vector store file
   * https://platform.openai.com/docs/api-reference/vector-stores-files/deleteFile
   */
  async deleteVectorStoresFiles(vector_store_id, file_id) {
    try {
      const response = await this.openai.beta.vectorStores.files.del(vector_store_id, file_id)
      return response
    } catch (error) {
      throw new Error(error)
    }
  }
}