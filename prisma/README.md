# Prisma Database Management (`prisma/`)

This directory contains the database schema definition, migrations, and seed scripts for Claypresso.

---

## Files

- `schema.prisma`: Complete declarative data models for users, products, categories, orders, order items, addresses, payments, custom orders, reviews, and discounts.
- `seed.ts`: Seed script populating default categories, products, images, collections, coupons, and the studio admin account.
- `dev.db`: Default SQLite database file used for zero-configuration local development.

---

## Commands

```bash
# Push schema updates directly to the database without manual SQL migrations
npm run db:push

# Re-generate Prisma Client TypeScript bindings
npx prisma generate

# Execute the seed script
npm run db:seed

# Open Prisma Studio GUI in browser
npx prisma studio
```

---

## Switching to PostgreSQL for Cloud Production

In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Set `DATABASE_URL` in `.env` to your PostgreSQL connection string, then run `npm run db:push` and `npm run db:seed`.
