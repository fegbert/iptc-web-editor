# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (run from root)
pnpm install

# Start the dev server (http://localhost:3000)
pnpm -C app dev

# Build for production
pnpm -C app build

# Preview production build
pnpm -C app preview

# Run parser unit tests
pnpm -C parser test

# Run parser tests in watch mode
pnpm -C parser test:watch

# Build the parser library (required after parser changes before the app picks them up)
pnpm -C parser build

# Lint (run from root or within a package)
pnpm lint

# Database (run from app/)
pnpm -C app db:migrate    # create and apply a migration
pnpm -C app db:push       # push schema changes without a migration file (prototyping only)
pnpm -C app db:studio     # open Prisma Studio in the browser
pnpm -C app db:generate   # regenerate the Prisma client after schema changes
```

## Local development setup

Start the local Postgres database with Docker before running the dev server:

```bash
docker compose up -d
```

Copy `app/.env.example` to `app/.env` and fill in the values. The default values in `.env.example` match the Docker Compose setup and work out of the box for local development.

## Architecture

This is a pnpm workspace with two packages: `parser/` and `app/`.

### `parser/` — `iptc-parser` npm package

A standalone TypeScript library consumed by `app/` as a `workspace:*` dependency. It has no runtime dependencies beyond `browser-fs-access`.

- `src/jpeg-iim/reader.ts` — locates and parses the APP13/Photoshop IRB segment in a JPEG buffer, extracting all IIM datasets into a `Record<string, string>` keyed by `"record:dataset"` (e.g. `"2:80"`)
- `src/jpeg-iim/writer.ts` — serialises a metadata record back into a JPEG buffer and writes it via the File System Access API or saves to a path
- `src/index.ts` — public surface: `parseMetadata(buffer)` and `writeMetadata(image, metadata, path?, fileHandle?, name?)`

After editing parser source, run `pnpm -C parser build` to regenerate `parser/dist/` before the app reflects the changes.

### `app/` — Nuxt 4 frontend

A single-page dashboard (`pages/index.vue`) with Nuxt UI for components and Tailwind CSS 4 for styling.

**Global state via composables** — module-level `ref()` values make these composables act as stores. Do not call `useFiles()` etc. expecting isolated per-component state.

| Composable | Responsibility |
|---|---|
| `useFiles` | Loads/adds/removes files from IndexedDB; calls `parseMetadata` on load and `writeMetadata` on save |
| `useFileState` | Tracks the unsaved field values for every loaded file; computes change diffs; orchestrates the save-all operation |
| `useFileSelection` | Tracks which file(s) are currently selected in the sidebar |
| `helpers.ts` | `loadFromIdb` / `updateIdb` wrappers around `@vueuse/integrations/useIDBKeyval`; `getFileId` for deduplication |

**IPTC field model** (`utils/iptc-iim/`):

- `types.ts` — discriminated union `IPTCField` with subtypes `text | textarea | date | time | number | slider | select | location | reference | object-type | object-attribute | subject-reference | language | extra`. Keys are typed as `` `${number}:${number}` ``.
- `mapping.ts` — `iptcIimFields`: the master list of all supported IPTC-IIM field definitions
- `categories.ts` — groups fields into UI categories (used by `Editor/Categories.vue`)

**Data flow**: Files are read → `parseMetadata` extracts metadata → `useFileState` maps each field key to its value → the editor mutates `fileStates` reactively → "Save" calls `updateMetadata` → `writeMetadata` writes back to disk (or downloads the file in non-Chromium browsers).

**Persistence**: Files (buffers + metadata) are stored in IndexedDB under `"uploaded-images"`. Field states are stored under `"file-states"`. A `file-amount` cookie stores the file count for SSR hydration to avoid layout shift before IndexedDB loads.

**File System Access API**: The app uses `browser-fs-access` to write directly to the original file on Chromium-based browsers. On unsupported browsers the file is downloaded, and `isDownloaded` is set on the file record.
