# Clio Export: download everything from Clio, documents included

Free, open-source command that copies a whole [Clio Manage](https://www.clio.com) account onto your own computer:

- every matter, contact, note, task, calendar entry, time entry, expense and bill, as JSON and CSV files
- every document, as a file in a folder per matter, with your Clio folder structure kept

It only reads from Clio and never writes anything back. It runs on your machine, under your own Clio developer app, so the data goes from Clio straight to your disk and nowhere else.

```bash
npx @oktopeak/clio-export auth
npx @oktopeak/clio-export --out ./clio-export
```

Walkthrough: **[oktopeak.com/clio-export/](https://oktopeak.com/clio-export/?utm_source=github&utm_medium=readme&utm_campaign=clio-export&utm_content=top)**

MIT licence. Built and maintained by [Oktopeak](https://oktopeak.com/?utm_source=github&utm_medium=readme&utm_campaign=clio-export&utm_content=byline).

---

## Why you would use it

Clio's built-in export (admins only) gives you CSV files for matters, contacts, notes, tasks, calendar, communications, time and expenses. It does not include your **documents**, your **bills** or your **trust transactions**. Clio itself recommends that you keep a local backup of your data, and after an account is cancelled Clio deletes its content no less than 90 days later.

So the usual reasons are:

- a backup copy of the firm's records and documents that the firm holds itself
- a full copy before you cancel or change practice management software
- a one-time archive of closed matters
- data for an auditor, a reporting tool or a spreadsheet, without exporting screen by screen

## Before you start

1. **Node.js 20 or later** ([nodejs.org](https://nodejs.org)). Check with `node --version`.
2. **A Clio developer app.** Sign in at [developers.clio.com](https://developers.clio.com) with your Clio login, then Developer Apps, Add. Set the redirect URI to exactly `http://127.0.0.1:5678/callback`, save, and copy the client ID and the client secret.
3. **Tell the command which app to use.** Either set the values in your shell:

   ```bash
   # macOS / Linux
   export CLIO_CLIENT_ID=your_client_id CLIO_CLIENT_SECRET=your_client_secret CLIO_REGION=us
   ```

   ```powershell
   # Windows PowerShell
   $env:CLIO_CLIENT_ID = "your_client_id"
   $env:CLIO_CLIENT_SECRET = Read-Host "Clio client secret"
   $env:CLIO_REGION = "us"
   ```

   or put the same three lines in a `.env` file in the folder you run the command from. `CLIO_REGION` is `us`, `eu`, `ca` or `au`: the server your firm logs in to (`app.clio.com` is `us`, `eu.app.clio.com` is `eu`).

4. **Log in once:** `npx @oktopeak/clio-export auth` opens your browser, saves the login encrypted on this computer, and prints who logged in.

## Run it

Count first. A dry run writes nothing but a `REPORT.md` with the number of records and documents and an estimate of how long the real run takes:

```bash
npx @oktopeak/clio-export --out ./clio-export --dry-run
```

Then the real run, into an empty folder (preferably on an encrypted disk):

```bash
npx @oktopeak/clio-export --out ./clio-export
```

Stopped halfway, laptop closed, Ctrl-C? Run the same command with `--resume`. It continues where it stopped, with no duplicate rows.

## What comes out

```
clio-export/
  data/<type>.jsonl            raw records, one per line, exactly as Clio returns them
  data/<type>.csv              the same records for Excel
  matters/<number> - <client>/ documents, mirroring the Clio folder structure
  REPORT.md                    what was exported, what was not, and why
  manifest.json, checkpoint/, errors.jsonl
```

Record types: matters, contacts, users, practice areas, custom field definitions, matter stages, relationships, tasks, calendar entries, notes, time entries, expenses, bills, folders and documents. On request with `--only`: document versions, communications, allocations, trust line items and bank transactions.

`REPORT.md` only calls an export COMPLETE when every required record type matches the count Clio reported at the start. Anything it could not read is named there.

## What it does not include

- Ledger reports (trust ledger, client ledger, accounts receivable, work in progress). Run those from Clio's reports.
- Bill PDFs as Clio renders them. Bills come out as data.
- Original email files.
- Documents that belong to no matter. They are counted and reported, not downloaded yet.
- Anything your own Clio user is not allowed to see. Run it as an admin.

## How long it takes

Clio allows about 50 API requests a minute per login during business hours. The default rate of 0.8 requests a second stays under that. Each page of 200 records is one request and each document at least one more, so a firm with 100,000 documents needs well over a day. Start it on a Friday and let it run over the weekend. `--dry-run` gives the estimate for your account.

## Options

| Option | What it does |
|---|---|
| `--out <folder>` | Required. Empty, or a previous export. |
| `--dry-run` | Count only. Writes `REPORT.md` and nothing else. |
| `--resume` | Continue a stopped run in the same folder. |
| `--since <date>` | Only records changed after this date, where Clio supports it. |
| `--only <list>` | Comma separated record types, for example `matters,folders,documents`. |
| `--no-documents` | Records only, no files. |
| `--rate <n>` | Requests per second, default 0.8. |
| `--concurrency <n>` | Parallel downloads, default 3, at most 8. |

Exit codes: 0 done, 1 done with errors or incomplete, 2 bad usage, 3 not logged in or login expired, 4 interrupted (run again with `--resume`), 5 fatal error.

Running the same command again without `--resume` refreshes the copy: records are fetched again, documents already on disk with the same size and version are skipped, and nothing is ever deleted.

## Privacy and safety

- Read-only by construction: the export code contains no call that writes to Clio, and a test fails if one is ever added.
- The Clio login is sent only to the Clio API, never to the storage link Clio redirects document downloads to.
- Progress lines, logs and error files carry record types, ids, counts and status codes only. Never names, document titles or client data.
- **The export folder holds confidential client data in plaintext.** Keep it on an encrypted disk and treat it like the files in Clio.

## Other ways to get your data out

This is not the only option, and for some firms it is not the right one:

- **Clio's built-in export** is enough if spreadsheets of your records are all you need.
- **[FileScience](https://www.clio.com/app-directory/filescience/)** runs a hosted, daily cloud-to-cloud backup of Clio; the copy is kept in FileScience's cloud.
- **[Faster Suite](https://www.clio.com/app-directory/faster-suite/)** has a backup tool that downloads all Clio documents.
- **[Clio Data Escrow](https://help.clio.com/hc/en-us/articles/9290346939547)** keeps a weekly copy of Clio information and documents in a secure location.

This command is free, runs when you start it, and puts everything in one folder you control. If you want a nightly copy into the firm's own OneDrive, SharePoint or S3 that runs without anyone starting it, we set that up: [oktopeak.com/services/clio-backup/](https://oktopeak.com/services/clio-backup/?utm_source=github&utm_medium=readme&utm_campaign=clio-export&utm_content=alternatives).

## How it is built

This package is a thin command-line entry point. The export engine lives in [`@oktopeak/clio-mcp`](https://github.com/oktopeak/clio-mcp), our open-source connector between Claude and Clio, which also offers it as `npx @oktopeak/clio-mcp export`. Bugs and questions about the export: [open an issue here](https://github.com/oktopeak/clio-export/issues). Full technical reference: [clio-mcp README, Exporting your whole account](https://github.com/oktopeak/clio-mcp#exporting-your-whole-account).

Clio is a trademark of Themis Solutions Inc. This project is not affiliated with or endorsed by Clio.

## Licence

MIT. See [LICENSE](LICENSE).
