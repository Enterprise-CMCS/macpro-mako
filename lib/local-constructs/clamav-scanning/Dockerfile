FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:20 as builder

# Increment CACHE_BUST to encourage rebuilds when we want to refresh security state
# NOTE: this does NOT force docker to pull a new base; make sure your CI does `docker pull` too.
ARG CACHE_BUST=7
LABEL cache.bust="${CACHE_BUST}"

WORKDIR ${LAMBDA_TASK_ROOT}

# Install ClamAV and apply OS security updates, with explicit focus on glib2/curl
RUN set -e; \
    echo "==> Cleaning metadata"; \
    dnf clean all; \
    \
    echo "==> Installing ClamAV packages"; \
    dnf -y install clamav clamd; \
    \
    echo "==> Upgrading glib2/curl to pick up security fixes (includes CVE-2025-13601)"; \
    dnf --refresh upgrade -y glib2 curl-minimal libcurl-minimal || echo "No specific glib2/curl updates available"; \
    \
    echo "==> Running full OS upgrade for remaining patches"; \
    dnf --refresh upgrade -y; \
    \
    echo "==> Cleaning up unused deps and caches"; \
    dnf autoremove -y; \
    dnf clean all; \
    rm -rf /var/cache/dnf; \
    \
    echo "==> Final package versions:"; \
    rpm -q glib2 curl-minimal libcurl-minimal || true

# Remove unused runtime emulator and upgrade npm to a more recent (patched) version
RUN rm -f /usr/local/bin/aws-lambda-rie \
    && npm install -g npm@latest \
    && npm cache clean --force

# App dependencies & build
COPY package.json package-lock.json ./
RUN npm install

COPY . .
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf

RUN npm run build

CMD ["dist/scan.handler"]
