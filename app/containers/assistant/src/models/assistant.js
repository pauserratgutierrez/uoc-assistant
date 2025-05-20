import { toFile } from 'openai'
import { GHContent, GHMetadata } from '../utils/github/utils.js'

export class AssistantModel {
  #db
  #vectorStoreId

  constructor({ db, openai, vectorStoreParams, dataset }) {
    this.#db = db
    this.openai = openai
    this.vectorStoreParams = vectorStoreParams
    this.dataset = dataset
    this.#vectorStoreId = null
  }

  async setupDataset() {
    console.log('Starting dataset setup...')
    let vectorStore = null
    const [vsMK, vsMV] = Object.entries(this.vectorStoreParams.metadata)[0] // First key-value pair

    // Helper function
    const processFiles = async (vectorStore, ghFiles, vsMK, vsMV) => {
      console.log('Processing files...')
  
      for (const file of ghFiles) {
        const { name, sha, download_url, sourceData } = file
        const { owner, repo, branch, path } = sourceData
  
        const ghFileContent = await GHContent(download_url)
        const fileObj = await toFile(Buffer.from(ghFileContent), name)
        const openaiFile = await this.openai.files.create({ file: fileObj, purpose: 'user_data' })
  
        await this.openai.vectorStores.files.createAndPoll(vectorStore.id, {
          file_id: openaiFile.id,
          attributes: {
            [vsMK]: vsMV,
            gh_owner: owner,
            gh_repo: repo,
            gh_path: path,
            gh_branch: branch,
            gh_sha: sha,
            gh_name: name,
          }
        })
        console.log(`File Added: ${name}`)
      }
    }

    // Helper function
    const syncFiles = async (vectorStore, ghFiles, vsFiles, vsMK, vsMV) => {
      const vsFilesMap = new Map(vsFiles.map(f => [f.attributes.gh_name, f]))
      const ghFilesMap = new Map(ghFiles.map(f => [f.name, f]))
  
      for (const ghFile of ghFiles) {
        const vsFile = vsFilesMap.get(ghFile.name)
        if (!vsFile) { // ADDED
          await processFiles(vectorStore, [ghFile], vsMK, vsMV)
        } else if (vsFile.attributes.gh_sha !== ghFile.sha) { // UPDATED
          const { name, sha, download_url, sourceData } = ghFile
          const { owner, repo, branch, path } = sourceData
  
          const ghFileContent = await GHContent(download_url)
          const fileObj = await toFile(Buffer.from(ghFileContent), name)
  
          await this.openai.vectorStores.files.del(vectorStore.id, vsFile.id)
          await this.openai.files.del(vsFile.file_id)
          const openaiFile = await this.openai.files.create({ file: fileObj, purpose: 'user_data' })
  
          await this.openai.vectorStores.files.createAndPoll(vectorStore.id, {
            file_id: openaiFile.id,
            attributes: {
              [vsMK]: vsMV,
              gh_owner: owner,
              gh_repo: repo,
              gh_path: path,
              gh_branch: branch,
              gh_sha: sha,
              gh_name: name,
            }
          })
          console.log(`File Updated: ${name}`)
        } else { // UNCHANGED
          console.log(`File Unchanged: ${ghFile.name}`)
        }
      }
  
      // DELETED
      for (const vsFile of vsFiles) {
        if (!ghFilesMap.has(vsFile.attributes.gh_name)) {
          await this.openai.vectorStores.files.del(vectorStore.id, vsFile.id)
          await this.openai.files.del(vsFile.file_id)
          console.log(`File Deleted: ${vsFile.attributes.gh_name}`)
        }
      }
    }

    try {
      // Get existing Vector Stores
      for await (const vs of this.openai.vectorStores.list({ limit: 20 })) {
        if (vs?.metadata?.[vsMK] === vsMV) {
          // Status: expired, in_progress, completed
          if (vs.status === 'expired') {
            console.log(`Found a Vector Store ${vs.id} that has expired. Skipping...`)
            continue
          }
          vectorStore = vs
          break
        }
      }

      // Get all GitHub files metadata
      console.log('Getting all GitHub files metadata...')
      const ghFiles = []
      await Promise.all(this.dataset.map(async data => {
        const { owner, repo, branch, path } = data
        const metadata = await GHMetadata(owner, repo, branch, path)
        ghFiles.push(...metadata)
      }))
      console.log(`Found a total of ${ghFiles.length} files in GitHub. Processing...`)

      if (!vectorStore) {
        // Create new Vector Store
        console.log('Creating new Vector Store...')
        vectorStore = await this.openai.vectorStores.create(this.vectorStoreParams)
        console.log('Vector Store created with ID:', vectorStore.id)
  
        await processFiles(vectorStore, ghFiles, vsMK, vsMV)
      } else {
        // Sync existing Vector Store
        console.log('Syncing existing Vector Store with ID:', vectorStore.id)
    
        // Get current Vector Store files
        const vsFiles = []
        for await (const file of this.openai.vectorStores.files.list(vectorStore.id, { limit: 100, filter: 'completed' })) {
          vsFiles.push(file)
        }
    
        if (vsFiles.length === 0) { // Empty
          console.log('Vector Store is empty. Adding all GitHub files...')
          await processFiles(vectorStore, ghFiles, vsMK, vsMV)
        } else { // Sync needed
          console.log(`Found ${vsFiles.length} files in Vector Store. Syncing...`)
          await syncFiles(vectorStore, ghFiles, vsFiles, vsMK, vsMV)
        }
      }

      console.log('Dataset setup complete.')

      this.#vectorStoreId = vectorStore.id
      return { vectorStoreId: this.#vectorStoreId }
    } catch (error) {
      console.error('Error in setupDataset:', error)
    }
  }

  async chatResponse({ chatId, platformUserId, platform, content }) {
    try {
      // Check for an existing user
      const userPlatform = await this.#db.findOne('users_platforms',
        { platform, platform_user_id: platformUserId },
      )
      let user_id
      if (!userPlatform) {
        // Create a new user
        const insertResult = await this.#db.insert('users', {})
        user_id = insertResult.insertId
        await this.#db.insert('users_platforms', {
          user_id,
          platform,
          platform_user_id: platformUserId,
        })
        console.log(`Created new user with id ${user_id} for Discord user ${platformUserId}`)
      } else {
        user_id = userPlatform.user_id
        console.log(`Found existing user with id ${user_id} for Discord user ${platformUserId}`)
      }

      // Retrieve previous response ID
      const chatRecord = await this.#db.findOne('chats', {
        user_id,
        platform,
        chat_id: chatId,
      })
      const previous_response_id = chatRecord ? chatRecord.previous_response_id : null
      console.log(`Previous response ID: ${previous_response_id}`)

      // Get current date and time
      const now = new Date()
      const iso = now.toISOString() // Format: YYYY-MM-DDTHH:mm:ss.sssZ

      const response = await this.openai.responses.create({
        model: 'gpt-4.1-mini',
        instructions:
`
You are **Agent UOC**, an AI assistant for Universitat Oberta de Catalunya.
This is a prototype created by Pau Serrat Gutiérrez (TFG 2025) - not an official UOC tool. Here's the source code for the whole project: [GitHub Agent UOC](https://github.com/pauserragutierrez/uoc-assistant)

Your task is to provide accurate and helpful information to users. Follow these guidelines:
- Current date and time: ${iso}
- Always speak in the user's language.
- Use a clear, respectful, and friendly tone.
- Use emojis to enhance the conversation.
- Avoid excessive technical jargon.
- Compliment the answers with relevant links.
- Never share alucinated information and links.
- Allowed Scopes: studies, academic procedures, services, learning resources, regulations.
- Disallowed Scopes: topics outside UOC scope, legal/medical advice, personal data.
- If info is missing or you don't know the answer, ask for it or redirect to the UOC Help Service: [Servei d’Atenció](https://campus.uoc.edu/webapps/campus/estudiant/estudiant/servei_atencio/ca/).
`,
        input: content,
        store: true,
        stream: false,
        temperature: 0.3,
        tool_choice: { type: 'file_search' },
        tools: [{
          type: 'file_search',
          vector_store_ids: [this.#vectorStoreId],
          max_num_results: 10,
          ranking_options: { ranker: 'auto', score_threshold: 0.6 }
        }],
        truncation: 'auto',
        previous_response_id
      })
      const { id: response_id, output_text: response_text } = response
      console.log(`Response ID: ${response_id}`)

      // Upsert chat record
      await this.#db.upsert('chats', {
        user_id,
        platform,
        chat_id: chatId,
        previous_response_id: response_id
      }, ['user_id', 'platform', 'chat_id'])

      return { response_text }
    } catch (error) {
      console.error('Error in chatResponse:', error)
    }
  }

  async deleteChat({ chatId, platformUserId, platform }) {
    try {
      // Check for an existing user
      const userPlatform = await this.#db.findOne('users_platforms',
        { platform, platform_user_id: platformUserId },
      )
      if (!userPlatform) {
        console.log(`User not found for platform user ID ${platformUserId}`)
        return
      }
      const user_id = userPlatform.user_id

      // Delete chat record
      await this.#db.delete('chats', {
        user_id,
        platform,
        chat_id: chatId,
      })
    } catch (error) {
      console.error('Error in deleteChat:', error)
    }
  }
}