# Build from the repository root: docker build -f api/Dockerfile .
FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
WORKDIR /app

COPY .npmrc api/package.json api/package-lock.json ./
RUN npm ci
COPY api/ ./
RUN npm run build && npm prune --omit=dev

FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5
WORKDIR /app
ENV NODE_ENV=production \
    SERVER_HOST=0.0.0.0 \
    API_PORT=4000

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD wget -q -O /dev/null "http://127.0.0.1:${API_PORT}/api/healthcheck/live" || exit 1
# Pending migrations run on every start, so a new image brings its database up to date by itself
CMD ["sh", "-c", "node dist/console.js migrate && exec node dist/main.js"]
