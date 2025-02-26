const API_URL = 'http://uoc_assistant:3000'
const ASSISTANT_ENDPOINT = `${API_URL}/assistant`

const response = await fetch(`${ASSISTANT_ENDPOINT}/init`, { method: 'GET' })
const body = await response.json()
const { vectorStoreId } = body.data

await fetch(`${ASSISTANT_ENDPOINT}/sync-dataset`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vectorStoreId }),
})

console.log('Assistant initialized and dataset synced.')