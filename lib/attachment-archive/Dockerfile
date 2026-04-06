FROM oven/bun:1.3.11

# Refresh base OS packages so rebuilt images pick up available security fixes.
RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY . ./

CMD ["bun", "worker/index.ts"]
