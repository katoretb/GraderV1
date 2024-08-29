# Stage 1: Build the React application
FROM node:21 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY src/package.json src/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the source code and .env file
COPY src/src ./src
COPY src/public ./public
COPY src/.env .env

# Build the application
RUN npm run build

# Stage 2: Serve the React application
FROM nginx:alpine

# Copy the build files from the first stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports 80 and 443
EXPOSE 80
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
