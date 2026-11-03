// Checks that arguments reach @oktopeak/clio-mcp's CLI and that its help text
// names this package. No network, no Clio account: only paths that exit before login.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/clio-export.js", import.meta.url));
// An empty working folder, so a developer's own .env is never picked up.
const CWD = mkdtempSync(join(tmpdir(), "clio-export-test-"));

function run(...args) {
  const env = { ...process.env };
  for (const k of ["CLIO_CLIENT_ID", "CLIO_CLIENT_SECRET", "CLIO_EXPORT_COMMAND", "CLIO_EXPORT_AUTH_COMMAND"]) delete env[k];
  return spawnSync(process.execPath, [BIN, ...args], { cwd: CWD, env, encoding: "utf8" });
}

test("--help prints the export options under this package's name", () => {
  const r = run("--help");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /npx @oktopeak\/clio-export --out <folder>/);
  assert.match(r.stdout, /--dry-run/);
  assert.doesNotMatch(r.stdout, /@oktopeak\/clio-mcp/);
});

test("export as an explicit subcommand works the same", () => {
  const r = run("export", "--help");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /npx @oktopeak\/clio-export --out <folder>/);
});

test("auth --help names this package", () => {
  const r = run("auth", "--help");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /npx @oktopeak\/clio-export auth/);
});

test("no arguments is a usage error (exit 2)", () => {
  const r = run();
  assert.equal(r.status, 2);
});

test("an unknown option is a usage error (exit 2)", () => {
  const r = run("--out", join(CWD, "x"), "--bogus");
  assert.equal(r.status, 2);
});
