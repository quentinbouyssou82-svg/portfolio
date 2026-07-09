#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$ROOT/bin/ngrok"

mkdir -p "$ROOT/bin"

SOURCES=(
  "$HOME/Downloads/ngrok"
  "/opt/homebrew/bin/ngrok"
  "/usr/local/bin/ngrok"
)

for src in "${SOURCES[@]}"; do
  if [[ -x "$src" ]]; then
    cp "$src" "$TARGET"
    chmod +x "$TARGET"
    echo "ngrok installé dans bin/ngrok ($("$TARGET" version))"
    exit 0
  fi
done

echo "ngrok introuvable."
echo "Téléchargez-le sur https://ngrok.com/download puis relancez : npm run ngrok:install"
exit 1
