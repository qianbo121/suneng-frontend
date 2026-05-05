FROM node:20-alpine AS deps

WORKDIR /app

RUN corepack enable

COPY package.json ./

RUN pnpm install --no-frozen-lockfile

FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN corepack enable

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/src/main.js"]
