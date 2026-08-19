FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine

WORKDIR /srv

RUN addgroup --system app && adduser --system --ingroup app app \
    && chown -R app:app /config /data

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=app:app /app/dist /srv

USER app

EXPOSE 3000

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
