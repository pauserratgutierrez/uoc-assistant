export class AssistantController {
  constructor({ assistantModel }) {
    this.assistantModel = assistantModel
  }

  // Arrow functions do not have their own "this" context, they inherit it from the surrounding lexical context. Using them so "this" context remains consistent, so no need to bind in the router.
  init = async (req, res) => {
    try {
      const { vectorStoreId } = await this.assistantModel.init()
      res.json({ data: { vectorStoreId } })
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }

  syncDataset = async (req, res) => {
    const { vectorStoreId } = req.body
    try {
      await this.assistantModel.syncDataset({ vectorStoreId })
      res.status(204).send()
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }
}