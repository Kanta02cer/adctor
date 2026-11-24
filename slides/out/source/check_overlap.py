# PDF内で同じ行の文字が重なって描画されていないかを検出する
import sys, fitz
d = fitz.open(sys.argv[1]); bad = 0
for pi, p in enumerate(d):
    for b in p.get_text("rawdict")["blocks"]:
        for l in b.get("lines", []):
            if l["dir"] != (1.0, 0.0): continue
            for s in l["spans"]:
                ch = s["chars"]
                for a, c in zip(ch, ch[1:]):
                    if c["origin"][0] < a["origin"][0] - 0.5 and abs(c["origin"][1] - a["origin"][1]) < 1:
                        bad += 1
                        print(f"p{pi+1}: '{''.join(x['c'] for x in ch)[:40]}' at '{a['c']}{c['c']}'")
print("overlaps:", bad)
