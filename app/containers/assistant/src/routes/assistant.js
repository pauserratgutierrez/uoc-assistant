import { Router } from 'express'
import { AssistantController } from '../controllers/assistant.js'

export function createAssistantRouter({ assistantModel }) {
  const assistantRouter = Router()
  const assistantController = new AssistantController({ assistantModel })

  assistantRouter.get('/dataset/setup', assistantController.setupDataset)

  // Chat
  assistantRouter.post('/chat', assistantController.chatResponse)
  assistantRouter.delete('/chat', assistantController.deleteChat)

  return assistantRouter
}