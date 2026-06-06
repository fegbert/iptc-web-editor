import { PrismaClient } from '~/prisma/generated/client'

const prisma = new PrismaClient()

const extendedPrisma = prisma.$extends({})

export type TransactionClient = Omit<ExtendedPrismaClient, '$connect' | '$disconnect' | '$transaction' | '$extends'>
export type ExtendedPrismaClient = typeof extendedPrisma

export default () => extendedPrisma
