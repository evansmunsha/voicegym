//prisma.ts


import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

let prisma: PrismaClient | null = null;

const getPrismaClient = () => {
  if (prisma) return prisma;
  prisma = new PrismaClient({ adapter });
  return prisma;
};

export default getPrismaClient;
