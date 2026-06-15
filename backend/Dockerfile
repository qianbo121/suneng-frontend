FROM node:22-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true

FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmmirror.com

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/src/main.js"]
