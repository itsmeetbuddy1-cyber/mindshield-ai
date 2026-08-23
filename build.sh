#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "==> Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Upgrading pip..."
pip install --upgrade pip

echo "==> Installing Python Backend Dependencies..."
pip install --prefer-binary -r backend/requirements.txt

echo "==> Build Complete Successfully!"
