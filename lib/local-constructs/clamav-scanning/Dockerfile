FROM public.ecr.aws/amazonlinux/amazonlinux:2023 as builder

# Keep your cache busting
ARG CACHE_BUST=1
LABEL cache.bust="${CACHE_BUST}"

# Match Lambda’s expectation for the task root
ENV LAMBDA_TASK_ROOT=/var/task
WORKDIR ${LAMBDA_TASK_ROOT}

# --- OS + Node.js + RIC ---

# Basic tools
RUN set -e; \
    dnf clean all; \
    dnf install -y tar gzip curl xz; \
    dnf --refresh upgrade -y; \
    dnf clean all

# Install Node.js 20 (NodeSource)
RUN curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - \
    && dnf install -y nodejs \
    && node -v \
    && npm -v

# Install Lambda Runtime Interface Client for Node
RUN npm install -g aws-lambda-ric

# --- Security patching focus: glib2 + curl ---

RUN set -e; \
    echo "==> Cleaning metadata"; \
    dnf clean all; \
    echo "==> Upgrading glib2/curl to pick up security fixes (CVE-2025-13601, etc)"; \
    dnf --refresh upgrade -y glib2 curl-minimal libcurl-minimal || echo "No specific glib2/curl updates available"; \
    echo "==> Running full OS upgrade for remaining patches"; \
    dnf --refresh upgrade -y; \
    echo "==> Cleaning caches"; \
    dnf clean all; \
    rm -rf /var/cache/dnf; \
    echo "==> Final package versions:"; \
    rpm -q glib2 curl-minimal libcurl-minimal || true

# --- ClamAV + app deps/build (your original bits) ---

# Install ClamAV
RUN dnf install -y clamav clamd

# Remove unused runtime emulator (not needed here, but harmless if absent)
RUN rm -f /usr/local/bin/aws-lambda-rie || true \
    && npm install -g npm@latest \
    && npm cache clean --force

# App deps
COPY package.json package-lock.json ./
RUN npm install

# App source
COPY . .
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf

RUN npm run build

# --- Lambda entrypoint/handler wiring ---

# Use the Node Lambda RIC as entrypoint
ENTRYPOINT [ "/usr/bin/aws-lambda-ric" ]

# Your handler name stays the same as before
CMD ["dist/scan.handler"]
