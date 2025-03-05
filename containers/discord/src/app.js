import { CONFIG } from './config.js'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { assistantChannelSetup } from './utils/channelSetup.js'
import { initAssistant } from './utils/assistant/init.js'
import { syncDataset } from './utils/assistant/syncDataset.js'
import { buttonChatNew } from './utils/newChat.js'
import { modalChatNew } from './utils/newChat.js'
  
const ASSISTANT_URL = `http://assistant:${process.env.ASSISTANT_PORT}`
const { ASSISTANT: assistantChannelId } = CONFIG.DISCORD.CHANNELS
const { NAME: assistantName, FOOTER: assistantFooter } = CONFIG.ASSISTANT
const { CORPORATIVE: colorCorp, MASTERBRAND: colorBrand } = CONFIG.COLORS

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

  const vectorStoreId = await initAssistant(ASSISTANT_URL)
  await syncDataset(ASSISTANT_URL, vectorStoreId)

  await assistantChannelSetup(client, assistantChannelId, assistantName, assistantFooter, colorBrand)

  console.log(`Started ${username} #${id} at ${new Date().toLocaleString()}`)
})

client.on(Events.MessageCreate, async (message) => {
  const { bot } = message.author
  const { parentId, ownerId } = message.channel

  if (bot) return
  if (message.channel.isThread() && parentId === assistantChannelId && ownerId === client.user.id) {
    // Generate AI response
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  const { customId: id } = interaction

  if (interaction.isButton()) {
    if (id === 'button_chat_new') await buttonChatNew(interaction)
    if (id === 'button_chat_end') {
      // Button end chat action
    }
  }

  if (interaction.isModalSubmit()) {
    if (id === 'modal_chat_new') await modalChatNew(interaction, assistantFooter, colorBrand)
  }
})

client.login()
  .catch(error => {
    console.error('Failed to login:', error)
    process.exit(1)
  })