# Use the official Node.js LTS image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files separately to install dependencies first (cacheable layer)
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install --legacy-peer-deps

# Copy all files
COPY . .

# Build the Next.js app
RUN npm run build

# ---------------------------
# PRODUCTION STAGE
# ---------------------------
FROM node:20-alpine AS runner

# Set environment variable to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy built application and required files from previous stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/next.config.js ./next.config.js

# Expose Next.js port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
