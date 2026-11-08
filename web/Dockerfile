# Build from the repository root: docker build -f web/Dockerfile .
FROM node:26.13.0-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 AS build
WORKDIR /app

COPY .npmrc web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
# The GraphQL types of the web app are generated from the schema of the API
COPY api/schema.gql ./schema.gql
RUN npm run build

FROM node:26.13.0-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
WORKDIR /app
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# The standalone output carries its own server.js and only the dependencies it uses, the static files are copied next to it
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/healthcheck" || exit 1
CMD ["node", "server.js"]
