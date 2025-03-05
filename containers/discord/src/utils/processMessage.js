import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'

export async function processMessage(discordThread, userMessage, discordAttachments = [], color, assistantFooter) {
  try {
    await discordThread.setLocked(true)

    const content = []

    if (userMessage && userMessage.trim()) {
      content.push({ type: 'text', text: userMessage.trim() })
    }

    if (discordAttachments.length > 0) {
      if (!userMessage || !userMessage.trim()) {
        content.push({ type: 'text', text: 'Attachment(s):' })
      }

      discordAttachments.forEach(a => {
        content.push({ type: 'image_url', image_url: { url: a.url } })
      })
    }

    if (content.length === 0) {
      content.push({ type: 'text', text: 'No message content provided.' })
    }

    // AI, API, DB...

    await discordThread.sendTyping()
    const typingInterval = setInterval(() => discordThread.sendTyping(), 10000)

    const response = 'This is a dummy response simulating the AI Assistant response.'

    const embed = new EmbedBuilder()
      .setDescription(response)
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: discordThread.client.user.displayAvatarURL() })
    const closeButton = new ButtonBuilder()
      .setCustomId('button_chat_end')
      .setLabel('🔒 End Our Chat')
      .setStyle(ButtonStyle.Danger)
    const actionRow = new ActionRowBuilder().addComponents(closeButton)
    await discordThread.send({ embeds: [embed], components: [actionRow] })
    
    clearInterval(typingInterval)
    await discordThread.setLocked(false)
  } catch (error) {
    console.log('Failed to process message:', error)
    const embed = new EmbedBuilder()
      .setDescription('🚨 Oops! Something went wrong while processing your message. Please try again later.')
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: discordThread.client.user.displayAvatarURL() })
    await discordThread.send({ embeds: [embed] })
  }
}