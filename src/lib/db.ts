import { PrismaClient } from "@prisma/client";

// Single client across hot reloads / serverless invocations.
// NOTE: contrib_rdb is a shared production DB — prefer a pooled host
// (RDS Proxy) in production; serverless will exhaust raw connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
