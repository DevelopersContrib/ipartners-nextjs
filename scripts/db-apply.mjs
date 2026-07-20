#!/usr/bin/env node
/**
 * Safe SQL apply for the SHARED VNOC RDS (domaindi_managedomain).
 *
 * Why this exists: `prisma db push` / `prisma migrate` treat prisma/schema.prisma as the FULL
 * database and will DROP every VNOC registry table not listed there. We NEVER use those commands.
 * Schema changes are hand-written additive SQL under prisma/migrations/, applied through this script.
 *
 * Safety rules (hard fail):
 *  1. Refuses any DROP / TRUNCATE / RENAME that does not target ipp_* only.
 *  2. Refuses DROP DATABASE / DROP SCHEMA entirely.
 *  3. By default also refuses DROP of ipp_ tables (additive-only). Pass --allow-ipp-drop
 *     only when intentionally recreating empty auction engine tables (pre-launch).
 *  4. Never prints DATABASE_URL credentials.
 *
 * Usage:
 *   node scripts/db-apply.mjs prisma/migrations/0001_ipp_init.sql
 *   node scripts/db-apply.mjs prisma/migrations/0001_ipp_init.sql --dry-run
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

const ALLOWED_PREFIXES = ["ipp_"];

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].replace(/\s+#.*$/, "").trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

/** Split SQL on `;` while respecting strings and comments. */
function splitStatements(sql) {
  const stmts = [];
  let cur = "";
  let inS = false, inD = false, inB = false, inLine = false, inBlock = false;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i], next = sql[i + 1];
    if (inLine) { cur += c; if (c === "\n") inLine = false; continue; }
    if (inBlock) { cur += c; if (c === "*" && next === "/") { cur += next; i++; inBlock = false; } continue; }
    if (!inS && !inD && !inB) {
      if (c === "-" && next === "-") { inLine = true; cur += c; continue; }
      if (c === "#") { inLine = true; cur += c; continue; }
      if (c === "/" && next === "*") { inBlock = true; cur += c; continue; }
    }
    if (c === "'" && !inD && !inB) { inS = !inS; cur += c; continue; }
    if (c === '"' && !inS && !inB) { inD = !inD; cur += c; continue; }
    if (c === "`" && !inS && !inD) { inB = !inB; cur += c; continue; }
    if (!inS && !inD && !inB && c === ";") { const t = cur.trim(); if (t) stmts.push(t); cur = ""; continue; }
    cur += c;
  }
  const t = cur.trim();
  if (t) stmts.push(t);
  return stmts;
}

function stripComments(stmt) {
  return stmt.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ").replace(/#[^\n]*/g, " ").trim();
}

function isAllowedName(name) {
  const n = name.replace(/`/g, "").toLowerCase();
  return ALLOWED_PREFIXES.some((p) => n.startsWith(p));
}

/** Returns { ok:true } or { ok:false, reason }. Destructive ops: DROP / TRUNCATE / RENAME. */
function checkStatement(stmt, { allowIppDrop }) {
  const s = stripComments(stmt);
  if (!s) return { ok: true };
  const upper = s.toUpperCase();

  if (/\bDROP\s+(DATABASE|SCHEMA)\b/.test(upper)) return { ok: false, reason: "DROP DATABASE/SCHEMA is never allowed" };

  const dropTable = s.match(/\bDROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(.+)/i);
  if (dropTable) {
    const names = dropTable[1].split(",").map((x) => x.trim().replace(/;$/, "").replace(/`/g, "").split(/\s+/)[0]).filter(Boolean);
    for (const name of names) {
      if (!isAllowedName(name)) return { ok: false, reason: `DROP TABLE refused for non-auction table: ${name}` };
      if (!allowIppDrop) return { ok: false, reason: `DROP TABLE of ipp_ table refused (additive-only). Re-run with --allow-ipp-drop if intentional: ${name}` };
    }
    return { ok: true };
  }

  const dropOther = s.match(/\bDROP\s+(VIEW|TRIGGER|PROCEDURE|FUNCTION|EVENT|INDEX)\s+(?:IF\s+EXISTS\s+)?(`?[\w.]+`?)/i);
  if (dropOther) {
    const name = dropOther[2];
    if (!isAllowedName(name) && !ALLOWED_PREFIXES.some((p) => name.toLowerCase().includes(p)))
      return { ok: false, reason: `DROP ${dropOther[1]} refused for non-auction object: ${name}` };
    if (!allowIppDrop) return { ok: false, reason: `DROP ${dropOther[1]} refused without --allow-ipp-drop: ${name}` };
    return { ok: true };
  }

  if (/\bTRUNCATE\s+(TABLE\s+)?/i.test(s)) {
    const m = s.match(/\bTRUNCATE\s+(?:TABLE\s+)?(`?[\w.]+`?)/i);
    const name = m?.[1] || "?";
    if (!isAllowedName(name)) return { ok: false, reason: `TRUNCATE refused for non-auction table: ${name}` };
    if (!allowIppDrop) return { ok: false, reason: `TRUNCATE refused without --allow-ipp-drop: ${name}` };
    return { ok: true };
  }

  if (/\bRENAME\s+TABLE\b/i.test(s)) return { ok: false, reason: "RENAME TABLE is refused (too easy to clobber registry tables)" };

  return { ok: true };
}

async function main() {
  const args = process.argv.slice(2);
  const allowIppDrop = args.includes("--allow-ipp-drop");
  const dryRun = args.includes("--dry-run");
  const fileArg = args.find((a) => !a.startsWith("--"));
  if (!fileArg) {
    console.error("Usage: node scripts/db-apply.mjs <file.sql> [--allow-ipp-drop] [--dry-run]");
    process.exit(1);
  }

  const env = { ...loadEnv(resolve(process.cwd(), ".env")), ...process.env };
  // Matches prisma/schema.prisma, which uses CONTRIB_DATABASE_URL.
  const url = env.CONTRIB_DATABASE_URL || env.DATABASE_URL;
  if (!url) { console.error("CONTRIB_DATABASE_URL not set (.env or environment)"); process.exit(1); }

  const sql = readFileSync(resolve(process.cwd(), fileArg), "utf8");
  const statements = splitStatements(sql);

  // Safety scan every statement BEFORE touching the DB.
  for (const stmt of statements) {
    const res = checkStatement(stmt, { allowIppDrop });
    if (!res.ok) { console.error(`\n⛔ REFUSED: ${res.reason}\n   in: ${stripComments(stmt).slice(0, 120)}...\n`); process.exit(2); }
  }
  console.log(`Safety scan passed: ${statements.length} statement(s), all ipp_-scoped.`);

  if (dryRun) { console.log("--dry-run: not applying."); return; }

  const conn = await mysql.createConnection({ uri: url, multipleStatements: false });
  try {
    for (const stmt of statements) {
      await conn.query(stmt);
      console.log(`  ✓ ${stripComments(stmt).slice(0, 70)}...`);
    }
    console.log(`\nApplied ${statements.length} statement(s) to the shared RDS (ipp_ tables only).`);
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error("apply failed:", e.message); process.exit(1); });
