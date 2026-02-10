FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest
# Configure pnpm for better network resilience
RUN pnpm config set fetch-retries 10
RUN pnpm config set fetch-retry-maxtimeout 600000
RUN pnpm config set fetch-timeout 600000
RUN pnpm config set registry https://registry.npmjs.org/

FROM base AS build
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS runtime
COPY ./package.json /app/
WORKDIR /app
# Only install production dependencies
COPY ./pnpm-lock.yaml /app/
RUN pnpm install --prod --frozen-lockfile
# Copy build output from build stage
COPY --from=build /app/build /app/build

CMD ["pnpm", "run", "start"]