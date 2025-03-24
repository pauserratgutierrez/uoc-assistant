import { Router } from 'express'

export function createHealthRouter() {
  const healthRouter = Router()

  healthRouter.get('/status', (req, res) => res.status(200).send('OK'))

  return healthRouter
}