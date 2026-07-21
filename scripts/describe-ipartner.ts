import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

import { prisma } from '../src/lib/db';

async function main() {
  try {
    const tables = await prisma.$queryRaw<{ name: string }[]>`
      SELECT table_name AS name
        FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name LIKE '%partner%'
       ORDER BY table_name
    `;
    console.log('\nTables matching %partner%:');
    for (const t of tables) console.log('  -', t.name);

    const cols = await prisma.$queryRaw<
      {
        COLUMN_NAME: string;
        COLUMN_TYPE: string;
        IS_NULLABLE: string;
        COLUMN_DEFAULT: string | null;
        COLUMN_KEY: string;
        EXTRA: string;
      }[]
    >`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
        FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'IPartner'
       ORDER BY ORDINAL_POSITION
    `;
    console.log('\nIPartner columns:');
    for (const c of cols) {
      console.log(
        `  ${c.COLUMN_NAME.padEnd(30)} ${c.COLUMN_TYPE.padEnd(20)} ${c.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL    '} ${c.COLUMN_KEY || ''} ${c.EXTRA || ''}`.trim()
      );
    }
    if (cols.length === 0) console.log('  (no table named IPartner — try a different case/name)');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
