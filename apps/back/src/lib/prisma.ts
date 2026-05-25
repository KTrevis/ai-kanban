import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaLibSql({
  url: getDatabaseUrl(),
});

export const prisma = new PrismaClient({
  adapter,
  omit: {
    kanbanCard: {
      useTravailleMcp: true,
    },
  },
});

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';

  if (!url.startsWith('file:')) {
    return url;
  }

  const filePath = url.slice('file:'.length);

  if (filePath.startsWith('/')) {
    return url;
  }

  const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

  return `file:${resolve(appRoot, filePath)}`;
}
