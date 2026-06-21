import { createRouter } from '../init'
import { fileRouter } from './file'
import { templateRouter } from './template'

export const router = createRouter({
  file: fileRouter,
  template: templateRouter,
})

export type Router = typeof router
