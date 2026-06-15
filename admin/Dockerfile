FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_APP_BASE_PATH=/admin/
ARG VITE_APP_NAME=Corporate Admin
ARG VITE_API_BASE_URL=/api
ENV VITE_APP_BASE_PATH=${VITE_APP_BASE_PATH}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm install -g pnpm@9.15.4 --registry=https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true

COPY . .

RUN pnpm build

FROM nginx:1.27-alpine AS runner

ENV NODE_ENV=production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
