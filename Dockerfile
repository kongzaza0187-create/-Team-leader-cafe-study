# ==============================================================================
# Lumina 24-Hour Cafe - Multi-Stage Production Dockerfile
# Stage 1: Build Frontend Assets (Vite + TypeScript)
# Stage 2: Minimalist Node.js Production Runtime
# ==============================================================================

# STAGE 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV CLUSTER_MODE=true

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 lumina

COPY package*.json ./
RUN npm ci --only=production

# Copy compiled assets from builder
COPY --from=builder --chown=lumina:nodejs /app/dist ./dist
COPY --from=builder --chown=lumina:nodejs /app/server.ts ./server.ts
COPY --from=builder --chown=lumina:nodejs /app/tsconfig*.json ./

USER lumina

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
