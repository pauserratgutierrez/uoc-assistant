export async function saveDiscordConfig(assistantUrl, channelId, roleId) {
  await fetch(`${assistantUrl}/discord-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId, roleId })
  })
}