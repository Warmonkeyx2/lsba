# Multi-stage build for LSBA Frontend
FROM node:18-alpine AS frontend-build

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Clear npm cache and install all dependencies
RUN npm cache clean --force
RUN npm install --no-optional

# Verify critical dependencies are installed
RUN npm list @vitejs/plugin-react-swc || npm install @vitejs/plugin-react-swc

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Build the application with verbose output
RUN npm run build

# Production stage
FROM nginx:alpine AS frontend-production

# Copy built assets from build stage
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]