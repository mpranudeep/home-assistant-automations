#!/bin/bash
set -e

# Usage: ./build_and_push.sh [TAG]
# Example: ./build_and_push.sh latest

IMAGE_NAME=home-assistant-automations
TAG=${1:-latest}
REGISTRY=192.168.68.120:5000

FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"

echo "Building image for Raspberry Pi (arm64)..."
docker buildx build --platform linux/arm64 -t $FULL_IMAGE_NAME .

echo "Pushing image to registry..."
docker push $FULL_IMAGE_NAME

echo "Image has been built and pushed to $FULL_IMAGE_NAME"
