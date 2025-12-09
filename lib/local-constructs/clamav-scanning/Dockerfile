FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:20 as builder
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
# Record current RPM versions in the build log for visibility
RUN (dnf --refresh upgrade -y glib2 curl-minimal libcurl-minimal || microdnf upgrade -y glib2 curl-minimal libcurl-minimal || yum update -y glib2 curl-minimal libcurl-minimal) \
    && rpm -q glib2 curl-minimal libcurl-minimal

# Remove unused runtime emulator and bundled global npm (old npm pulls in glob/cross-spawn/brace-expansion CVEs)
RUN rm -f /usr/local/bin/aws-lambda-rie \
    && rm -rf /var/lang/lib/node_modules/npm

COPY package.json package-lock.json ./
RUN npm install
COPY . .
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf
RUN npm run build
CMD ["dist/scan.handler"]
