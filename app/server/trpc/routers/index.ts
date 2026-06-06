import { createRouter } from '../init'
import { workspaceRouter } from './workspace'

export const router = createRouter({
  workspace: workspaceRouter,
})

export type Router = typeof router
