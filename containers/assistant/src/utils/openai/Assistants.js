import { OpenAIWrapper } from './Wrapper.js'

export class OpenAIAssistants extends OpenAIWrapper {
  static instance;

  constructor(apiKey) {
    if (OpenAIAssistants.instance) return OpenAIAssistants.instance
    super(apiKey)
    OpenAIAssistants.instance = this
  }

  static getInstance(apiKey) {
    if (!OpenAIAssistants.instance) OpenAIAssistants.instance = new OpenAIAssistants(apiKey)
    return OpenAIAssistants.instance
  }

  /**
   * Create assistant
   * https://platform.openai.com/docs/api-reference/assistants/createAssistant
   */
  async createAssistant({
    model,
    name,
    description,
    instructions,
    tools,
    tool_resources,
    metadata,
    temperature,
    top_p,
    response_format
  }) {
    try {
      const response = await this.openai.beta.assistants.create({
        model,
        name,
        description,
        instructions,
        tools,
        tool_resources,
        metadata,
        temperature,
        top_p,
        response_format
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * List assistants
   * https://platform.openai.com/docs/api-reference/assistants/listAssistants
   */
  async listAssistants({
    limit,
    order,
    after,
    before
  }) {
    try {
      const response = await this.openai.beta.assistants.list({
        limit,
        order,
        after,
        before
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * Retrieve assistant
   * https://platform.openai.com/docs/api-reference/assistants/getAssistant
   */
  // async retrieveAssistant(assistant_id) {
  //   try {
  //     const response = await this.openai.beta.assistants.retrieve(assistant_id)
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  /**
   * Modify assistant
   * https://platform.openai.com/docs/api-reference/assistants/modifyAssistant
   */
  async updateAssistant(assistant_id, {
    model,
    name,
    description,
    instructions,
    tools,
    tool_resources,
    metadata,
    temperature,
    top_p,
    response_format
  }) {
    try {
      const response = await this.openai.beta.assistants.update(assistant_id, {
        model,
        name,
        description,
        instructions,
        tools,
        tool_resources,
        metadata,
        temperature,
        top_p,
        response_format
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }
}