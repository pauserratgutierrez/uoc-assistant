import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'

export async function processMessage(discordThread, discordUserId, APIInstance, userMessage, discordAttachments = [], color, assistantFooter) {
  let typingInterval

  try {
    await discordThread.setLocked(true)

    let input

    if (discordAttachments.length > 0) {
      // Image or image+text: use array/object format
      const contentArr = []
      if (userMessage && userMessage.trim()) {
        contentArr.push({ type: 'input_text', text: userMessage.trim() })
      }
      discordAttachments.forEach(a => {
        contentArr.push({ type: 'input_image', image_url: a.url })
      })
      input = [
        {
          role: 'user',
          content: contentArr
        }
      ]
    } else {
      // Text only: send as string
      input = userMessage && userMessage.trim()
        ? userMessage.trim()
        : 'No message content provided.'
    }

    await discordThread.sendTyping()
    typingInterval = setInterval(() => discordThread.sendTyping(), 10000)

    const responseData = await APIInstance.chatResponse({
      chatId: discordThread.id,
      platformUserId: discordUserId,
      // message: userMessage,
      content: input
    })
    const { response_text } = responseData

    const embed = new EmbedBuilder()
      .setDescription(response_text)
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: discordThread.client.user.displayAvatarURL() })
    const closeButton = new ButtonBuilder()
      .setCustomId('button_chat_end')
      .setLabel('🔒 Finalitzar Xat')
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