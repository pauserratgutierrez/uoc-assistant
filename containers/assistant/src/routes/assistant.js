import { Router } from 'express'

import { AssistantController } from '../controllers/assistant.js'

export function createAssistantRouter({ assistantModel }) {
  const assistantRouter = Router()

  const assistantController = new AssistantController({ assistantModel })

  assistantRouter.get('/initialize', assistantController.initialize)
  assistantRouter.post('/dataset/sync', assistantController.syncDataset)

  return assistantRouter
}