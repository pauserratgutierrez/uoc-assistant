export const CONFIG = {
  VECTOR_STORE_PARAMS: {
    chunking_strategy: { type: 'auto' },
    expires_after: { anchor: 'last_active_at', days: 4 },
    metadata: { lookup_id: 'uoc_agent' }, // Always as first key-value pair!
    name: 'UOC Agent',
  },
  DATASET_GITHUB: [
    {
      owner: 'pauserratgutierrez',
      repo: 'uoc-assistant',
      branch: 'main',
      path: 'dataset/data/formatted',
    },
    // Additional repositories can be added here
  ]
}