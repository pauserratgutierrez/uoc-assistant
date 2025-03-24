/**
 * Client for interacting with the Node.js API from the Assistant Docker container.
 */

export class APIClient {
  constructor() {
    this.API_URL_BASE = `http://assistant:${process.env.ASSISTANT_PORT}`
    this.ASSISTANT_ENDPOINT = '/agent'
    this.DISCORD_ENDPOINT = '/discord'
  }

  // AGENT
  async setupDataset() {
    try {
      const url = `${this.API_URL_BASE}${this.ASSISTANT_ENDPOINT}/dataset/setup`
      const response = await fetch(url, { method: 'GET' })
      const body = await response.json()
      const { vectorStoreId } = body.data
      return { vectorStoreId }
    } catch (error) {
      throw new Error(`Failed to setup dataset: ${error}`)
    }
  }

  // DISCORD
  async getDiscordConfigIds() {
    try {
      const url = `${this.API_URL_BASE}${this.DISCORD_ENDPOINT}/config`
      const response = await fetch(url, { method: 'GET' })
      const body = await response.json()
      const {
        agent_channel_id: assistantChannelId,
        agent_manager_role_id: assistantManagerRoleId
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