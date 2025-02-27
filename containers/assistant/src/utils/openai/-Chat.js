import { OpenAIWrapper } from './Wrapper.js'

export class OpenAIChat extends OpenAIWrapper {
  static instance

  constructor(apiKey) {
    if (OpenAIChat.instance) return OpenAIChat.instance
    super(apiKey)
    OpenAIChat.instance = this
  }

  static getInstance(apiKey) {
    if (!OpenAIChat.instance) OpenAIChat.instance = new OpenAIChat(apiKey)
    return OpenAIChat.instance
  }

  /**
   * Create chat completion
   * https://platform.openai.com/docs/api-reference/chat/create
   */
  async createCompletion({
    messages,
    model,
    store,
    reasoning_effort,
    metadata,
    frequency_penalty,
    logit_bias,
    logprobs,
    top_logprobs,
    max_completion_tokens,
    n,
    modalities,
    prediction,
    audio,
    presence_penalty,
    response_format,
    seed,
    service_tier,
    stop,
    stream,
    stream_options,
    temperature,
    top_p,
    tools,
    tool_choice,
    parrallel_tool_calls,
    user,
  }) {
    try {
      const response = await this.openai.chat.completions.create({
        messages,
        model,
        store,
        reasoning_effort,
        metadata,
        frequency_penalty,
        logit_bias,
        logprobs,
        top_logprobs,
        max_completion_tokens,
        n,
        modalities,
        prediction,
        audio,
        presence_penalty,
        response_format,
        seed,
        service_tier,
        stop,
        stream,
        stream_options,
        temperature,
        top_p,
        tools,
        tool_choice,
        parrallel_tool_calls,
        user,
      })
      return response
    } catch (error) {
      throw new Error(error)
    }
  }
}