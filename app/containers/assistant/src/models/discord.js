export class DiscordModel {
  #db

  constructor({ db }) {
    this.#db = db
  }

  async getConfig() {
    const config = await this.#db.findOne('config_discord', {}, '*')
    return {
      config: config || {
        agent_channel_id: null,
        agent_manager_role_id: null
      }
    }
  }

  async saveConfig({ channelId, roleId }) {
    const { config: currentConfig } = await this.getConfig()

    const configData = {
      agent_channel_id: channelId !== undefined ? channelId : currentConfig.agent_channel_id,
      agent_manager_role_id: roleId !== undefined ? roleId : currentConfig.agent_manager_role_id
    }

    if (currentConfig.agent_channel_id !== null || currentConfig.agent_manager_role_id !== null) {
      await this.#db.update('config_discord', {
        id: currentConfig.id
      }, configData)
    } else {
      await this.#db.insert('config_discord', configData)
    }
  }
}