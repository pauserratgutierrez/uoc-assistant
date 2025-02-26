import OpenAI from 'openai'

// Not a singleton, envision scenarios where multiple instances with different API keys are possible.
export class OpenAIWrapper {
  constructor(apiKey) {
    if (!apiKey) throw new Error('API key is required to initialize OpenAIWrapper')
    this.openai = new OpenAI(apiKey)
  }
}