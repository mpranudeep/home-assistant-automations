# Use Node.js 24 with Alpine 3.20 as the base image
FROM node:24-alpine3.20

# Set working directory
WORKDIR /app

# Install TypeScript globally
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
    && npm install -g typescript @oracle/ojet-cli

# Copy only package.json files first to leverage Docker cache for dependencies
COPY BackEnd-App/package*.json ./BackEnd-App/
COPY FrontEnd-App/package*.json ./FrontEnd-App/

# Install backend dependencies
RUN cd /app/BackEnd-App && npm install

# Install frontend dependencies (optional if frontend is needed)
RUN cd /app/FrontEnd-App && npm install

# Now copy actual application code
COPY BackEnd-App /app/BackEnd-App
COPY FrontEnd-App /app/FrontEnd-App

# Compile backend
RUN cd /app/BackEnd-App && tsc

# Build frontend (optional)
RUN cd /app/FrontEnd-App && ojet build

# Expose necessary ports
EXPOSE 5555 5555

# Set working directory to backend
WORKDIR /app/BackEnd-App

# Start the backend app
CMD ["npm", "start"]
