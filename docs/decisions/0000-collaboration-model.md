# Which Collaboration Model should we use for Shared Editing Sessions?

---

**Last Update:** 2026-06-28

---

## Context and Problem Statement

We want to extend the application with collaborative features, including teams and shared editing sessions. Multiple users may need to edit the IPTC metadata of the same JPEG files within a shared workspace. We need to decide how to handle concurrent edits: should we allow true simultaneous editing, restrict editing to one user at a time, or introduce a controlled review workflow?

## Considered Options

* Simultaneous editing with CRDTs (Y.js)
* Lock-and-edit (one editor at a time)
* Proposal-based review workflow with real-time WebSocket sync

## Decision Outcome

Chosen option: **"Proposal-based review workflow with real-time WebSocket sync"**, because

* The IPTC metadata use case is editorial by nature — changes often require a second pair of eyes before they are published, making a review step a natural fit rather than an added burden.
* Lock-and-edit was the original plan but was set aside because it introduces blocking behaviour and lock management complexity without providing the quality control that the editorial workflow actually needs.
* A proposal model avoids conflicts entirely: members submit their intent, admins decide what lands in the canonical record. No merge logic or lock timeouts are required.
* WebSocket broadcast covers real-time presence needs (new files appearing, metadata updates propagating) without the overhead of a full CRDT stack.
* The implementation fits within the available time budget while delivering meaningful collaboration — shared workspaces, role-based access, and an auditable change history.

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
* **Significant time investment**: Implementing, testing, and debugging the full simultaneous editing stack is estimated to take 2–4× longer than the chosen approach.

### Lock-and-Edit (One Editor at a Time)

#### Pros

* **Low implementation complexity**: Only one user holds an edit lock at a time, so no conflict resolution is needed.
* **Predictable write-back**: The user holding the lock is the sole writer, which keeps the JPEG save flow simple and correct.
* **Incremental path**: Lock-and-edit is a natural v1. Y.js can be introduced later for specific fields if simultaneous editing becomes a clear user need.

#### Cons

* **Blocking**: Only one user can edit a given file at a time. Other workspace members must wait for the lock to be released.
* **Lock management overhead**: The server needs to track lock ownership and handle edge cases like a user disconnecting without releasing the lock, requiring a timeout or heartbeat mechanism.
* **No quality control**: A lock does not prevent a user from saving incorrect metadata — it only prevents concurrent edits. The editorial use case still needs a review step on top, which largely negates the simplicity advantage.
* **Less immediate feedback**: Users do not see in-progress edits from the current editor until they save and release the lock.

### Proposal-Based Review Workflow with Real-Time WebSocket Sync ✓

Members submit proposed metadata changes rather than saving directly. Administrators review the proposals in a dedicated interface, approving or rejecting individual fields. Approved values are written to the canonical record and broadcast to all connected clients via WebSocket.

#### Pros

* **Editorial fit**: The review step maps directly to real-world editorial workflows, where metadata changes are checked before publication.
* **No conflict resolution needed**: Competing proposals for the same field are surfaced side by side in the review UI. When one is approved, the others are automatically rejected by the server — no merge logic is required.
* **Auditable**: Every proposed change stores the original and proposed values along with who reviewed it and when, providing a built-in change history.
* **Real-time without CRDTs**: WebSocket events propagate file additions, metadata updates, and proposal status changes to all clients instantly, covering the core real-time collaboration needs without the overhead of a CRDT library.
* **Incremental complexity**: The proposal layer sits on top of the existing `useFileState` model and does not require replacing it. New fields such as `MetadataProposal` and `ProposalChange` extend the schema without breaking the single-user save flow for administrators.

#### Cons

* **Indirect editing for members**: Members cannot directly save metadata; every change goes through the proposal and approval cycle. This adds a step compared to a simple save, which may feel slow for minor corrections.
* **Admin dependency**: The workflow requires at least one active administrator to process proposals. In small teams where everyone has equal trust, the mandatory review step may feel like unnecessary overhead.
* **Client-side state complexity**: The frontend must track which fields are pending review, distinguish them visually from locally edited fields, and keep that state consistent with real-time WebSocket updates — this requires a dedicated composable (`useProposal`) and careful coordination with the existing file state layer.
