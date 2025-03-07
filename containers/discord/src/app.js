import { CONFIG } from './config.js'

import { Client, Events, GatewayIntentBits } from 'discord.js'

import { APIClient } from './utils/api/Client.js'

import { assistantChannelSetup } from './utils/channelSetup.js'
import { buttonChatNew } from './utils/newChat.js'
import { modalChatNew } from './utils/newChat.js'

const { NAME: assistantName, FOOTER: assistantFooter } = CONFIG.ASSISTANT
const { CORPORATIVE: colorCorp, MASTERBRAND: colorBrand } = CONFIG.COLORS

let assistantChannelId = null
let assistantManagerRoleId = null

// API
const APIInstance = new APIClient()

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

  const vectorStoreId = await APIInstance.initialize()
  await APIInstance.syncDataset(vectorStoreId)

  // The channel or role could be stored in the DB but deleted in Discord. Check if the ids are still valid!
  const discordConfigIds = await APIInstance.getDiscordConfigIds()
  assistantChannelId = discordConfigIds.assistantChannelId
  assistantManagerRoleId = discordConfigIds.assistantManagerRoleId

  const guild = client.guilds.cache.first()

  if (!assistantChannelId) {
    console.log(`Creating a channel for the AI Assistant...`)
    const channel = await guild.channels.create({
      name: '✨ai-assistant',
      type: 0,
      topic: 'Ask questions about UOC and get AI-powered assistance',
      permissionOverwrites: [
        {
          id: guild.id,
          allow: ['ViewChannel', 'SendMessagesInThreads', 'ReadMessageHistory'],
          deny: ['SendMessages', 'CreatePublicThreads', 'CreatePrivateThreads', 'AddReactions', 'SendTTSMessages', 'SendVoiceMessages', 'SendPolls', 'UseApplicationCommands', 'UseExternalApps']
        }
      ]
    })
    assistantChannelId = channel.id
  }

  if (!assistantManagerRoleId) {
    console.log(`Creating a role for the Assistant Manager...`)
    const role = await guild.roles.create({ name: 'Assistant Manager', color: colorBrand })
    assistantManagerRoleId = role.id
  }

  await APIInstance.saveDiscordConfigIds(assistantChannelId, assistantManagerRoleId)

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