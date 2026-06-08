# Which Database and ORM should we use?

---

**Last Update:** 2026-05-31

---

## Context and Problem Statement

Extending the application with collaborative features requires persistent server-side storage for users, teams, sessions, and file metadata. We need to choose a database and an ORM to interact with it from our Nuxt/Nitro backend.

## Considered Options

* PostgreSQL + Prisma
* MongoDB + Mongoose
* Supabase (managed PostgreSQL)

## Decision Outcome

Chosen option: **"PostgreSQL + Prisma"**, because

* The data model is relational by nature: users belong to teams, teams own sessions, sessions reference files.
* Prisma provides a type-safe query client generated from a schema, which integrates well with our TypeScript-first codebase.
* PostgreSQL is a well-established, production-proven database with strong support for the data types we need (including `bytea` for potential Y.js document storage in the future).
* Prisma's migration system makes schema evolution straightforward as the collaborative feature set grows.

## Pros and Cons of the Options

### PostgreSQL + Prisma

#### Pros

* **Relational model**: Teams, users, sessions, and files map naturally to relational tables with foreign key constraints.
* **Type safety**: Prisma generates a fully typed client from the schema, catching query errors at compile time.
* **Migration tooling**: `prisma migrate` provides a clear, version-controlled schema evolution workflow.
* **Ecosystem maturity**: PostgreSQL is one of the most battle-tested open-source databases available.
* **Future flexibility**: Supports `bytea` columns for binary data (e.g. Y.js documents), full-text search, and JSON fields if needed.

#### Cons

* **Schema rigidity**: Schema changes require explicit migrations, which adds overhead compared to schema-less databases.
* **Setup overhead**: Requires a running PostgreSQL instance, adding infrastructure complexity compared to managed alternatives.

### MongoDB + Mongoose

#### Pros

* **Flexible schema**: Document model is forgiving during early iteration when the data shape is still evolving.
* **Nested documents**: File metadata could be stored as embedded documents rather than joined tables.

#### Cons

* **Poor fit for relational data**: Modelling teams, users, and sessions in a document database requires manual reference management that a relational schema handles automatically.
* **Weaker type safety**: Mongoose schemas are less tightly integrated with TypeScript than Prisma.
* **Transactions**: Multi-document transactions in MongoDB are more limited and less ergonomic than in PostgreSQL.

### Supabase (Managed PostgreSQL)

#### Pros

* **Managed hosting**: No need to run and maintain a PostgreSQL server.
* **Built-in auth and storage**: Supabase bundles authentication and file storage, potentially reducing the number of services needed.
* **Realtime subscriptions**: Built-in Postgres change listeners could simplify the real-time layer.

#### Cons

* **Vendor lock-in**: Supabase-specific features (Row Level Security policies, Realtime) create tight coupling to the platform.
* **Overlapping concerns**: We are already selecting dedicated services for auth and file storage, making Supabase's bundled features redundant.
* **ORM gap**: Supabase's generated client is not as ergonomic as Prisma for complex relational queries.
