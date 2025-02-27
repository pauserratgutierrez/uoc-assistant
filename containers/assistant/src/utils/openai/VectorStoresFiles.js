import { OpenAIWrapper } from './Wrapper.js'

export class OpenAIVectorStoresFiles extends OpenAIWrapper {
  static instance

  constructor(apiKey) {
    if (OpenAIVectorStoresFiles.instance) return OpenAIVectorStoresFiles.instance
    super(apiKey)
    OpenAIVectorStoresFiles.instance = this
  }

  static getInstance(apiKey) {
    if (!OpenAIVectorStoresFiles.instance) OpenAIVectorStoresFiles.instance = new OpenAIVectorStoresFiles(apiKey)
    return OpenAIVectorStoresFiles.instance
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
  // async listVectorStoresFiles(vector_store_id, {
  //   limit,
  //   order,
  //   after,
  //   before,
  //   filter
  // }) {
  //   try {
  //     const response = await this.openai.beta.vectorStores.files.list(vector_store_id, {
  //       limit,
  //       order,
  //       after,
  //       before,
  //       filter
  //     })
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

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