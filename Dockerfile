# Use Node.js 20 with Debian Bullseye as the base image for ARM64
FROM --platform=linux/arm64 node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Install system dependencies (replaces Alpine equivalents)
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-freefont-ttf \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    python3 \
    make \
    g++ \
    bash \
    libusb-1.0-0-dev \
    pkg-config \
    && npm install -g typescript @oracle/ojet-cli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only package.json files first to leverage Docker cache for dependencies
COPY BackEnd-App/package*.json ./BackEnd-App/
COPY FrontEnd-App/package*.json ./FrontEnd-App/

# Install backend dependencies
RUN cd /app/BackEnd-App && npm install

# Install frontend dependencies
RUN cd /app/FrontEnd-App && npm install

# Now copy actual application code
COPY BackEnd-App /app/BackEnd-App
COPY FrontEnd-App /app/FrontEnd-App

# Compile backend
RUN cd /app/BackEnd-App && tsc

# Build frontend (optional)
RUN cd /app/FrontEnd-App && ojet build

# Ensure Piper binary is executable
RUN chmod +x /app/BackEnd-App/rundata/piper/piper/piper

# Expose necessary ports
EXPOSE 5555
EXPOSE 53

# Set working directory to backend
WORKDIR /app/BackEnd-App

# Start the backend app
CMD ["npm", "start"]
