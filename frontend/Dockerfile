FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true

FROM node:22-alpine AS builder

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

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm config set registry https://registry.npmmirror.com

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p public
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["sh", "-c", "if [ -f app/server.js ]; then node app/server.js; elif [ -f frontend/server.js ]; then node frontend/server.js; else node server.js; fi"]
