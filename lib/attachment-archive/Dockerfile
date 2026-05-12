FROM oven/bun:1.3.11-alpine

ARG CACHE_BUST=2026-05-08-attachment-archive-base-refresh
LABEL cache.bust="${CACHE_BUST}"

# Refresh base OS packages so rebuilt images pick up available security fixes.
RUN apk update \
    && apk upgrade \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY . ./

CMD ["bun", "worker/index.ts"]
