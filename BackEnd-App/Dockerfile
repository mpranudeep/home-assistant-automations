# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port (optional — only if app listens on HTTP)
EXPOSE 3000

# Run the app
CMD ["node", "dist/main"]
