FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest
RUN pnpm config set fetch-retries 10
RUN pnpm config set fetch-retry-maxtimeout 600000
RUN pnpm config set fetch-timeout 600000
RUN pnpm config set registry https://registry.npmjs.org/

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Development stage (for local dev with react-router-serve)
FROM base AS dev
WORKDIR /app
COPY --from=build /app/build /app/build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
CMD ["pnpm", "run", "start"]

# Production stage (Static files served by Nginx)
FROM nginx:alpine AS prod
# Copy build output from build stage
COPY --from=build /app/build/client /usr/share/nginx/html
# Integrated Nginx config (Paths are relative to the root build context)
COPY nginx/production.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]