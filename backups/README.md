# D1 snapshots

Gzipped SQL dumps of the production database, written automatically by
[`.github/workflows/backup.yml`](../.github/workflows/backup.yml) every day at
03:17 UTC (and on demand from the Actions tab).

```
store-2026-10-28T03-17-42-681Z.sql.gz
      └── database name  └── UTC timestamp, millisecond precision
```

- **Reading one:** `gunzip -c backups/store-….sql.gz | less` — plain SQL
  (`CREATE TABLE`, `INSERT INTO`), no Cloudflare tooling needed.
- **Restoring:** Actions → **Restore D1** → path of the snapshot → type
  `restore`. Locally: `npm run db:restore -- backups/<file>.sql.gz --yes`.
- **Retention:** the newest 30 snapshots are kept (repository variable
  `BACKUP_KEEP` overrides it). Older ones are pruned in the same commit.
- **Content:** `products` (articles, prices, all three languages), `orders` and
  `order_items`, `newsletter`. No credentials, no customer payment data — the
  checkout is a demo and never stores card details.

The Worker creates its tables on the first request, so an empty database plus a
deploy is enough to start from the bundled catalogue (`app/src/data/seed.json`).
