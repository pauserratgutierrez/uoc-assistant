  // // THREADS

  // /**
  //  * Create thread
  //  * https://platform.openai.com/docs/api-reference/threads/createThread
  //  */
  // async createThread({
  //   messages,
  //   tool_resources,
  //   metadata,
  // }) {
  //   try {
  //     const response = await this.openai.beta.threads.create({
  //       messages,
  //       tool_resources,
  //       metadata
  //     })
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  // // /**
  // //  * Retrieve thread
  // //  * https://platform.openai.com/docs/api-reference/threads/getThread
  // //  */
  // // async retrieveThread(thread_id) {
  // //   try {
  // //     const response = await this.openai.beta.threads.retrieve(thread_id)
  // //     return response
  // //   } catch (error) {
  // //     throw new Error(error)
  // //   }
  // // }

  // /**
  //  * Delete thread
  //  * https://platform.openai.com/docs/api-reference/threads/deleteThread
  //  */
  // async deleteThread(thread_id) {
  //   try {
  //     const response = await this.openai.beta.threads.del(thread_id)
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  // // MESSAGES

  // /**
  //  * Create message
  //  * https://platform.openai.com/docs/api-reference/messages/createMessage
  //  */
  // async createThreadMessage(thread_id, {
  //   role,
  //   content,
  //   attachments,
  //   metadata,
  // }) {
  //   try {
  //     const response = await this.openai.beta.threads.messages.create(thread_id, {
  //       role,
  //       content,
  //       attachments,
  //       metadata
  //     })
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  // // /**
  // //  * List messages
  // //  * https://platform.openai.com/docs/api-reference/messages/listMessages
  // //  */
  // // async listThreadMessages(thread_id, {
  // //   limit,
  // //   order,
  // //   after,
  // //   before,
  // //   run_id
  // // }) {
  // //   try {
  // //     const response = await this.openai.beta.threads.messages.list(thread_id, {
  // //       limit,
  // //       order,
  // //       after,
  // //       before,
  // //       run_id
  // //     })
  // //     return response
  // //   } catch (error) {
  // //     throw new Error(error)
  // //   }
  // // }

  // /**
  //  * Retrieve message
  //  * https://platform.openai.com/docs/api-reference/messages/getMessage
  //  */
  // async retrieveThreadMessage(thread_id, message_id) {
  //   try {
  //     const response = await this.openai.beta.threads.messages.retrieve(thread_id, message_id)
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  // /**
  //  * Delete message
  //  * https://platform.openai.com/docs/api-reference/messages/deleteMessage
  //  */
  // async deleteThreadMessage(thread_id, message_id) {
  //   try {
  //     const response = await this.openai.beta.threads.messages.del(thread_id, message_id)
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  // // RUNS

  // /**
  //  * Create run
  //  * https://platform.openai.com/docs/api-reference/runs/createRun
  //  */
  // async createThreadRun(thread_id, {
  //   include,
  //   assistant_id,
  //   model,
  //   instructions,
  //   additional_instructions,
  //   additional_messages,
  //   tools,
  //   metadata,
  //   temperature,
  //   top_p,
  //   stream,
  //   max_prompt_tokens,
  //   max_completion_tokens,
  //   truncation_strategy,
  //   tool_choice,
  //   parallel_tool_calls,
  //   response_format,
  // }) {
  //   try {
  //     const response = await this.openai.beta.threads.runs.create(thread_id, {
  //       include,
  //       assistant_id,
  //       model,
  //       instructions,
  //       additional_instructions,
  //       additional_messages,
  //       tools,
  //       metadata,
  //       temperature,
  //       top_p,
  //       stream,
  //       max_prompt_tokens,
  //       max_completion_tokens,
  //       truncation_strategy,
  //       tool_choice,
  //       parallel_tool_calls,
  //       response_format,
  //     })
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  // /**
  //  * Submit tool outputs to run
  //  * https://platform.openai.com/docs/api-reference/runs/submitToolOutputs
  //  */
  // async submitThreadToolOutputsRun(thread_id, run_id, {
  //   tool_outputs,
  //   stream
  // }) {
  //   try {
  //     const response = await this.openai.beta.threads.runs.submitToolOutputs(thread_id, run_id, {
  //       tool_outputs,
  //       stream
  //     })
  //     return response
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }