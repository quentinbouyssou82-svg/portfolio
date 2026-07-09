#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_PATH="${DEMO_PATH:-/demos/apex-advisory}"

if ! curl -sf http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
  echo "Aucun tunnel ngrok actif."
  echo ""
  echo "Lance d’abord :"
  echo "  cd ~/portfolio && npm run dev:share"
  echo ""
  echo "Ou dans deux terminaux :"
  echo "  npm run dev"
  echo "  npm run tunnel"
  exit 1
fi

PUBLIC_URL="$(
  curl -sf http://127.0.0.1:4040/api/tunnels \
    | python3 -c "
import json, sys
data = json.load(sys.stdin)
for tunnel in data.get('tunnels', []):
    url = tunnel.get('public_url', '')
    if url.startswith('https://'):
        print(url)
        break
"
)"

if [[ -z "$PUBLIC_URL" ]]; then
  echo "Tunnel ngrok actif mais URL publique introuvable."
  exit 1
fi

echo "$PUBLIC_URL"
echo "${PUBLIC_URL}${DEMO_PATH}"
