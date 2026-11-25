#!/usr/bin/env bash
# AirReach 営業資料の再生成：素材 → 画面イメージ → PPTX → PDF → ページ画像 → 検品
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
python3 -I make_assets_v5.py ../../refs/TB_会社資料_20261117.pdf >/dev/null 2>&1 || test -f assets_v5/tb_logo_black.png
python3 make_bg_v7.py >/dev/null 2>&1 || test -f assets_v7/cover.jpg
python3 -I make_assets_ar.py ../../assets/airreach_logo_src.png >/dev/null
NODE_PATH=/opt/node22/lib/node_modules node make_screens_ar.js >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_ar.js
cd ..
F=AirReach_営業資料_v1
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf $F.pptx >/dev/null
rm -rf render_ar && mkdir render_ar
pdftoppm -png -r 72 $F.pdf render_ar/s
python3 source/preview.py render_ar out=preview_airreach.png
python3 -W ignore source/check_overlap.py $F.pdf | tail -1
python3 -W ignore source/check_minfont.py $F.pptx $F.pdf 20
