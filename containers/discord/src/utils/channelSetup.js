import { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'

export async function assistantChannelSetup(client, channelId, assistantName, assistantFooter, color) {
  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel) throw new Error(`Assistant channel with ID ${channelId} not found`)

    try {
      const messages = await channel.messages.fetch({ limit: 10 })
      const botMessages = messages.filter(msg => msg.author.id === client.user.id)
      if (botMessages.size > 0) await channel.bulkDelete(botMessages)
    } catch (error) {
      console.log('Failed to cleanup previous messages:', error)
    }

    const embed = new EmbedBuilder()
      .setTitle(assistantName)
      .setDescription(
`Hi 👋, I’m <@${client.user.id}> and I’m here to help us have a great conversation. Please read the text below to get the best experience while chatting with me.

**Guidelines**:
- 🔒 Let's avoid sharing sensitive data.
- 👁️ Conversations might be monitored by Staff if necessary.
- 💬 Our chats are private (by default) between us.

**My Knowledge Sources**:
- [UOC](https://uoc.edu)

**Additional Information**:
- 👥 Invite others to join our conversation by tagging them.
- 📑 Once our chat is closed it becomes read-only.

**How to Start a New Chat**:
1. Click the "**:sos: New Chat**" button below.
2. Fill in the chat details.
3. I'll create the chat for us.
4. Join in, and let's get started!`
      )
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: client.user.displayAvatarURL() })

    const actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('button_chat_new')
          .setLabel('New Chat')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(':sos:'),
        new ButtonBuilder()
          .setLabel('Web UOC')
          .setStyle(ButtonStyle.Link)
          .setEmoji(':mortar_board:')
          .setURL('https://uoc.edu'),
        new ButtonBuilder()
          .setLabel("Servei d'Atenció")
          .setStyle(ButtonStyle.Link)
          .setEmoji(':ring_buoy:')
          .setURL('https://campus.uoc.edu/webapps/campus/estudiant/estudiant/servei_atencio/ca/')
      )

    await channel.send({
      embeds: [embed],
      components: [actionRow]
    })
  } catch (error) {
    console.error('Failed to setup assistant channel:', error)
    throw error
  }
}