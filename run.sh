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

if [ "$1" = "WEB" ] || [ "$1" = "API" ] || [ -z "$1" ]; then
    PORT=5556
    echo "Checking port $PORT..."
    lsof -ti :$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    sleep 2
fi

LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/app_$(date '+%Y%m%d_%H%M%S').log"

echo "Activating virtual environment and starting XHS-Downloader..."
source .venv/bin/activate

echo "Starting in background, logs: $LOG_FILE"
nohup python main.py "$@" > "$LOG_FILE" 2>&1 &
echo "PID: $!" >> "$LOG_FILE"
echo "Server started with PID: $!"