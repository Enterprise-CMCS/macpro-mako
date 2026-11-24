FROM oven/bun:1.4.5-alpine

# Increment CACHE_BUST to force a fresh image build when live findings require
# pulling updated base OS packages or already-fixed transitive dependencies.
ARG CACHE_BUST=2026-11-24-security-refresh
LABEL cache.bust="${CACHE_BUST}"

# Refresh base OS packages so rebuilt images pick up available security fixes.
RUN apk update \
    && apk upgrade \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production --network-concurrency 8

COPY . ./

CMD ["bun", "worker/index.ts"]
