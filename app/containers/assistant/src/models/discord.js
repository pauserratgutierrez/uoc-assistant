export class DiscordModel {
  #db

  constructor({ DBInstance }) {
    this.#db = DBInstance
  }

  async getConfig() {
    const config = await this.#db.findOne('discord_config', {}, '*')
    return {
      config: config || {
        assistant_channel_id: null,
        assistant_manager_role_id: null
      }
    }
  }

  async saveConfig({ channelId, roleId }) {
    const { config: currentConfig } = await this.getConfig()

    const configData = {
      assistant_channel_id: channelId !== undefined ? channelId : currentConfig.assistant_channel_id,
      assistant_manager_role_id: roleId !== undefined ? roleId : currentConfig.assistant_manager_role_id
    }

    if (currentConfig.assistant_channel_id !== null || currentConfig.assistant_manager_role_id !== null) {
      await this.#db.update('discord_config', {
        id: currentConfig.id
      }, configData)
    } else {
      await this.#db.insert('discord_config', configData)
    }
  }
}