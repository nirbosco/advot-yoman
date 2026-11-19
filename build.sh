#!/bin/bash
# מעתיק את הקוד מהכספת ומזריק את המפתח הציבורי של Supabase. אין כאן נתונים.
set -e
R="$(cd "$(dirname "$0")" && pwd)"
V="/Users/nirbosco/Documents/nir-vault/HOTAM-OS/output/אדוות-לונדון/yoman/site"
K=$(grep -rhoE "sb_publishable_[A-Za-z0-9_-]+" ~/Documents/hotam-newsletter/dist | head -1)
[ -n "$K" ] || { echo "no key"; exit 1; }
cp "$V/index.html" "$V/app.css" "$V/app.webmanifest" "$V/sw.js" "$R/"
sed "s/__SB_KEY__/$K/" "$V/app.js" > "$R/app.js"
cp -R "$V/fonts" "$V/assets" "$V/icons" "$R/"
printf 'User-agent: *\nDisallow: /\n' > "$R/robots.txt"
touch "$R/.nojekyll"
echo built
