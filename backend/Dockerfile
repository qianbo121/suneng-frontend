FROM node:22.23.1-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmmirror.com \
    && pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
COPY admin/package.json ./admin/package.json
COPY backend/prisma/schema.prisma ./backend/prisma/schema.prisma

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store/v3,sharing=locked \
    pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true

FROM node:22.23.1-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmmirror.com \
    && pnpm config set registry https://registry.npmmirror.com

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

RUN pnpm --dir backend prisma:generate && pnpm --dir backend build

FROM node:22.23.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

EXPOSE 3001

CMD ["node", "backend/dist/src/main.js"]
