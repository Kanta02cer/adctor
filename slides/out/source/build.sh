#!/usr/bin/env bash
# 再生成：PPTX → PDF → ページ画像 → preview.png
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build.js
cd ..
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf Adctor_SmartHR_reference_v2.pptx >/dev/null
rm -rf render && mkdir render
pdftoppm -png -r 72 Adctor_SmartHR_reference_v2.pdf render/s
python3 source/preview.py render out=preview.png
