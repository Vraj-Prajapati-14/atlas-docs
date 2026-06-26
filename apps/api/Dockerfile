# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/config/package.json packages/config/
COPY packages/utils/package.json packages/utils/
COPY packages/types/package.json packages/types/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile --prod=false

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM deps AS builder

COPY packages/config packages/config/
COPY packages/utils packages/utils/
COPY packages/types packages/types/
COPY packages/db packages/db/
COPY apps/api apps/api/
COPY tsconfig.base.json ./

# Generate Prisma client then build
RUN pnpm --filter @atlas/db generate
RUN pnpm --filter @atlas/utils build
RUN pnpm --filter @atlas/types build
RUN pnpm --filter @atlas/db build
RUN pnpm --filter @atlas/api build

# ─── Stage 3: Production image ────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN addgroup --system --gid 1001 atlas \
  && adduser --system --uid 1001 atlas

WORKDIR /app

# Copy only what's needed to run
COPY --from=builder --chown=atlas:atlas /app/node_modules ./node_modules
COPY --from=builder --chown=atlas:atlas /app/apps/api/dist ./dist
COPY --from=builder --chown=atlas:atlas /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=atlas:atlas /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=atlas:atlas /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder --chown=atlas:atlas /app/packages/db/prisma ./packages/db/prisma

USER atlas

ENV NODE_ENV=production
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
