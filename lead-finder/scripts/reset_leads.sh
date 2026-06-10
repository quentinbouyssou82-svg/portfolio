#!/usr/bin/env bash
# Remet à zéro toutes les données leads (CSV + cache). Ne touche pas au code ni à .env.local.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

rm -f data.csv data_safe.csv data_enriched.csv data_scored.csv
rm -f leads_input.csv leads_ranked.csv leads_excluded.csv
rm -f cache/domain_cache.json

echo "[OK] Données leads supprimées. Relance :"
echo "  cd $ROOT && source .venv/bin/activate"
echo '  MAX_ROWS=150 SEARCH_QUERIES="coiffeur|restaurant|plombier Montauban" python scrape_maps.py'
