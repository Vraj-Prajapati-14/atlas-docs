import type { FastifyInstance } from 'fastify'
import { aggregatorsRoutes } from './aggregators.routes.js'

export async function aggregatorsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(aggregatorsRoutes)
}
