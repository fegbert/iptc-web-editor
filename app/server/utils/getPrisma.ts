import { PrismaPg } from '@prisma/adapter-pg'
import { env } from 'prisma/config'
import { PrismaClient } from '~/prisma/generated/client'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: env('DATABASE_URL'),
})

const prisma = new PrismaClient({ adapter })

const extendedPrisma = prisma.$extends({})

export type TransactionClient = Omit<ExtendedPrismaClient, '$connect' | '$disconnect' | '$transaction' | '$extends'>
export type ExtendedPrismaClient = typeof extendedPrisma

export default () => extendedPrisma
