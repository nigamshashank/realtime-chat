# Use Node.js 18 with Python and build tools
FROM node:18-bullseye

# Install system dependencies for building native modules
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    gcc \
    g++ \
    make \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set npm config for Python
RUN npm config set python python3

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with verbose output and retry logic
RUN npm install --verbose || (echo "First install failed, retrying..." && npm install --verbose)

# Copy app source
COPY . .

# Create a health check script
RUN echo '#!/bin/bash\ncurl -f http://localhost:3001/ || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Expose port
EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /app/healthcheck.sh

# Start the app with better error handling
CMD ["sh", "-c", "echo 'Starting server...' && node server.js"] 