# Snoball OS — production image (Node 22, pnpm). Migrations and the §12 seed run on start
# (both are idempotent), then Next.js serves on $PORT.
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# The DB client is created lazily; a placeholder URL lets `next build` import route modules.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app /app
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/tsx lib/db/migrate.ts && node_modules/.bin/tsx lib/db/seed.ts && exec node_modules/.bin/next start -p ${PORT}"]
