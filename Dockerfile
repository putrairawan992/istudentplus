# Next.js 16 needs Node >=20.9; 22 is the current LTS.
# One stage on purpose: this runs `next start` with the full node_modules, which is the only
# server setup that routes this app correctly (see the note on `standalone` in next.config.ts).
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# No CONTENT_API_URL here on purpose. Without it lib/content.ts falls back to the committed
# content/*.json, which is all the build needs since every real page is server-rendered on
# demand, and the API token never ends up in an image layer. Live data comes from env at runtime.
RUN npm run build

# `next start` writes image-optimization cache into .next/cache, so the runtime user owns it.
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 3000
# -H 0.0.0.0 so Caddy in another container can reach it; the default binds localhost only.
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
