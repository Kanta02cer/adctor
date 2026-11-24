#!/usr/bin/env bash
# v3（LayerX意匠参照版）の再生成：背景画像 → PPTX → PDF → ページ画像 → preview_v3.png
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
python3 make_bg_v3.py >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_v3.js
cd ..
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf Adctor_LayerX_style_v3.pptx >/dev/null
rm -rf render_v3 && mkdir render_v3
pdftoppm -png -r 72 Adctor_LayerX_style_v3.pdf render_v3/s
python3 source/preview.py render_v3 out=preview_v3.png
