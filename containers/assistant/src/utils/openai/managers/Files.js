export class OpenAIFiles {
  constructor(openai) {
    if (!openai) throw new Error('OpenAI Client is required')
    this.openai = openai
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