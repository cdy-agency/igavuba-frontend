# =========================
# 1. Dependencies
# =========================
FROM node:20-slim AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# =========================
# 2. Build
# =========================
FROM node:20-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build


# =========================
# 3. Production
# =========================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]