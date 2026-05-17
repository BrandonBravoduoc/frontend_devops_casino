FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
LABEL maintainer="VidalCasino-Frontend"
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/casino-frontend/browser/ ./
COPY --chown=nginx:nginx nginx.conf /etc/nginx/templates/default.conf.template
USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]