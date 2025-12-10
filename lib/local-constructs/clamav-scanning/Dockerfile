FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:24 as builder
# Increment CACHE_BUST to force Docker to pull a fresh base image (e.g., for security patches)
# Last updated: 2026-02-28 to pull latest patched Node base
ARG CACHE_BUST=6
LABEL cache.bust="${CACHE_BUST}"

WORKDIR ${LAMBDA_TASK_ROOT}

# Install system packages - try different package managers
RUN (dnf install -y clamav clamd || microdnf install -y clamav clamd || yum install -y clamav clamd)

# General OS refresh to pick up all available security fixes; refresh metadata, upgrade, clean caches
RUN (dnf --refresh upgrade -y || microdnf upgrade -y || yum update -y) \
    && (dnf clean all || microdnf clean all || yum clean all) \
    && rm -rf /var/cache/dnf \
    && rpm -q glib2 || true

# Remove unused runtime emulator and update global npm to patched version to address CVEs
RUN rm -f /usr/local/bin/aws-lambda-rie \
    && npm install -g npm@latest \
    && npm cache clean --force

COPY package.json package-lock.json ./
RUN npm install

COPY . .
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf

RUN npm run build

CMD ["dist/scan.handler"]
