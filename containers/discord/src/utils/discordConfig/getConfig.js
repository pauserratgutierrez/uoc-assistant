export async function getDiscordConfig(assistantUrl) {
  const response = await fetch(`${assistantUrl}/discord-config`, { method: 'GET' })
  const body = await response.json()
  const { config } = body.data
  const { assistant_channel_id: channelId, assistant_manager_role_id: roleId } = config

  return { channelId, roleId }
}