FROM node:22-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# --- Builder ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

# Dummy env vars for build (Next.js evaluates routes at build time)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV AUTH_SECRET="build-time-dummy-secret-not-used-at-runtime"
ENV APP_URL="http://localhost:3000"

RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# prisma CLI глобально — для db push при старте (схема в БД)
RUN apk add --no-cache openssl && npm i -g prisma@6.19.2

COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder /app/prisma ./prisma

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

# db push синхронизирует схему с БД (миграций нет), затем старт.
CMD ["sh", "-c", "prisma db push --skip-generate && node server.js"]
