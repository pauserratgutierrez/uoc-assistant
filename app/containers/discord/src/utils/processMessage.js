import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'

export async function processMessage(discordThread, discordUserId, APIInstance, vectorStoreId, userMessage, discordAttachments = [], color, assistantFooter) {
  let typingInterval

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

    await discordThread.sendTyping()
    typingInterval = setInterval(() => discordThread.sendTyping(), 10000)

    // AI, API, DB...
    const responseData = await APIInstance.chatResponse({
      vector_store_id: vectorStoreId,
      discord_thread_id: discordThread.id,
      discord_user_id: discordUserId,
      message: userMessage,
    })
    const { response_text } = responseData

    const embed = new EmbedBuilder()
      .setDescription(response_text)
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: discordThread.client.user.displayAvatarURL() })
    const closeButton = new ButtonBuilder()
      .setCustomId('button_chat_end')
      .setLabel('🔒 End Our Chat')
      .setStyle(ButtonStyle.Danger)
    const actionRow = new ActionRowBuilder().addComponents(closeButton)
    await discordThread.send({ embeds: [embed], components: [actionRow] })
  } catch (error) {
    console.log('Failed to process message:', error)
    const embed = new EmbedBuilder()
      .setDescription('🚨 Oops! Something went wrong while processing your message. Please try again later.')
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: discordThread.client.user.displayAvatarURL() })
    await discordThread.send({ embeds: [embed] })
  } finally {
    await discordThread.setLocked(false)
    clearInterval(typingInterval)
  }
}