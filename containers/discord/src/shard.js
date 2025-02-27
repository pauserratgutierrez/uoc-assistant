import { ShardingManager } from 'discord.js'

const { DISCORD_CLIENT_SECRET: CLIENT_SECRET } = process.env

const manager = new ShardingManager('./src/app.js', {
  token: CLIENT_SECRET,
  totalShards: 'auto',
  shardList: 'auto',
  timeout: 30000,
  respawn: true
})

function shardEvents(shard) {
  const events = [
    { event: 'death', message: 'died' },
    { event: 'disconnect', message: 'disconnected' },
    { event: 'message', message: 'received a message' },
    { event: 'ready', message: 'is ready' },
    { event: 'reconnecting', message: 'is reconnecting' },
    { event: 'resume', message: 'resumed' },
    { event: 'spawn', message: 'spawned' },
    { event: 'error', message: 'encountered an error', handler: (error) => console.error(`Shard ${shard.id} error:`, error) }
  ]

  events.forEach(({ event, message, handler }) => {
    if (handler) {
      shard.on(event, handler)
    } else {
      shard.on(event, () => console.log(`Shard ${shard.id} ${message}`))
    }
  })
}

manager.on('shardCreate', (shard) => {
  console.log(`Shard ${shard.id} created`)
  shardEvents(shard)
})

// Status reporting function (useful for monitoring)
async function reportStatus() {
  try {
    const shardGuildCounts = await manager.fetchClientValues('guilds.cache.size')
    const totalGuilds = shardGuildCounts.reduce((acc, count) => acc + count, 0)
    
    const memberCounts = await manager.broadcastEval(c => 
      c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    )
    const totalMembers = memberCounts.reduce((acc, count) => acc + count, 0)
    
    console.log(`Status: ${manager.shards.size} shards, ${totalGuilds} guilds, approximately ${totalMembers} members`)
  } catch (error) {
    console.error('Error generating status report:', error)
  }
}

async function startBot() {
  try {
    console.log('Preparing to spawn shards...')

    const shards = await manager.spawn({
      amount: manager.totalShards,
      delay: 7000,
      timeout: 30000
    })

    console.log(`Successfully spawned ${shards.size} shards`)

    // Cross-shard communication
    shards.forEach(shard => {
      shard.on('message', message => {
        console.log(`Message from Shard[${shard.id}]:`, message)
      })
    })

    // Initial status report
    setTimeout(async () => {
      await reportStatus()

      // Periodic status report
      setInterval(reportStatus, 60 * 60 * 1000) // Hourly
    }, 10000) // 10 seconds

  } catch (error) {
    if (error.status === 429) {
      const retryAfter = error.headers.get('retry-after') || 5
      console.error(`Rate limited by Discord. Retrying after ${retryAfter} seconds.`)

      setTimeout(() => {
        startBot()
      }, retryAfter * 1000)
    } else {
      console.error('Error spawning shards:', error)
      process.exit(1)
    }
  }
}

startBot()

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down shards...')
  try {
    await manager.broadcastEval((client) => client.destroy())
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  manager.shards.forEach(shard => shard.kill())
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  manager.shards.forEach(shard => shard.kill())
  process.exit(1)
})