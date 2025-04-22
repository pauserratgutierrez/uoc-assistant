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
      .setTitle('Hola 👋!')
      .setDescription(
`Sóc <@${client.user.id}>, una IA que t'ajudarà amb els dubtes que tinguis de la UOC. Segueix llegint per obtenir la millor experiència mentre xateges amb mi.

**Normes**:
- 🚫 No comparteixis informació confidencial o sensible.
- 👁️ Els administradors poden revisar les converses si és necessari.
- 💬 Per defecte, les converses són privades entre nosaltres.

**Fonts de coneixement**:
- [Web UOC](https://uoc.edu)

**Informació addicional**:
- 👥 Convida altres persones a unir-se a la nostra conversa mencionant-les.
- 📑 Un cop el nostre xat es tanqui, esdevindrà només de lectura.
- 🧠 Descobreix més sobre mi al [Repositori de GitHub](https://github.com/pauserratgutierrez/uoc-assistant)

**Com iniciar nous xats**:
1. Fes clic al botó "**:sos: Nou Xat**" de sota.
2. Omple els detalls del xat.
3. Crearé el xat per a nosaltres.
4. Uneix-t'hi i comencem!`
      )
      .setColor(color)
      .setFooter({ text: assistantFooter, iconURL: client.user.displayAvatarURL() })

    const actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('button_chat_new')
          .setLabel('Nou Xat')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🆘'),
        new ButtonBuilder()
          .setLabel('Web UOC')
          .setStyle(ButtonStyle.Link)
          .setEmoji('🎓')
          .setURL('https://uoc.edu'),
        new ButtonBuilder()
          .setLabel("Servei d'Atenció")
          .setStyle(ButtonStyle.Link)
          .setEmoji('🛟')
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