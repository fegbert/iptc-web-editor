import { createRouter } from '../init'
import { fileRouter } from './file'
import { proposalRouter } from './proposal'
import { templateRouter } from './template'

export const router = createRouter({
  file: fileRouter,
  template: templateRouter,
  proposal: proposalRouter,
})

export type Router = typeof router
