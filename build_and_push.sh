#!/bin/bash
set -e

# Usage:
#   ./build_and_push.sh [TAG] [PLATFORM]
# Examples:
#   ./build_and_push.sh latest
#   ./build_and_push.sh latest linux/arm64
#   ./build_and_push.sh latest linux/amd64

IMAGE_NAME=home-assistant-automations
TAG=${1:-latest}
PLATFORM=${2:-linux/arm64}
REGISTRY=192.168.68.120:5000

FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"
DOCKER_NPM_CACHE_DIR=".npm-cache"
BACKEND_NODE_MODULES_DIR="BackEnd-App/node_modules"
FRONTEND_NODE_MODULES_DIR="FrontEnd-App/node_modules"
HOST_ARCH=$(uname -m)
DOCKER_VERSION_OUTPUT=$(docker version 2>&1 || true)

normalize_arch() {
  case "$1" in
    x86_64|amd64) echo "amd64" ;;
    aarch64|arm64) echo "arm64" ;;
    *) echo "$1" ;;
  esac
}

TARGET_ARCH=$(echo "$PLATFORM" | awk -F/ '{print $2}')
HOST_ARCH_NORMALIZED=$(normalize_arch "$HOST_ARCH")
USED_BUILDX_PUSH=0

echo "Building image for platform: $PLATFORM"



echo "Preparing node_modules cache for Docker build context..."

# Clean cache dir robustly (handles occasional rm -rf directory-not-empty issues)
if [ -d "$DOCKER_NPM_CACHE_DIR" ]; then
  chmod -R u+w "$DOCKER_NPM_CACHE_DIR" 2>/dev/null || true
  find "$DOCKER_NPM_CACHE_DIR" -mindepth 1 -depth -exec rm -rf {} + 2>/dev/null || true
fi
mkdir -p "$DOCKER_NPM_CACHE_DIR/BackEnd-node_modules" "$DOCKER_NPM_CACHE_DIR/FrontEnd-node_modules"

if [ -d "$BACKEND_NODE_MODULES_DIR" ]; then
  cp -a "$BACKEND_NODE_MODULES_DIR/." "$DOCKER_NPM_CACHE_DIR/BackEnd-node_modules/"
  echo "Copied backend node_modules from $BACKEND_NODE_MODULES_DIR"
else
  echo "Backend node_modules not found at $BACKEND_NODE_MODULES_DIR. Continuing with empty backend cache."
fi

if [ -d "$FRONTEND_NODE_MODULES_DIR" ]; then
  cp -a "$FRONTEND_NODE_MODULES_DIR/." "$DOCKER_NPM_CACHE_DIR/FrontEnd-node_modules/"
  echo "Copied frontend node_modules from $FRONTEND_NODE_MODULES_DIR"
else
  echo "Frontend node_modules not found at $FRONTEND_NODE_MODULES_DIR. Continuing with empty frontend cache."
fi

if [ "$PLATFORM" = "linux/amd64" ]; then
  # Force amd64 pull/build to avoid accidentally reusing an arm64-only local base image.
  docker build --pull --platform "$PLATFORM" -t "$FULL_IMAGE_NAME" .
else
  # For cross-platform builds, push directly from buildx (no local image load required).
  docker buildx build --platform "$PLATFORM" --pull -t "$FULL_IMAGE_NAME" .
  USED_BUILDX_PUSH=1
fi

echo "Pushing image to registry..."
docker push "$FULL_IMAGE_NAME"

echo "Image has been built and pushed to $FULL_IMAGE_NAME"
