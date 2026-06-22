import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { Router } from './trpc/routers'

export type OrgRole = 'org:admin' | 'org:member' | 'org:viewer'

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>

export type FileGetUploadUrlInput = RouterInput['file']['getUploadUrl']
export type FileGetUploadUrlOutput = RouterOutput['file']['getUploadUrl']

export type TemplateListOutput = RouterOutput['template']['list'][number]

export type ProposalListOutput = RouterOutput['proposal']['listForFile']
export type ProposalItem = ProposalListOutput[number]
export type PendingProposalOutput = RouterOutput['proposal']['getPendingProposal']
