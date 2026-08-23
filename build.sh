#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Installing Python Backend Dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "==> Build Complete!"
