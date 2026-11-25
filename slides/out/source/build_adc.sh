#!/usr/bin/env bash
# Adctor 資料（投資家・事業連携向け）の再生成
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
test -f assets_v7/cover.jpg && test -f assets_ar/airreach_logo.png && test -f assets_v7/dev_laptop_ledger.png
NODE_PATH=/opt/node22/lib/node_modules node make_screens_adc.js >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_adc.js
cd ..
F="Adctor_事業資料_投資家・事業連携_v1"
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf "$F.pptx" >/dev/null
rm -rf render_adc && mkdir render_adc
pdftoppm -png -r 72 "$F.pdf" render_adc/s
python3 source/preview.py render_adc out=preview_adctor.png
python3 -W ignore source/check_overlap.py "$F.pdf" | tail -1
python3 -W ignore source/check_minfont.py "$F.pptx" "$F.pdf" 20
