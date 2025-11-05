# Dockerfile para Pyro Puff - Next.js 15 con pnpm
FROM node:20-alpine AS base

# Instalar pnpm usando corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias solo cuando se necesiten
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile

# Rebuild el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate

# Deshabilitar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED 1

# Build de la aplicación
RUN pnpm build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Copiar archivos necesarios
COPY --from=builder /app/public ./public

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

