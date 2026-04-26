import { treaty } from '@elysiajs/eden'
import { createEdenTanStackQuery } from 'eden-tanstack-react-query'
import type { App } from 'back/api-types'

const BACK_URL = import.meta.env.VITE_BACK_URL ?? 'http://localhost:420'

export const { EdenProvider, useEden, useEdenClient } =
  createEdenTanStackQuery<App>()

export const edenClient = treaty<App>(BACK_URL)
export const api = edenClient
