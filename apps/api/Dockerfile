FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# Install dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared packages/shared
COPY apps/api apps/api
COPY tsconfig.base.json .

# Build
RUN pnpm --filter @portfolio/api build

EXPOSE 3001
CMD ["node", "apps/api/dist/app.js"]
