FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:20 as builder
# Increment CACHE_BUST to force Docker to pull a fresh base image (e.g., for security patches)
ARG CACHE_BUST=1
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