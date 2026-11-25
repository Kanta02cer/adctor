# 文字の最小サイズを PPTX（全ランの指定値）と PDF（描画された文字）の両方で確かめる
import sys, fitz
from pptx import Presentation
pptx, pdf, mn = sys.argv[1], sys.argv[2], float(sys.argv[3])
low = []
for i, sl in enumerate(Presentation(pptx).slides, 1):
    for sh in sl.shapes:
        if not sh.has_text_frame: continue
        for p in sh.text_frame.paragraphs:
            for r in p.runs:
                if r.text.strip() and r.font.size and r.font.size.pt < mn: low.append((i, r.font.size.pt, r.text[:15]))
print("pptx runs below", mn, ":", len(low), low[:5])
d = fitz.open(pdf); sizes = []
for i, pg in enumerate(d, 1):
    for b in pg.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                if s["text"].strip(): sizes.append((round(s["size"], 1), i, s["text"][:12]))
sm = sorted(sizes)[:3]
print("pdf smallest spans:", sm)
