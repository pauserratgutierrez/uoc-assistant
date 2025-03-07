/**
 * Client for interacting with the Node.js API from the Assistant Docker container.
 */

export class APIClient {
  constructor() {
    this.API_URL_BASE = `http://assistant:${process.env.ASSISTANT_PORT}`
    this.ASSISTANT_ENDPOINT = '/assistant'
    this.DISCORD_ENDPOINT = '/discord'
  }

  // ASSISTANT
  async initialize() {
    try {
      const url = `${this.API_URL_BASE}${this.ASSISTANT_ENDPOINT}/initialize`
      const response = await fetch(url, { method: 'GET' })
      const body = await response.json()
      const { vectorStoreId } = body.data
      return vectorStoreId
    } catch (error) {
      throw new Error(`Failed to initialize assistant: ${error}`)
    }
  }

  async syncDataset(vectorStoreId) {
    try {
      const url = `${this.API_URL_BASE}${this.ASSISTANT_ENDPOINT}/dataset/sync`
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vectorStoreId }),
      })
    } catch (error) {
      throw new Error(`Failed to sync dataset: ${error}`)
    }
  }

  // DISCORD
  async getDiscordConfigIds() {
    try {
      const url = `${this.API_URL_BASE}${this.DISCORD_ENDPOINT}/config`
      const response = await fetch(url, { method: 'GET' })
      const body = await response.json()
      const {
        assistant_channel_id: assistantChannelId,
        assistant_manager_role_id: assistantManagerRoleId
      } = body.data.config
      return { assistantChannelId, assistantManagerRoleId } // Values or null
    } catch (error) {
      throw new Error(`Failed to get Discord config: ${error}`)
    }
  }

  async saveDiscordConfigIds(channelId, roleId) {
    try {
      const url = `${this.API_URL_BASE}${this.DISCORD_ENDPOINT}/config`
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, roleId }),
      })
    } catch (error) {
      throw new Error(`Failed to save Discord config: ${error}`)
    }
  }
}