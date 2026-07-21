import { prisma } from './db';
import { Prisma } from '@prisma/client';

export async function transaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

export async function transactionBatch<T extends unknown[]>(
  queries: [...T]
): Promise<T> {
  return prisma.$transaction(queries as never) as Promise<T>;
}

export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = ${tableName}
    `;
    return Number(result[0].count) > 0;
  } catch {
    return false;
  }
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function getPaginationParams(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
}
