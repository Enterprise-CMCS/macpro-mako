FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR ${LAMBDA_TASK_ROOT}
RUN yum install -y clamav clamav-freshclam clamd aws-cli
COPY package.json package-lock.json ./
RUN npm install
COPY . .
COPY src/conf/clamd.conf /etc/clamd.d/scan.conf
COPY src/conf/freshclam.conf /bin/freshclam.conf
RUN npm run build
CMD ["dist/scan.handler"]