FROM node:22.23.1-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmmirror.com \
    && pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
COPY admin/package.json ./admin/package.json

RUN pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true

FROM node:22.23.1-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_APP_NAME=Manufacturing Corporate Site
ARG NEXT_PUBLIC_DEFAULT_LOCALE=zh
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG API_BASE_URL_INTERNAL=http://backend:3001/api

ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV API_BASE_URL_INTERNAL=${API_BASE_URL_INTERNAL}

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmmirror.com \
    && pnpm config set registry https://registry.npmmirror.com

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/admin/node_modules ./admin/node_modules
COPY . .

RUN mkdir -p frontend/public && pnpm --dir frontend build

FROM node:22.23.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static

EXPOSE 3000

CMD ["node", "frontend/server.js"]
