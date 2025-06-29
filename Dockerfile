# Use Node.js 18 as base image
FROM node:18

# Install build tools and Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Set npm config to use python3
RUN npm config set python /usr/bin/python3

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Rebuild native modules with explicit python path
RUN npm rebuild swisseph --build-from-source --python=/usr/bin/python3

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 