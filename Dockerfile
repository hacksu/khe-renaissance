FROM oven/bun:latest

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json bun.lock* ./

RUN bun install
COPY . .

RUN bun prod:build

EXPOSE 3000

CMD ["bun", "prod:start"]