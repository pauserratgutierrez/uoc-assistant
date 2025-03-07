export class DiscordConfigController {
  constructor({ discordConfigModel }) {
    this.discordConfigModel = discordConfigModel
  }

  getConfig = async (req, res) => {
    try {
      const { config } = await this.discordConfigModel.getConfig()
      res.json({ data: { config } })
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }

  saveConfig = async (req, res) => {
    const { channelId, roleId } = req.body
    try {
      await this.discordConfigModel.saveConfig({ channelId, roleId })
      res.status(204).send()
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }
}