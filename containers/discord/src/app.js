import { CONFIG } from './config.js'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { assistantChannelSetup } from './utils/channelSetup.js'
import { initAssistant } from './utils/assistant/init.js'
import { syncDataset } from './utils/assistant/syncDataset.js'
import { buttonChatNew } from './utils/newChat.js'
import { modalChatNew } from './utils/newChat.js'

import { getDiscordConfig } from './utils/discordConfig/getConfig.js'
import { saveDiscordConfig } from './utils/discordConfig/saveConfig.js'

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

  // Get Discord configuration
  const { channelId: existingChannelId, roleId: existingRoleId } = await getDiscordConfig(ASSISTANT_URL)
  const guild = client.guilds.cache.first()

  let channelToUse = existingChannelId
  let roleToUse = existingRoleId

  if (!existingChannelId) {
    console.log(`Creating a channel for the AI Assistant...`)
    const channel = await guild.channels.create({
      name: '✨ai-assistant',
      type: 0,
      topic: 'Ask questions about UOC and get AI-powered assistance',
      permissionOverwrites: [
        {
          id: guild.id,
          allow: ['ViewChannel', 'ReadMessageHistory'],
          deny: ['SendMessages']
        }
      ]
    })
    channelToUse = channel.id
  }

  if (!existingRoleId) {
    console.log(`Creating a role for the Assistant Manager...`)
    const role = await guild.roles.create({ name: 'Assistant Manager', color: colorBrand })
    roleToUse = role.id
  }

  await saveDiscordConfig(ASSISTANT_URL, channelToUse, roleToUse)

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