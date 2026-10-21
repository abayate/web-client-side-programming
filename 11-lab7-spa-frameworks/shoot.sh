#!/bin/sh
# Usage: ./shoot.sh <port> <name> [height]
# Captures http://localhost:<port>/ with headless Chrome into screenshots/<name>.png
cd "$(dirname "$0")"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,${3:-900} \
  --virtual-time-budget=15000 --run-all-compositor-stages-before-draw \
  --user-data-dir="$TEMP/lab7-chrome" \
  --screenshot="$(cygpath -w "$PWD/screenshots/$2.png")" "http://localhost:$1/" 2>/dev/null
ls -la "screenshots/$2.png" | awk '{print $5, $9}'
