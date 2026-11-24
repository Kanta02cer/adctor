#!/usr/bin/env bash
# v5（会社概要を追加）の再生成：背景画像 → PPTX → PDF → ページ画像 → preview_v5.png
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
python3 make_bg_v4.py >/dev/null
python3 make_v4_script.py >/dev/null
python3 -I make_assets_v5.py ../../refs/TB_会社資料_20261117.pdf >/dev/null 2>&1 || test -f assets_v5/tb_logo_black.png
python3 make_v5_script.py >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_v5.js
cd ..
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf Adctor_TB_LayerX_v5.pptx >/dev/null
rm -rf render_v5 && mkdir render_v5
pdftoppm -png -r 72 Adctor_TB_LayerX_v5.pdf render_v5/s
python3 source/preview.py render_v5 out=preview_v5.png
