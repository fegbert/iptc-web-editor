# IPTC Web Editor

A modern, browser-based editor for reading and writing IPTC-IIM metadata in JPEG files. Edit image metadata directly in your browser with support for seamless file handling.

## Features

- **Browser-based editing**: No installation required—edit metadata directly in your browser
- **IPTC-IIM support**: Full read/write support for IPTC-IIM metadata standard
- **Batch operations**: Manage multiple files at once with an intuitive interface
- **File persistence**: Store file state locally using IndexedDB
- **File System Access API**: Direct file reading and writing with permission handling by using the [File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- **Metadata validation**: Built-in validation for metadata fields
- **TypeScript**: Type-safe codebase for better maintainability

## Tech Stack

- **Frontend**: [Nuxt 4](https://nuxt.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Nuxt UI](https://ui.nuxt.com/)
- **Parser**: Custom TypeScript JPEG-IIM parser
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Deployment**: Docker & [Coolify](https://coolify.io/)

## Project Structure

```
.
├── app/                 # Nuxt.js web application
│   ├── composables/     # Vue composables (state management, utilities)
│   ├── components/      # Vue components (UI building blocks)
│   ├── pages/           # Nuxt pages (routes)
│   ├── layouts/         # Page layouts
│   ├── assets/          # CSS and static assets
│   └── nuxt.config.ts   # Nuxt configuration
├── parser/              # IPTC-IIM parser library
│   ├── src/
│   │   ├── jpeg-iim/    # JPEG-IIM reader/writer
│   │   └── index.ts     # Public exports
│   └── tests/           # Unit tests
├── Dockerfile           # Multi-stage Docker build
└── pnpm-workspace.yaml  # pnpm workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 22+ (or use Docker)
- pnpm 10.12.4

### Installation

1. Clone the repository:

```bash
git clone https://github.com/fegbert/iptc-web-editor.git
cd iptc-web-editor
```

1. Install dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm -C app dev
```

The application will be available at `http://localhost:3000`

### Building

Build for production:

```bash
pnpm -C app build
```

Preview the production build:

```bash
pnpm -C app preview
```

### Testing

Run parser tests:

```bash
pnpm -C parser test
```

### Linting

Check code quality:

```bash
pnpm lint
```

## Docker Deployment

Build the image:

```bash
docker build -t iptc-web-editor .
```

Run the container:

```bash
docker run -p 3000:3000 iptc-web-editor
```

## How to Use

1. **Load images**: Click "Load Images" to select JPEG files from your computer
2. **View metadata**: Browse through IPTC-IIM metadata fields organized by category
3. **Edit metadata**: Modify field values directly in the editor
4. **Save**: Click "Save" to write changes back to the image file, or, if the File System Access API is not supported, download the modified file

## API Documentation

### Parser

The `iptc-parser` package provides two main functions:

```typescript
// Parse metadata from a JPEG buffer
parseMetadata(buffer: Uint8Array): Record<string, string>

// Write metadata to a JPEG file
writeMetadata(
  image: File | Uint8Array,
  metadata: Record<string, string>,
  path?: string,
  fileHandle?: FileSystemFileHandle
): Promise<void>
```

## Contributing

Currently contributions are not being accepted due to the project being a developed as a school project. However, feel free to fork the repository for personal use.

## Browser Support

The application is compatible with all modern browsers. The only limitation is the requirement of the IndexedDB. This is however supported by [all major browsers](https://caniuse.com/indexeddb).

## Known Limitations

- IPTC-IIM Repeatable Fields are currently not supported by the nuxt app. They can however be handled using the `iptc-parser` package directly.
- The File System Access API is only supported in Chromium-based browsers. In unsupported browsers, files will be downloaded instead of being written directly.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
