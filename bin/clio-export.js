#!/usr/bin/env node
// Standalone entry point for the Clio export. The engine lives in @oktopeak/clio-mcp
// (src/cli and src/export there); this package only gives it its own name.
//
//   clio-export auth                  -> clio-mcp auth
//   clio-export --out <folder> [...]  -> clio-mcp export --out <folder> [...]
//   clio-export export --out ...      -> the same, for people who copy the clio-mcp docs
import dotenv from "dotenv";

// A .env file in the folder you run it from is read, so CLIO_CLIENT_ID and
// CLIO_CLIENT_SECRET do not have to be typed into the shell. Shell values win.
dotenv.config({ quiet: true });

// Read by @oktopeak/clio-mcp's help text, so it names this command. Set before the import.
process.env.CLIO_EXPORT_AUTH_COMMAND ??= "npx @oktopeak/clio-export auth";
process.env.CLIO_EXPORT_COMMAND ??= "npx @oktopeak/clio-export";

const argv = process.argv.slice(2);
const forwarded = argv[0] === "auth" || argv[0] === "export" ? argv : ["export", ...argv];

try {
  const { runCli } = await import("@oktopeak/clio-mcp/cli");
  process.exit(await runCli(forwarded));
} catch (error) {
  console.error(`Fatal error: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(5);
}
