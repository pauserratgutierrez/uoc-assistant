export async function syncDataset(assistantUrl, vectorStoreId) {
  await fetch(`${assistantUrl}/assistant/sync-dataset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vectorStoreId }),
  })
}