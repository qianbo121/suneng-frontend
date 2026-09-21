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

ARG NEXT_PUBLIC_APP_NAME=Manufacturing Corporate Site
ARG NEXT_PUBLIC_DEFAULT_LOCALE=zh
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG API_BASE_URL_INTERNAL=http://backend:3001/api
ARG NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION
ARG NEXT_PUBLIC_360_SITE_VERIFICATION
ARG NEXT_PUBLIC_SOGOU_SITE_VERIFICATION
ARG NEXT_PUBLIC_BAIDU_APP_ID
ARG SITE_NOINDEX=false

ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV API_BASE_URL_INTERNAL=${API_BASE_URL_INTERNAL}
ENV NEXT_PUBLIC_BAIDU_SITE_VERIFICATION=${NEXT_PUBLIC_BAIDU_SITE_VERIFICATION}
ENV NEXT_PUBLIC_BING_SITE_VERIFICATION=${NEXT_PUBLIC_BING_SITE_VERIFICATION}
ENV NEXT_PUBLIC_360_SITE_VERIFICATION=${NEXT_PUBLIC_360_SITE_VERIFICATION}
ENV NEXT_PUBLIC_SOGOU_SITE_VERIFICATION=${NEXT_PUBLIC_SOGOU_SITE_VERIFICATION}
ENV NEXT_PUBLIC_BAIDU_APP_ID=${NEXT_PUBLIC_BAIDU_APP_ID}
ENV SITE_NOINDEX=${SITE_NOINDEX}

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmjs.org \
    && pnpm config set registry https://registry.npmjs.org

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/admin/node_modules ./admin/node_modules
COPY . .

RUN mkdir -p frontend/public && pnpm --dir frontend build \
    && node frontend/scripts/prepare-standalone.mjs

FROM node:22.23.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Public assets and Next static files are already merged into this directory.
# A single COPY avoids retaining the traced public assets in two image layers.
COPY --from=builder /app/frontend/.next/standalone ./

EXPOSE 3000

CMD ["node", "frontend/server.js"]
