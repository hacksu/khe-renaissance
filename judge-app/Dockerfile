FROM oven/bun:latest

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json bun.lock* ./
COPY packages/judging-core/package.json ./packages/judging-core/
COPY judge-app/package.json ./judge-app/

RUN bun install

COPY packages ./packages
COPY judge-app ./judge-app

RUN bunx prisma generate

WORKDIR /app/judge-app
RUN BETTER_AUTH_SECRET=build-time-placeholder bun prod:build

EXPOSE 3000

CMD ["bun", "prod:start"]
