import { Router } from 'express'

export function createHealthRouter() {
  const healthRouter = Router()

  healthRouter.get('/status', (req, res) => {
    console.log('✅ Healthy.')
    res.status(200).send('OK')
  })

  return healthRouter
}