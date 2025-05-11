# Base image: Debian slim with Node.js 18
FROM node:18-bullseye-slim

# Install necessary packages
RUN apt-get update && \
    apt-get install -y \
    supervisor \
    chromium \
    curl \
    && npm install -g @oracle/ojet-cli typescript \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set environment variable for Chromium (if used)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Copy apps
COPY BackEnd-App /app/BackEnd-App
COPY FrontEnd-App /app/FrontEnd-App

# Install backend dependencies and build
RUN cd /app/BackEnd-App && npm install && tsc

# Install frontend dependencies and build
RUN cd /app/FrontEnd-App && npm install && ojet build --release


# Create supervisord config directory
RUN mkdir -p /etc/supervisor/conf.d

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 3000 8000

# Start both apps
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
