#!/usr/bin/env bash
set -euo pipefail

USB_VOLUME="PHILIPS UFD"
USB_MOUNT="/Volumes/${USB_VOLUME}"
DEST="${USB_MOUNT}/portfolio"
SRC="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -d "$USB_MOUNT" ]]; then
  echo "Clé USB introuvable : ${USB_MOUNT}"
  echo "Branchez la clé « ${USB_VOLUME} » puis relancez ce script."
  exit 1
fi

FREE_KB=$(df -k "$USB_MOUNT" | awk 'NR==2 {print $4}')
NEED_KB=$((2200 * 1024 * 1024 / 1024)) # ~2.2 Go
if (( FREE_KB < NEED_KB )); then
  echo "Espace insuffisant sur la clé (~2,2 Go requis, $(df -h "$USB_MOUNT" | awk 'NR==2 {print $4}') disponible)."
  exit 1
fi

mkdir -p "$DEST"

echo "Copie de ${SRC} → ${DEST}"
rsync -a --progress \
  --exclude '.DS_Store' \
  "${SRC}/" "${DEST}/"

echo ""
echo "Terminé : ${DEST}"
du -sh "$DEST"
