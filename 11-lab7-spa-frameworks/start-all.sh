#!/bin/sh
# Starts every lab app's dev server on a fixed port (5101-5107).
cd "$(dirname "$0")"
i=1
for d in vanilla vue preact lit svelte solid qwik; do
  (cd $d && npm run dev -- --port 510$i --strictPort > ../.dev-$d.log 2>&1 &)
  i=$((i+1))
done
