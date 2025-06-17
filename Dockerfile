FROM oven/bun:latest
WORKDIR /app

COPY package*.json bun.lock* ./

RUN bun install
COPY . .

RUN bun run prod:build

EXPOSE 3000

CMD ["bun", "prod:start"]