FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:20 as builder
# Increment CACHE_BUST to force Docker to pull a fresh base image (e.g., for security patches)
# Last updated: 2026-02-28 to pull latest patched Node base
ARG CACHE_BUST=2
LABEL cache.bust="${CACHE_BUST}"
WORKDIR ${LAMBDA_TASK_ROOT}

# Install system packages - try different package managers
RUN (dnf install -y clamav clamd || microdnf install -y clamav clamd || yum install -y clamav clamd)

COPY package.json package-lock.json ./
RUN npm install
COPY . .
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf
RUN npm run build
CMD ["dist/scan.handler"]
