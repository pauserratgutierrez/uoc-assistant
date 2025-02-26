import { Router } from 'express'

import { AssistantController } from '../controllers/assistant.js'

export function createAssistantRouter({ assistantModel }) {
  const assistantRouter = Router()

  const assistantController = new AssistantController({ assistantModel })

  assistantRouter.get('/init', assistantController.init)
  assistantRouter.post('/sync-dataset', assistantController.syncDataset)

  return assistantRouter
}