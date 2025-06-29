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
    && rm -rf /var/lib/apt/lists/*

# Set npm config for Python
RUN npm config set python python3

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including swisseph)
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"] 