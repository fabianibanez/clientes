# Dockerfile para la aplicación de Gestión de Proyectos

# Build stage
FROM node:20-alpine AS builder

# Instala bun
COPY --from=oven/bun:latest /bun /usr/local/bin/bun

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy rest of application
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM node:20-alpine AS runner

# Instala bun
COPY --from=oven/bun:latest /bun /usr/local/bin/bun

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Install SQLite
RUN apk add --no-cache sqlite

# Create db directory
RUN mkdir -p /app/db

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
