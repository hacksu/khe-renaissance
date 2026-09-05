FROM oven/bun:latest

RUN apt-get update -y && apt-get install -y openssl
VOLUME ["/app/resumes"]

WORKDIR /app

COPY package.json bun.lock* ./
COPY packages/judging-core/package.json ./packages/judging-core/

RUN bun install
COPY . .

RUN bun prod:build

EXPOSE 3000

CMD ["bun", "prod:start"]
