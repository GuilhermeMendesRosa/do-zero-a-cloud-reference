FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=caddy:caddy /app/dist /srv

USER caddy

EXPOSE 3000

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
