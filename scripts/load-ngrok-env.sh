#!/usr/bin/env bash
# Charge NGROK_AUTHTOKEN depuis .env.local (sans exposer les autres secrets au shell).
load_ngrok_env() {
  local root="${1:?}"
  local env_file="$root/.env.local"

  if [[ -n "${NGROK_AUTHTOKEN:-}" ]]; then
    return 0
  fi

  if [[ ! -f "$env_file" ]]; then
    return 0
  fi

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    if [[ "$line" =~ ^NGROK_AUTHTOKEN=(.*)$ ]]; then
      local value="${BASH_REMATCH[1]}"
      value="${value#\"}"
      value="${value%\"}"
      value="${value#\'}"
      value="${value%\'}"
      export NGROK_AUTHTOKEN="$value"
      return 0
    fi
  done < "$env_file"
}
