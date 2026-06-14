import { createRouter } from '../init'
import { fileRouter } from './file'

export const router = createRouter({
  file: fileRouter,
})

export type Router = typeof router
