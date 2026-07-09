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

cleanup() {
  if [[ -n "${DEV_PID:-}" ]] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
  if [[ -n "${NGROK_PID:-}" ]] && kill -0 "$NGROK_PID" 2>/dev/null; then
    kill "$NGROK_PID" 2>/dev/null || true
    wait "$NGROK_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "→ Démarrage Next.js (port $PORT)…"
npm run dev -- --port "$PORT" &
DEV_PID=$!

echo "→ Attente du serveur local…"
ready=0
for _ in $(seq 1 45); do
  if curl -sf "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  echo "Le serveur Next.js n’a pas répondu à temps sur le port $PORT."
  exit 1
fi

echo "→ Ouverture du tunnel ngrok…"
"$NGROK" http "$PORT" --config "$ROOT/ngrok.yml" --log=stdout --log-level=info &
NGROK_PID=$!

sleep 2
PUBLIC_URL="$(
  curl -sf http://127.0.0.1:4040/api/tunnels 2>/dev/null \
    | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        url = tunnel.get('public_url', '')
        if url.startswith('https://'):
            print(url)
            break
except Exception:
    pass
" 2>/dev/null || true
)"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  URL publique (à coller dans l’autre IA UX/UI) :"
if [[ -n "$PUBLIC_URL" ]]; then
  echo "  $PUBLIC_URL"
  echo ""
  echo "  Palan Capital : ${PUBLIC_URL}${DEMO_PATH}"
else
  echo "  (voir l’URL https://… dans les logs ngrok ci-dessus)"
fi
echo ""
echo "  1. Cliquez « Visit Site » sur la page d’avertissement ngrok"
echo "  2. Pour les IA : header ngrok-skip-browser-warning: true"
echo "  Dashboard ngrok : http://127.0.0.1:4040"
echo "  Ctrl+C arrête le serveur et le tunnel."
echo "════════════════════════════════════════════════════════════"
echo ""

wait "$NGROK_PID"
