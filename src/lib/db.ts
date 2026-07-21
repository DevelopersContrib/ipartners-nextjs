import { PrismaClient } from "@prisma/client";

// Single client across hot reloads / serverless invocations.
// NOTE: contrib_rdb is a shared production DB — prefer a pooled host
// (RDS Proxy) in production; serverless will exhaust raw connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Production: one global client (connection pool).
// Development: after `prisma generate`, the old singleton still embeds the
// previous schema and throws. Recreate on each evaluation of this module so
// HMR picks up the new client.
export const prisma: PrismaClient =
  process.env.NODE_ENV === "production"
    ? (globalForPrisma.prisma ??= createPrismaClient())
    : (() => {
        void globalForPrisma.prisma?.$disconnect().catch(() => {});
        const next = createPrismaClient();
        globalForPrisma.prisma = next;
        return next;
      })();

export async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✓ Database connection successful");
    return true;
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    return false;
  }
}

export async function closeConnection() {
  await prisma.$disconnect();
}

export default prisma;
