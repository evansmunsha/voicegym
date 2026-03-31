import { PrismaClient } from '../generated/prisma'

let prisma: PrismaClient | null = null

const getPrismaClient = () => {
  if (prisma) {
    return prisma
  }
  
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
    return prisma
  }

  let globalForPrisma = global as typeof globalThis & {
    prisma: PrismaClient | null
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  
  prisma = globalForPrisma.prisma
  return prisma
}

export default getPrismaClient
