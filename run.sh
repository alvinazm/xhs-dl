#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed"
    exit 1
fi

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv .venv --python 3.12
fi

echo "Installing dependencies..."
uv sync

if [ "$1" = "WEB" ] || [ "$1" = "API" ] || [ -z "$1" ]; then
    PORT=5556
    echo "Checking port $PORT..."
    lsof -ti :$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "Activating virtual environment and starting XHS-Downloader..."
source .venv/bin/activate

mkdir -p "$SCRIPT_DIR/logs"

echo "Starting in background, logs: logs/app.log"
nohup python main.py "$@" > /dev/null 2>&1 &
echo "Server started with PID: $!"