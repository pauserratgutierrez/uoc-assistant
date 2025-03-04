import { sync } from '../utils/dataset/sync.js'

export class AssistantModel {
  constructor({ assistantsManager, vectorStoresManager, vectorStoresFilesManager, filesManager, DBDatasetFilesManager, assistantParams, vectorStoreParams, datasetGithub }) {
    this.assistantsManager = assistantsManager
    this.vectorStoresManager = vectorStoresManager
    this.vectorStoresFilesManager = vectorStoresFilesManager
    this.filesManager = filesManager
    this.DBDatasetFilesManager = DBDatasetFilesManager
    this.assistantParams = assistantParams
    this.vectorStoreParams = vectorStoreParams
    this.datasetGithub = datasetGithub
  }

  async getAllAssistants() {
    const assistants = []
    let after = null
    while (true) {
      const { data } = await this.assistantsManager.listAssistants({ limit: 100, after })
      if (!data || data.length === 0) break
      assistants.push(...data)
      after = data[data.length - 1].id
    }
    return assistants
  }

  async init() {
    try {
      const assistants = await this.getAllAssistants()
      const [assistantMK, assistantMV] = Object.entries(this.assistantParams.metadata)[0]

      // Create or update
      let assistant = assistants.find(a => a?.metadata?.[assistantMK] === assistantMV)
      if (assistant) {
        assistant = await this.assistantsManager.updateAssistant(assistant.id, this.assistantParams)
        console.log(`(=) Assistant "${assistant.name}" (ID: ${assistant.id}) found`)
      } else {
        assistant = await this.assistantsManager.createAssistant(this.assistantParams)
        console.log(`(+) Assistant "${assistant.name}" (ID: ${assistant.id}) created`)
      }

      // Create Vector Store (and assign) or update
      const assistantVSIds = assistant.tool_resources?.file_search?.vector_store_ids
      let VS
      if (assistantVSIds && assistantVSIds.length > 0) {
        VS = await this.vectorStoresManager.updateVectorStore(assistantVSIds[0], this.vectorStoreParams)
        console.log(`(=) Vector Store "${VS.name}" (ID: ${VS.id}) found is already assigned to Assistant "${assistant.name}" (ID: ${assistant.id})`)
      } else {
        VS = await this.vectorStoresManager.createVectorStore(this.vectorStoreParams)
        await this.assistantsManager.updateAssistant(assistant.id, {
          tool_resources: { file_search: { vector_store_ids: [VS.id] } }
        })
        console.log(`(+) Vector Store "${VS.name}" (ID: ${VS.id}) created and assigned to Assistant "${assistant.name}" (ID: ${assistant.id})`)
      }

      return { vectorStoreId: VS.id }
    } catch (error) {
      throw error
    }
  }

  async syncDataset({ vectorStoreId }) {
    if (!vectorStoreId) throw new Error('Vector Store ID is required.')
    if (!this.datasetGithub || this.datasetGithub.length === 0) throw new Error('GitHub Dataset config is empty.')

    console.log(`Syncing dataset for ${this.datasetGithub.length} repositories`)

    for (const i of this.datasetGithub) {
      await sync(this.DBDatasetFilesManager, this.vectorStoresFilesManager, this.filesManager, vectorStoreId, i)
    }

    console.log('Sync complete')
  }
}