import { Router } from 'express'

import { DiscordConfigController } from '../controllers/discordConfig.js'

export function createDiscordConfigRouter({ discordConfigModel }) {
  const discordConfigRouter = Router()

  const discordConfigController = new DiscordConfigController({ discordConfigModel })

  discordConfigRouter.get('/', discordConfigController.getConfig)
  discordConfigRouter.post('/', discordConfigController.saveConfig)

  return discordConfigRouter
}