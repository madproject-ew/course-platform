#!/usr/bin/env bash
set -Eeuo pipefail

# Деплой course-platform на новый прод-сервер (courses.ew-production.ru).
# rsync исходников (с content/) -> docker build НА сервере -> compose up (postgres + app).
# .env.prod уезжает как .env (исключён из rsync --delete). Без tar.gz.

SSH_HOST="${SSH_HOST:-194.34.239.226}"
SSH_USER="${SSH_USER:-root}"
SSH_PORT="${SSH_PORT:-18}"
SSH_IDENTITY="${SSH_IDENTITY:-$HOME/.ssh/srv_194_34}"
REMOTE_DIR="${REMOTE_DIR:-/root/docker/apps/course-platform}"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

SSH_OPTS=(-p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new -i "${SSH_IDENTITY}")
SCP_OPTS=(-P "${SSH_PORT}" -o StrictHostKeyChecking=accept-new -i "${SSH_IDENTITY}")
RSYNC_SSH="ssh ${SSH_OPTS[*]}"
remote() { ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_HOST}" "$@"; }

echo "=== Deploy course-platform -> ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR} ==="
remote "mkdir -p '${REMOTE_DIR}'"

echo "[rsync] uploading source (incl content/)..."
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.turbo' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.env.prod' \
  --exclude '.DS_Store' \
  -e "${RSYNC_SSH}" \
  ./ "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"

if [[ -f "${ENV_FILE}" ]]; then
  echo "[env] uploading ${ENV_FILE} -> .env"
  scp "${SCP_OPTS[@]}" "${ENV_FILE}" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/.env"
fi

echo "[build] building image on server..."
remote "cd '${REMOTE_DIR}' && docker build -t course-platform:latest ."

echo "[up] starting postgres + app..."
remote "cd '${REMOTE_DIR}' && docker compose -f '${COMPOSE_FILE}' up -d"

echo ""
echo "=== Done. Status: ==="
remote "docker ps --filter name=course-platform --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
echo "Проверь: https://courses.ew-production.ru"
