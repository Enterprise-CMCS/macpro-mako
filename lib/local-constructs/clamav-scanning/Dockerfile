FROM --platform=linux/amd64 oven/bun:1.4.5-alpine AS builder

# Increment CACHE_BUST to rebuild the CDK asset and refresh OS packages.
ARG CACHE_BUST=2026-11-24-security-refresh
LABEL cache.bust="${CACHE_BUST}"

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --network-concurrency 8

COPY . .

RUN bun run build

# Pin the refreshed Node 24 runtime so cached builds cannot reuse an older base.
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:24@sha256:d20c164c7208f5d3af9adf77c455e36784198495638053710d99be2394d5dbfc

ARG CACHE_BUST=2026-11-24-security-refresh
LABEL cache.bust="${CACHE_BUST}"

WORKDIR ${LAMBDA_TASK_ROOT}

# Keep the runtime image limited to ClamAV and the bundled handlers. AL2023
# locks package repositories to a release version, so opt into the latest
# repository release to receive security updates published after the base
# Lambda image was built.
RUN (dnf --releasever=latest install -y clamav1.4 clamd1.4 \
      || microdnf --releasever=latest install -y clamav1.4 clamd1.4 \
      || yum --releasever=latest install -y clamav1.4 clamd1.4) \
    && (dnf --releasever=latest --refresh upgrade -y \
      || microdnf --releasever=latest upgrade -y \
      || yum --releasever=latest update -y) \
    && (dnf clean all || microdnf clean all || yum clean all) \
    && rm -rf /var/cache/dnf \
    # npm is not required to execute the bundled Lambda handlers and keeping it
    # in the runtime image leaves known vulnerable transitive packages behind.
    && rm -rf /var/lang/lib/node_modules/npm \
    && rm -f /var/lang/bin/npm /var/lang/bin/npx /usr/local/bin/npm /usr/local/bin/npx \
    # The handlers are bundled with their own AWS SDK dependencies, so the
    # runtime-provided SDK is unused and can leave stale vulnerable packages.
    && rm -rf /var/runtime/node_modules/@aws-sdk \
    # RIE is only needed for local container emulation, not in Lambda.
    && rm -f /usr/local/bin/aws-lambda-rie

COPY --from=builder /app/dist ./dist
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf

CMD ["dist/scan.handler"]
