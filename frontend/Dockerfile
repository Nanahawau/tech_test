# Build Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* /app/
RUN npm ci
COPY frontend /app
RUN npm run build

# Serve via nginx + proxy API/docs to backend
FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80