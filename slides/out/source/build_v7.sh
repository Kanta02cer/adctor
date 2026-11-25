#!/usr/bin/env bash
# v7（SmartHR Company Profile 型・TB配色・20pt以上）の再生成
set -euo pipefail
cd "$(dirname "$0")"
SK=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
python3 -I make_assets_v5.py ../../refs/TB_会社資料_20261117.pdf >/dev/null 2>&1 || test -f assets_v5/tb_logo_black.png
NODE_PATH=/opt/node22/lib/node_modules node make_screens_v7.js >/dev/null
python3 make_bg_v7.py >/dev/null
NODE_PATH="$PWD/node_modules" PPTX_SKILL="$SK" node build_v7.js
cd ..
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf Adctor_TB_CompanyProfile_v7.pptx >/dev/null
rm -rf render_v7 && mkdir render_v7
pdftoppm -png -r 72 Adctor_TB_CompanyProfile_v7.pdf render_v7/s
python3 source/preview.py render_v7 out=preview_v7.png
python3 -W ignore source/check_overlap.py Adctor_TB_CompanyProfile_v7.pdf | tail -1
python3 source/check_minfont.py Adctor_TB_CompanyProfile_v7.pptx Adctor_TB_CompanyProfile_v7.pdf 20
