# Which Collaboration Model should we use for Shared Editing Sessions?

---

**Last Update:** 2026-05-27

---

## Context and Problem Statement

We want to extend the application with collaborative features, including teams and shared editing sessions. Multiple users may need to edit the IPTC metadata of the same JPEG files within a shared session. We need to decide how to handle concurrent edits: should we allow true simultaneous editing, or restrict editing to one user at a time?

## Considered Options

* Simultaneous editing with CRDTs (Y.js)
* Lock-and-edit (one editor at a time)

## Decision Outcome

Chosen option: **"Lock-and-edit"**, because

* The implementation complexity of simultaneous editing is easily 2–4× higher and not justified given the available time budget.
* Lock-and-edit covers the majority of the collaborative UX value: shared sessions, team access, and presence awareness (seeing who is working on a file).
* The JPEG write-back problem — determining when and how a merged Y.js document is serialized back into a binary file — is uniquely complex in this application compared to typical document editors, making simultaneous editing harder to get right.
* The decision can be revisited and Y.js layered on top once the rest of the collaborative stack (auth, database, real-time presence) is in place.

## Pros and Cons of the Options

### Simultaneous Editing with CRDTs (Y.js)

#### Pros

* **No waiting**: Multiple users can edit different fields at the same time without blocking each other.
* **Conflict-free merging**: Y.js handles concurrent edits automatically using CRDTs, so no manual conflict resolution logic is needed.
* **Best collaborative UX**: Users see each other's changes in real time, which is the gold standard for collaborative tools.

#### Cons

* **Y.js integration complexity**: IPTC fields need to be modelled as Y.js shared types and bound bidirectionally to Vue form inputs, which requires largely replacing the existing `useFileState` composable.
* **Persistence complexity**: Y.js documents must be stored server-side (e.g. as a `bytea` column in Postgres or in Redis) and kept in sync with the canonical metadata record.
* **JPEG write-back problem**: Unlike text documents, the final output is a binary JPEG file. A clear strategy is needed for when and how the merged Y.js state is serialized back into the image — this is non-trivial when multiple users can trigger a save simultaneously.
* **Significant time investment**: Implementing, testing, and debugging the full simultaneous editing stack is estimated to take 2–4× longer than lock-and-edit.

### Lock-and-Edit (One Editor at a Time)

#### Pros

* **Low implementation complexity**: Only one user holds an edit lock at a time, so no conflict resolution is needed. The existing `useFileState` model transfers almost directly to the server.
* **Predictable write-back**: The user holding the lock is the sole writer, which keeps the JPEG save flow simple and correct.
* **Presence awareness**: Users can still see who is in the session and which file is being edited, providing meaningful collaboration without the complexity of merging.
* **Incremental path**: Lock-and-edit is a natural v1. Y.js can be introduced later for specific fields (e.g. long-form caption) if simultaneous editing becomes a clear user need.

#### Cons

* **Blocking**: Only one user can edit a given file at a time. Other session members must wait for the lock to be released.
* **Lock management**: The server needs to track lock ownership and handle cases like a user disconnecting without releasing the lock (e.g. via a timeout or heartbeat).
* **Less immediate feedback**: Users do not see in-progress edits from the current editor until they save and release the lock.
