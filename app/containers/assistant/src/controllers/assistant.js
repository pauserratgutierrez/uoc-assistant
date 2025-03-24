export class AssistantController {
  constructor({ assistantModel }) {
    this.assistantModel = assistantModel
  }

  setupDataset = async (req, res) => {
    try {
      const { vectorStoreId } = await this.assistantModel.setupDataset()
      res.json({ data: { vectorStoreId } })
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }

  chatResponse = async (req, res) => {
    try {
      const { vector_store_id, discord_thread_id, discord_user_id, message } = req.body
      const { response_text } = await this.assistantModel.chatResponse({
        vector_store_id,
        discord_thread_id,
        discord_user_id,
        message
      })

      res.json({ data: { response_text } })
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }
}