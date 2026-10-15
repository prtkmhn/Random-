#!/usr/bin/env bash
# Boots an Apple Watch simulator, installs the watch app, and saves screenshots
# and a video while the beads sway (the Simulator has no motion sensors).
set -euo pipefail

OUT=sim-output
APP=build/Build/Products/Debug-watchsimulator/TrickleWatch.app
BUNDLE=com.example.trickle.watchkitapp
mkdir -p "$OUT"

UDID=$(xcrun simctl list devices available | grep "Apple Watch" | head -1 | grep -oE '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}') || true
if [ -z "$UDID" ]; then
  echo "No Apple Watch simulator found. Available devices:" >&2
  xcrun simctl list devices available >&2
  exit 1
fi
echo "Simulator: $UDID"

xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" "$BUNDLE"

xcrun simctl io "$UDID" recordVideo --codec=h264 --force "$OUT/watch.mp4" &
REC_PID=$!

capture() { xcrun simctl io "$UDID" screenshot "$OUT/$1.png"; }
sleep 3;  capture t03s
sleep 5;  capture t08s
sleep 6;  capture t14s
sleep 6;  capture t20s

kill -INT "$REC_PID" || true
wait "$REC_PID" || true
xcrun simctl shutdown "$UDID" || true
ls -la "$OUT"
