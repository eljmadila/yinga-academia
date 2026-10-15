#!/usr/bin/env bash
# Root build script for Render in case Root Directory is not set to backend
set -o errexit

echo "--- Running build from backend directory ---"
cd backend
chmod +x ./build.sh
./build.sh
