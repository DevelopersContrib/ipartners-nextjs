import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

import { prisma } from '../src/lib/db';

async function main() {
  console.log('Testing connection to contrib_rdb...');
  try {
    await prisma.$connect();
    const rows = await prisma.$queryRaw<
      { db: string; v: string }[]
    >`SELECT DATABASE() as db, VERSION() as v`;
    console.log('✓ Connected');
    console.log('  database:', rows[0]?.db);
    console.log('  version :', rows[0]?.v);
  } catch (err) {
    console.error('✗ Connection failed');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
