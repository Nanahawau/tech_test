FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Build application
COPY . .
RUN npm run build


FROM nginx:1.25-alpine


# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from build stage
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]