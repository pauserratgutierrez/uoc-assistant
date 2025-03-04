import { CONFIG } from './config.js'
import { Client, Events, GatewayIntentBits } from 'discord.js'

const { ASSISTANT: ASSISTANT_CHANNEL_ID } = CONFIG.DISCORD.CHANNELS

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.once(Events.ClientReady, async (readyClient) => {
  const { username, id } = readyClient.user

  console.log(`Started ${username} #${id} at ${new Date().toLocaleString()}`)
})

client.on(Events.MessageCreate, async (message) => {
  const { bot } = message.author
  const { parentId, ownerId } = message.channel

  if (bot) return
  if (message.channel.isThread() && parentId === ASSISTANT_CHANNEL_ID && ownerId === client.user.id) {
    // Generate AI response
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  const { customId: id } = interaction

  if (interaction.isButton()) {
    if (id === 'button_chat_new') {
      // Button new chat action
    }
    if (id === 'button_chat_end') {
      // Button end chat action
    }
  }

  if (interaction.isModalSubmit()) {
    if (id === 'modal_chat_new') {
      // Modal new chat action
    }
  }
})

client.login()
  .catch(error => {
    console.error('Failed to login:', error)
    process.exit(1)
  })

// const ASSISTANT_URL = `http://assistant:${process.env.ASSISTANT_PORT}`

// const response = await fetch(`${ASSISTANT_URL}/assistant/init`, { method: 'GET' })
// const body = await response.json()
// const { vectorStoreId } = body.data

// await fetch(`${ASSISTANT_URL}/assistant/sync-dataset`, {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ vectorStoreId }),
// })