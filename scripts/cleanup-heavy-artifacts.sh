#!/usr/bin/env bash
# Filename: cleanup-heavy-artifacts.sh
# Clears regenerable caches that bloat the workspace (blobs, builds, logs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BEFORE="$(du -sh "$ROOT" | awk '{print $1}')"
echo "BEFORE: $BEFORE"

BLOBS="$ROOT/apps/CWSP-reborn/runtime/endpoint/.data/cwsp-files-blobs"
if [[ -d "$BLOBS" ]]; then
  rm -rf "$BLOBS"
  mkdir -p "$BLOBS"
  echo "cleared: cwsp-files-blobs"
fi

rm -rf \
  "$ROOT/apps/CWSP-reborn/build" \
  "$ROOT/apps/CWSP-reborn/app/android/build" \
  "$ROOT/apps/CWSP-reborn/app/android/.gradle" \
  "$ROOT/apps/CWSP-reborn/app/android/capacitor-cordova-android-plugins/build" \
  "$ROOT/apps/CWSP-reborn/.gradle" \
  "$ROOT/apps/CrossWord/build" \
  "$ROOT/apps/CrossWord/dist" \
  "$ROOT/apps/CWSP-shell/dist" \
  "$ROOT/apps/CWSP-direct/dist" \
  2>/dev/null || true

find "$ROOT" -type f -name '*.log' -size +512k ! -path '*/.git/*' -delete 2>/dev/null || true
find "$HOME/.pm2/logs" -type f -name '*.log' -size +2M -exec truncate -s 0 {} \; 2>/dev/null || true

AFTER="$(du -sh "$ROOT" | awk '{print $1}')"
echo "AFTER: $AFTER"
