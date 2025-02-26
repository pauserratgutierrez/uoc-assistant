import { OpenAIWrapper } from './Wrapper.js'

export class OpenAIFiles extends OpenAIWrapper {
  static instance;

  constructor(apiKey) {
    if (OpenAIFiles.instance) return OpenAIFiles.instance
    super(apiKey)
    OpenAIFiles.instance = this
  }

  static getInstance(apiKey) {
    if (!OpenAIFiles.instance) OpenAIFiles.instance = new OpenAIFiles(apiKey)
    return OpenAIFiles.instance
  }

  /**
   * Upload file
   * https://platform.openai.com/docs/api-reference/files/create
   */
  async uploadFile({
    file,
    purpose
  }) {
    try {
      const response = await this.openai.files.create({
        file,
        purpose
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * Retrieve file
   * https://platform.openai.com/docs/api-reference/files/retrieve
   */
  async retrieveFile(file_id) {
    try {
      const response = await this.openai.files.retrieve(file_id)
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * Delete file
   * https://platform.openai.com/docs/api-reference/files/delete
   */
  async deleteFile(file_id) {
    try {
      const response = await this.openai.files.del(file_id)
      return response
    } catch (error) {
      throw new Error(error)
    }
  }
}