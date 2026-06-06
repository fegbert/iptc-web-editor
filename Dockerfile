# Multi-stage Dockerfile for IPTC Web Editor (Nuxt.js + pnpm workspace)

# Stage 1: Build
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

WORKDIR /editor

# Copy workspace configuration and app package files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app/package.json app/pnpm-lock.yaml ./app/

# Copy parser module (needed for prepare script during install)
COPY parser ./parser

# Install dependencies (parser builds via prepare script)
RUN pnpm install --frozen-lockfile

# Copy app module
COPY app ./app

# Generate Prisma client (must run before nuxt build for types to exist)
RUN pnpm -C app db:generate

# Build Nuxt app (parser builds automatically via prepare script)
RUN pnpm -C app build

# Stage 2: Production runtime
FROM node:24-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

WORKDIR /editor

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy workspace configuration
COPY --from=builder /editor/pnpm-workspace.yaml ./
COPY --from=builder /editor/pnpm-lock.yaml ./

# Copy parser package (built)
COPY --from=builder /editor/parser/package.json ./parser/
COPY --from=builder /editor/parser/dist ./parser/dist

# Copy app package.json, built files, and generated Prisma client
COPY --from=builder /editor/app/package.json ./app/
COPY --from=builder /editor/app/.output ./app/.output
COPY --from=builder /editor/app/prisma/generated ./app/prisma/generated

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Expose port 3000
EXPOSE 3000

# Set working directory to app
WORKDIR /editor/app

# Start the Nuxt application
CMD ["pnpm", "start"]
