# Use official Node.js LTS image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install build tools
RUN apt-get update && apt-get install -y build-essential python3 make git && rm -rf /var/lib/apt/lists/*

# Copy package files and install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source
COPY . .

# Build
RUN npx esbuild src/index.ts --platform=node --bundle --format=esm --outdir=dist

# Expose port (default 3000 or use PORT env)
EXPOSE 3000

# Start command
CMD ["node", "dist/index.js"]
