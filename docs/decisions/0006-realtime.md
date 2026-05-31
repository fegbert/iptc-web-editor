# Which Real-Time Communication Solution should we use?

---

**Last Update:** 2026-05-31

---

## Context and Problem Statement

Collaborative features require real-time communication between the server and connected clients. Specifically, the application needs to broadcast presence information (who is in a session), lock state changes (which file is currently being edited and by whom), and save events to all participants in a shared session. We need to decide which technology to use for this real-time layer.

## Considered Options

* Nitro WebSockets (native, via `crossws`)
* Socket.io
* Server-Sent Events (SSE)

## Decision Outcome

Chosen option: **"Nitro WebSockets (native, via `crossws`)"**, because

* Nitro, the server underlying Nuxt, has built-in WebSocket support through `crossws` — no additional server process or dependency is required.
* The real-time requirements for lock-and-edit collaboration (presence updates, lock acquisition and release, save notifications) are well within what plain WebSockets handle comfortably.
* Keeping real-time within Nitro avoids introducing a separate runtime or process, which simplifies deployment on Coolify.
* `crossws` is adapter-agnostic, meaning the WebSocket code will work across different Nitro deployment targets without changes.

## Pros and Cons of the Options

### Nitro WebSockets (native, via `crossws`)

#### Pros

* **Zero extra dependencies**: WebSocket support is built into Nitro; no additional package or server process is needed.
* **Deployment simplicity**: Real-time runs inside the same Nuxt/Nitro process, requiring no changes to the Docker setup or Coolify configuration.
* **Adapter-agnostic**: `crossws` abstracts over Node.js, Bun, Deno, and other runtimes, future-proofing the implementation.
* **Sufficient for lock-and-edit**: Presence, lock state, and save notifications are low-frequency, low-complexity events that do not require the abstractions Socket.io provides.

#### Cons

* **Lower-level API**: Nitro's WebSocket API is more bare-bones than Socket.io, meaning rooms, broadcasting helpers, and reconnection logic must be implemented manually.
* **No built-in fallback**: Unlike Socket.io, there is no automatic fallback to long-polling for clients that cannot establish a WebSocket connection (though this is rarely an issue in modern browsers).

### Socket.io

#### Pros

* **Feature-rich**: Built-in support for rooms, namespaces, broadcasting, and automatic reconnection.
* **Fallback transport**: Automatically falls back to long-polling if WebSockets are unavailable.
* **Large ecosystem**: Extensive documentation, many examples, and wide adoption.

#### Cons

* **Separate server required**: Socket.io runs its own HTTP server, which must be integrated with or run alongside the Nitro server, complicating the deployment setup.
* **Overkill**: The room and namespace abstractions are more than needed for our collaboration model, which only requires session-scoped broadcasting.
* **Extra dependency weight**: Adds a significant dependency for functionality that Nitro already provides natively.

### Server-Sent Events (SSE)

#### Pros

* **Simpler protocol**: SSE is unidirectional (server to client) and uses plain HTTP, making it easy to implement and debug.
* **Automatic reconnection**: Browsers handle reconnection natively without any client-side logic.
* **No WebSocket upgrade required**: Works through HTTP/2 and is less likely to be blocked by proxies or firewalls.

#### Cons

* **Unidirectional**: SSE only pushes data from server to client. Client-to-server messages (e.g. acquiring a lock, releasing a lock) still require separate HTTP requests, adding round-trip latency and complexity.
* **Connection limits**: Browsers limit the number of concurrent SSE connections per origin, which can become a constraint with multiple open tabs.
* **Not a natural fit**: Lock-and-edit collaboration involves bidirectional signalling; SSE's unidirectional nature makes it a partial solution that requires a hybrid approach.
