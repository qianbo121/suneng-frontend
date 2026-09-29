FROM node:22.23.1-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmjs.org \
    && pnpm config set registry https://registry.npmjs.org

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

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmjs.org \
    && pnpm config set registry https://registry.npmjs.org

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

RUN pnpm --dir backend prisma:generate && pnpm --dir backend build \
    && pnpm --filter @corp-site/backend --prod deploy /runtime/backend \
    && node /runtime/backend/node_modules/prisma/build/index.js generate \
       --schema /runtime/backend/prisma/schema.prisma \
    && node backend/scripts/verify-runtime.cjs /runtime/backend --repair-self-link

FROM node:22.23.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /runtime/backend ./backend
COPY --from=builder /app/data/workpiece-router ./data/workpiece-router
COPY backend/scripts/verify-runtime.cjs ./backend/verify-runtime.cjs

# Verify inside the final image: no access to the build workspace or its deps.
RUN node backend/verify-runtime.cjs /app/backend

EXPOSE 3001

CMD ["node", "backend/dist/src/main.js"]
