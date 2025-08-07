import { PrismaClient, JobType, JobStatus } from '@prisma/client'

// ───── singleton, как у тебя было ─────
const prismaClientSingleton = () => new PrismaClient()

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | PrismaClient
}

const prisma = globalThis.prisma ?? prismaClientSingleton()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// ← вот это экспортируем наружу
export { prisma, JobType, JobStatus }
