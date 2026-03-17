# Use Node.js 20 with Debian Bullseye as the base image
# Architecture is selected by the build command (native by default,
# or via buildx when cross-building).
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Use a fixed npm cache location inside the image
ENV NPM_CONFIG_CACHE=/root/.npm

# Install system dependencies (replaces Alpine equivalents)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    make \
    g++ \
    bash \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only package.json files first to leverage Docker cache for dependencies
COPY BackEnd-App/package*.json ./BackEnd-App/
COPY FrontEnd-App/package*.json ./FrontEnd-App/

# Install backend dependencies
RUN cd /app/BackEnd-App && npm install --verbose

# Install frontend dependencies
RUN cd /app/FrontEnd-App && npm install --verbose

# Now copy actual application code
COPY BackEnd-App /app/BackEnd-App
COPY FrontEnd-App /app/FrontEnd-App

# Compile backend
RUN cd /app/BackEnd-App && npx tsc

# Build frontend (optional)
RUN cd /app/FrontEnd-App && npx tsc && npx ojet build

# Ensure Piper binary is executable
RUN if [ -f /app/BackEnd-App/rundata/piper/piper/piper ]; then chmod +x /app/BackEnd-App/rundata/piper/piper/piper; fi

# Expose necessary ports
EXPOSE 5555
EXPOSE 53

# Set working directory to backend
WORKDIR /app/BackEnd-App

# Start the backend app
CMD ["npm", "start"]
