#!/bin/bash
set -euo pipefail
export PATH="$HOME/.local/node/bin:$PATH"
cd "$(dirname "$0")/.."
ulimit -n 10240 2>/dev/null || true
for p in $(lsof -t -iTCP:3000 -sTCP:LISTEN 2>/dev/null || true); do kill -9 "$p" || true; done
for p in $(lsof -t -iTCP:3001 -sTCP:LISTEN 2>/dev/null || true); do kill -9 "$p" || true; done
rm -f .next/dev/lock
exec npx next dev --hostname 127.0.0.1 --port 3000
