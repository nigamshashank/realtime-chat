# Use Node.js 18 as base image
FROM node:18-slim

# Install build tools and Python
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Rebuild native modules
RUN npm rebuild swisseph --build-from-source

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 