export class AssistantController {
  constructor({ assistantModel }) {
    this.assistantModel = assistantModel
  }

  // Arrow functions do not have their own "this" context, they inherit it from the surrounding lexical context. Using them so "this" context remains consistent, so no need to bind in the router.
  setupDataset = async (req, res) => {
    try {
      const { vectorStoreId } = await this.assistantModel.setupDataset()
      res.json({ data: { vectorStoreId } })
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }
}