export async function initAssistant(assistantUrl) {
  const response = await fetch(`${assistantUrl}/assistant/init`, { method: 'GET' })
  const body = await response.json()
  const { vectorStoreId } = body.data

  return vectorStoreId
}