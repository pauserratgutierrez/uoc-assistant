export const CONFIG = {
  ASSISTANTS: {
    ASSISTANT: {
      PARAMS: {
        model: 'gpt-4o-mini',
        name: 'UOC Assistant',
        description: "Agent d'intel·ligència artificial per al servei d'atenció de la UOC",
        instructions:
`Ets 'UOC Agent', l'agent d'intel·ligència artificial per al servei d'atenció de la Universitat Oberta de Catalunya (UOC). La teva missió és respondre a les preguntes dels estudiants, professors o personal administratiu. Tens accés a file search.`,
        tools: [ { type: 'file_search' } ],
        metadata: { custom_tag: 'uoc_assistant' }, // Lookup purposes, do not change!
        temperature: 0.5,
        top_p: 0.5,
        response_format: 'auto'
      }
    },
    VECTOR_STORE: {
      PARAMS: {
        name: 'UOC Agent - Vector Store',
        expires_after: { anchor: 'last_active_at', days: 4 },
        chunking_strategy: { type: 'auto' },
        // chunking_strategy: {
        //   type: 'static',
        //   static: { max_chunk_size_tokens: 500, chunk_overlap_tokens: 250 }
        // },
        // metadata: { custom_tag: 'uoc_assistant_vectorstore' } // Lookup purposes, do not change!
      }
    },
  },
  DATASET: {
    GITHUB: [
      {
        owner: 'codesnippetspro',
        repo: 'cady-extractors',
        dirPath: 'cloud-app/dataset',
        ref: 'main'
      },
      // Additional repositories can be added here
    ]
  },
  MODEL_PRICING: {
    'gpt-4o': { promptTokenCost: 2.5/1000000, completionTokenCost: 10/1000000 },
    'gpt-4o-mini': { promptTokenCost: 0.15/1000000, completionTokenCost: 0.6/1000000 }
  }
}