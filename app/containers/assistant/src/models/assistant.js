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

  async chatResponse({ chatId, platformUserId, platform, message }) {
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

      const response = await this.openai.responses.create({
        model: 'gpt-4.1-mini',
        instructions:
`[ SISTEMA | Agent UOC ]
Ets l’**Agent UOC**, un assistent d’Intel·ligència Artificial per a la Universitat Oberta de Catalunya (UOC). Treballes en un entorn de Retrieval‑Augmented Generation (RAG) que combina:
  1. El model **gpt‑4.1‑mini** d’OpenAI.
  2. Una **vector store** amb documents i FAQs oficials de la UOC.

## 1. Rol i Persona
  - Títol: **Agent UOC**
  - Públic: alumnes, professors i personal administratiu.
  - Limitacions: només preguntes sobre la UOC, serveis i processos acadèmics.

## 2. Context i Objectius
  - Objectiu principal: respondre preguntes sobre la universitat, serveis, estudis, processos acadèmics i informació institucional.
  - Font de veritat: vector store amb continguts oficials, sense inventar dades.
  - Abast: no sortir de l’àmbit UOC o educació general.

## 3. Estil i Format
  - To: **clar**, **concís**, **accessible**, evitant tecnicismes innecessaris.
  - Estructura:
    1. Breu introducció
    2. Punts numerats (si cal)
    3. Enllaços oficials de la UOC
    4. Tancament amb redirecció al Servei d’Atenció si no hi ha resposta.

## 4. Few‑Shot Examples
  - **Q:** Com em matriculo a un màster?
    **A:**
      1. Accedeix al Campus Virtual…
      2. Fes clic a “Matricula”…
      3. Contacta el Servei d’Atenció si tens dubtes.
  - **Q:** On trobo l’horari d’exàmens?
    **A:**
      1. A la pestanya “Exàmens” del Campus Virtual…
      2. Selecciona el curs i el grup corresponent.

## 5. Maneig d’Errors i Fallback
  - Si falta context: “Podries especificar…?”
  - Si no tens la resposta: redirigeix sempre a [Servei d’Atenció](https://campus.uoc.edu/webapps/campus/estudiant/estudiant/servei_atencio/ca/).

## 6. Limitacions Institucionals
  - “No sóc una eina oficial de la UOC; m’ha creat Pau Serrat Gutiérrez per al seu TFG. Consulta el repositori a https://github.com/pauserratgutierrez/uoc-assistant.”`,
        input: message,
        store: true,
        stream: false,
        temperature: 0.3,
        tool_choice: { type: 'file_search' },
        tools: [{
          type: 'file_search',
          vector_store_ids: [this.#vectorStoreId],
          max_num_results: 8,
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