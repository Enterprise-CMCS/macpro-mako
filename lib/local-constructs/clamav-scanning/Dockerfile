FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:24 AS builder

# Increment CACHE_BUST to force Docker to pull a fresh base image (e.g., for security patches)
ARG CACHE_BUST=2026-04-03-clamav-runtime-refresh
LABEL cache.bust="${CACHE_BUST}"

WORKDIR ${LAMBDA_TASK_ROOT}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:24

ARG CACHE_BUST=2026-04-03-clamav-runtime-refresh
LABEL cache.bust="${CACHE_BUST}"

WORKDIR ${LAMBDA_TASK_ROOT}

# Keep the runtime image limited to ClamAV and the bundled handlers.
RUN (dnf install -y clamav clamd || microdnf install -y clamav clamd || yum install -y clamav clamd) \
    && (dnf --refresh upgrade -y || microdnf upgrade -y || yum update -y) \
    && (dnf clean all || microdnf clean all || yum clean all) \
    && rm -rf /var/cache/dnf \
    # npm is not required to execute the bundled Lambda handlers and keeping it
    # in the runtime image leaves known vulnerable transitive packages behind.
    && rm -rf /var/lang/lib/node_modules/npm \
    && rm -f /var/lang/bin/npm /var/lang/bin/npx /usr/local/bin/npm /usr/local/bin/npx

COPY --from=builder ${LAMBDA_TASK_ROOT}/dist ./dist
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf

CMD ["dist/scan.handler"]
