# Use Node.js base image
FROM node:20-alpine

# Install Oracle JET CLI and supervisor
RUN npm install -g @oracle/ojet-cli http-server && \
    apt-get update && apt-get install -y supervisor

# Create app directory
WORKDIR /app

# Copy both applications
COPY BackEnd-App /app/BackEnd-App
COPY FrontEnd-App /app/FrontEnd-App

# Install backend dependencies
RUN cd /app/BackEnd-App && npm install

# Install frontend dependencies and build
RUN cd /app/FrontEnd-App && npm install && ojet build --release

# Create supervisord config directory
RUN mkdir -p /etc/supervisor/conf.d

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports (adjust as needed)
EXPOSE 3000 8000

# Start both apps
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
