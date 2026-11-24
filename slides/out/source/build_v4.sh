#!/usr/bin/env bash
# v4（LayerXの図表の型×TBカラー）の再生成：背景画像 → PPTX → PDF → ページ画像 → preview_v4.png
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
python3 make_bg_v4.py >/dev/null
python3 make_v4_script.py >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_v4.js
cd ..
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf Adctor_TB_LayerX_v4.pptx >/dev/null
rm -rf render_v4 && mkdir render_v4
pdftoppm -png -r 72 Adctor_TB_LayerX_v4.pdf render_v4/s
python3 source/preview.py render_v4 out=preview_v4.png
