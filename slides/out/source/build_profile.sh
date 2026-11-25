#!/usr/bin/env bash
# 会社案内（事業概要・会社概要・役員紹介）の再生成
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
test -f assets_v7/cover.jpg && test -f assets_ar/dev_laptop_tools.png && test -f assets_adc/dev_laptop_dash.png
NODE_PATH=/opt/node22/lib/node_modules node make_symbol.js >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_profile.js
cd ..
F="TrillionBank_会社案内_v1"
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf "$F.pptx" >/dev/null
rm -rf render_profile && mkdir render_profile
pdftoppm -png -r 72 "$F.pdf" render_profile/s
python3 source/preview.py render_profile out=preview_profile.png
python3 -W ignore source/check_overlap.py "$F.pdf" | tail -1
python3 -W ignore source/check_minfont.py "$F.pptx" "$F.pdf" 20
