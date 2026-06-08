# Which API Layer should we use for Client-Server Communication?

---

**Last Update:** 2026-05-31

---

## Context and Problem Statement

Adding a backend requires a defined approach for communication between the Nuxt frontend and the Nitro server. We need an API layer that is maintainable, type-safe, and integrates well with our existing TypeScript-first stack.

## Considered Options

* tRPC
* Nuxt server routes (REST)
* GraphQL (Apollo / URQL)

## Decision Outcome

Chosen option: **"tRPC"**, because

* It provides end-to-end type safety between server and client without requiring a separate schema definition or code generation step.
* Since the frontend and backend live in the same monorepo, tRPC's shared type inference is immediately useful — changing a server procedure signature produces a type error on the client at once.
* It integrates with Nuxt via a Nitro plugin and the `trpc-nuxt` adapter, keeping the setup contained within our existing framework.
* It pairs naturally with Prisma, as Prisma's generated types flow through tRPC procedures directly to the client.

## Pros and Cons of the Options

### tRPC

#### Pros

* **End-to-end type safety**: Procedure input and output types are inferred automatically on the client — no manual type duplication or code generation required.
* **Monorepo synergy**: With client and server in the same repository, type changes propagate immediately, making refactors safer.
* **Prisma integration**: Prisma's return types compose naturally with tRPC's type inference, giving the client accurate types for all database-backed responses.
* **Middleware support**: Authentication, logging, and other cross-cutting concerns can be handled in tRPC middleware, keeping procedures clean.
* **No schema overhead**: Unlike GraphQL, there is no SDL or resolver boilerplate to maintain.

#### Cons

* **Nuxt-specific integration required**: tRPC is not designed for Nuxt out of the box; it requires an adapter (`trpc-nuxt`) and a Nitro plugin to wire up correctly.
* **Not a public API**: tRPC is tightly coupled to TypeScript clients, making it unsuitable if a public or third-party-accessible API is needed in the future.
* **Learning curve**: Developers unfamiliar with tRPC need to understand its router, procedure, and context model before being productive.

### Nuxt Server Routes (REST)

#### Pros

* **Zero additional dependencies**: Nuxt's built-in `server/api/` directory provides REST endpoints with no extra setup.
* **Familiar pattern**: REST is universally understood and toolable (curl, Postman, browser DevTools).
* **Public API compatible**: REST endpoints can be consumed by any HTTP client, not just the Nuxt frontend.

#### Cons

* **No type safety across the boundary**: Request and response types must be manually maintained and kept in sync between client and server, which is error-prone.
* **Boilerplate**: Input validation, error handling, and serialisation must be implemented manually for each route.

### GraphQL (Apollo / URQL)

#### Pros

* **Flexible queries**: Clients can request exactly the fields they need, reducing over-fetching.
* **Strong ecosystem**: Mature tooling for caching, pagination, and subscriptions.
* **Schema as contract**: The SDL serves as explicit documentation of the API surface.

#### Cons

* **High setup overhead**: Requires defining a schema, writing resolvers, and configuring a GraphQL server — significantly more boilerplate than tRPC for an internal API.
* **Redundant in a monorepo**: The schema-as-contract benefit is less valuable when client and server share the same codebase and TypeScript types.
* **Complexity**: GraphQL's caching behaviour, N+1 query problems, and subscription setup add complexity that is not justified for this application's scope.
