#!/usr/bin/env bash
# v6（表紙のトーン × メルカリ型の構成）の再生成：素材 → PPTX → PDF → ページ画像 → preview_v6.png
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
python3 make_bg_v4.py >/dev/null
python3 -I make_assets_v5.py ../../refs/TB_会社資料_20261117.pdf >/dev/null 2>&1 || test -f assets_v5/tb_logo_black.png
python3 make_bg_v6.py >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_v6.js
cd ..
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf Adctor_TB_v6.pptx >/dev/null
rm -rf render_v6 && mkdir render_v6
pdftoppm -png -r 72 Adctor_TB_v6.pdf render_v6/s
python3 source/preview.py render_v6 out=preview_v6.png
