/**
 * Server entry point.
 * Builds the Fastify app and starts listening.
 */

import { buildApp } from './app.js'
import { config } from './config/index.js'

async function start(): Promise<void> {
  const app = await buildApp()

  try {
    await app.listen({ port: config.PORT, host: config.HOST })
    app.log.info(`Atlas API running at http://${config.HOST}:${config.PORT}`)
    app.log.info(`Environment: ${config.NODE_ENV}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  const app = await buildApp()
  await app.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  const app = await buildApp()
  await app.close()
  process.exit(0)
})

void start()
