import OpenAI from 'openai'

// Not a singleton, envision scenarios where multiple instances with different API keys are possible.
export class OpenAIClient {
  constructor(config = {}) {
    const { apiKey } = config
    if (!apiKey) throw new Error('API key is required to initialize OpenAI client')

    return new OpenAI({ apiKey: apiKey })
  }
}