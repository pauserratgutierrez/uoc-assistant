import { Router } from 'express'

import { DiscordController } from '../controllers/discord.js'

export function createDiscordRouter({ discordModel }) {
  const discordRouter = Router()

  const discordController = new DiscordController({ discordModel })

  discordRouter.get('/config', discordController.getConfig)
  discordRouter.post('/config', discordController.saveConfig)

  return discordRouter
}