import { PrismaClient } from "@prisma/client";

// Single client across hot reloads / serverless invocations.
// NOTE: contrib_rdb is a shared production DB — prefer a pooled host
// (RDS Proxy) in production; serverless will exhaust raw connections.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnecting?: Promise<void>;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Stable singleton in all environments.
 * Recreating+disconnecting on every Turbopack HMR caused
 * "Engine is not yet connected" under concurrent Promise.all queries.
 * After `prisma generate`, restart `pnpm dev` to pick up schema changes.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

/** Ensure the query engine is ready before a burst of parallel queries. */
export async function ensurePrismaConnected(): Promise<PrismaClient> {
  if (!globalForPrisma.prismaConnecting) {
    globalForPrisma.prismaConnecting = prisma.$connect().catch((err) => {
      globalForPrisma.prismaConnecting = undefined;
      throw err;
    });
  }
  await globalForPrisma.prismaConnecting;
  return prisma;
}

export async function testConnection() {
  try {
    await ensurePrismaConnected();
    console.log("✓ Database connection successful");
    return true;
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    return false;
  }
}

export async function closeConnection() {
  globalForPrisma.prismaConnecting = undefined;
  await prisma.$disconnect();
}

export default prisma;
