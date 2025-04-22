import { processMessage } from './processMessage.js'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, MessageFlags } from 'discord.js'

export async function buttonChatNew(interaction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('modal_chat_new')
      .setTitle('Inicia un nou xat')

    const questionInput = new TextInputBuilder()
      .setCustomId('modal_input_question')
      .setLabel('Com et puc ajudar avui?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)

    const actionRow = new ActionRowBuilder().addComponents(questionInput)
    modal.addComponents(actionRow)

    await interaction.showModal(modal)
  } catch (error) {
    console.log('Failed to open new chat modal:', error)
  }
}

export async function modalChatNew(interaction, APIInstance, assistantFooter, color) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const question = interaction.fields.getTextInputValue('modal_input_question')

    const discordThread = await interaction.channel.threads.create({
      name: question.substring(0, 100).trim(),
      autoArchiveDuration: 10080,
      type: 12, // GUILD_PUBLIC_THREAD: 11, GUILD_PRIVATE_THREAD: 12, GUILD_NEWS_THREAD: 10
      reason: `Agent chat for ${interaction.user.tag}`
    })
    await discordThread.members.add(interaction.user.id)

    const embed = new EmbedBuilder()
      .setTitle('✨ Inici del nostre xat')
      .setDescription(`- 📌 **Pregunta inicial**: \n\`\`\`${question}\`\`\``)
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: interaction.client.user.displayAvatarURL() })
    await discordThread.send({ embeds: [embed] })

    await interaction.editReply({ content: `✨ El nostre xat està llest!\n🔗 Uneix-te aquí: ${discordThread.url}.` })

    await processMessage(discordThread, interaction.user.id, APIInstance, question, [], color, assistantFooter)
  } catch (error) {
    console.log('Failed to create new chat:', error)
    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: `🚨 Oops! Something went wrong while setting up our chat. Please try again later.` });
      } else {
        await interaction.reply({ content: `🚨 Oops! Something went wrong while setting up our chat. Please try again later.`, flags: MessageFlags.Ephemeral })
      }
    } catch (replyError) {
      console.log('Failed to send error message to user:', replyError);
    }
  }
}

export async function buttonCloseChat(interaction, APIInstance, assistantFooter, color) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const thread = interaction.channel
    const userId = interaction.user.id

    if (thread.locked) return await interaction.editReply({ content: '🔒 La conversa ja està tancada.'})
    await thread.setLocked(true)

    await APIInstance.deleteChat({ chatId: thread.id, platformUserId: userId })

    const closeEmbed = new EmbedBuilder()
      .setDescription(`🔒 La conversa ha estat tancada per <@${userId}>.`)
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: interaction.client.user.displayAvatarURL() })
    await thread.send({ embeds: [closeEmbed] })

    await interaction.editReply({ content: '🔒 La conversa ha estat tancada.' })
    await thread.setArchived(true)
  } catch (error) {
    console.log('Failed to close chat:', error)
    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: `🚨 Oops! Something went wrong while closing the chat. Please try again later.` });
      } else {
        await interaction.reply({ content: `🚨 Oops! Something went wrong while closing the chat. Please try again later.`, flags: MessageFlags.Ephemeral })
      }
    } catch (replyError) {
      console.log('Failed to send error message to user:', replyError);
    }
  }
}