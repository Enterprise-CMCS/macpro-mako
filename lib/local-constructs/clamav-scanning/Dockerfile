FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22 as builder
# Increment CACHE_BUST to force Docker to pull a fresh base image (e.g., for security patches)
# Last updated: 2026-02-28 to pull latest patched Node base
ARG CACHE_BUST=6
LABEL cache.bust="${CACHE_BUST}"
WORKDIR ${LAMBDA_TASK_ROOT}

# Install system packages - try different package managers
RUN (dnf install -y clamav clamd || microdnf install -y clamav clamd || yum install -y clamav clamd)

# General OS refresh to pick up all available security fixes; refresh metadata, upgrade, autoremove, clean caches
RUN (dnf --refresh upgrade -y || microdnf upgrade -y || yum update -y) \
    && (dnf autoremove -y || microdnf autoremove -y || yum autoremove -y || true) \
    && (dnf clean all || microdnf clean all || yum clean all) \
    && rm -rf /var/cache/dnf
# Force-install patched glib2/curl RPMs directly (fails if not yet available), then log versions
RUN dnf --refresh install -y \
      https://cdn.amazonlinux.com/al2023/core/latest/x86_64/packages/glib2-2.82.2-767.amzn2023.x86_64.rpm \
      https://cdn.amazonlinux.com/al2023/core/latest/x86_64/packages/curl-minimal-8.11.1-4.amzn2023.0.3.x86_64.rpm \
      https://cdn.amazonlinux.com/al2023/core/latest/x86_64/packages/libcurl-minimal-8.11.1-4.amzn2023.0.3.x86_64.rpm \
    && rpm -q glib2 curl-minimal libcurl-minimal

# Remove unused runtime emulator and upgrade bundled npm to pick up patched dependencies
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
