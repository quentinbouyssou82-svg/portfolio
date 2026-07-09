#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/scripts/load-ngrok-env.sh"
load_ngrok_env "$ROOT"

NGROK="$ROOT/bin/ngrok"
PORT="${PORT:-3000}"
DEMO_PATH="${DEMO_PATH:-/demos/apex-advisory}"

if [[ ! -x "$NGROK" ]]; then
  echo "→ Installation de ngrok…"
  bash "$ROOT/scripts/install-ngrok.sh"
fi

if [[ -z "${NGROK_AUTHTOKEN:-}" ]]; then
  echo ""
  echo "Ajoutez votre token ngrok dans .env.local :"
  echo "  NGROK_AUTHTOKEN=votre_token"
  echo ""
  echo "Token gratuit : https://dashboard.ngrok.com/get-started/your-authtoken"
  echo ""
  exit 1
fi

export NGROK_AUTHTOKEN

echo "→ Tunnel ngrok vers http://127.0.0.1:$PORT"
echo "→ Lancez le serveur dans un autre terminal si besoin : npm run dev"
echo "→ Page Palan Capital : …$DEMO_PATH"
echo "→ Dashboard ngrok : http://127.0.0.1:4040"
echo ""

exec "$NGROK" http "$PORT" --config "$ROOT/ngrok.yml"
