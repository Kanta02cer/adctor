import sys, glob
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]; out = sys.argv[2].split("=")[1]
fs = sorted(glob.glob(d + "/s-*.png"))
ims = [Image.open(f).convert("RGB") for f in fs]
w, h = 480, 270; cols = 4; pad = 16
rows = (len(ims) + cols - 1) // cols
G = Image.new("RGB", (cols * w + (cols + 1) * pad, rows * (h + 22) + (rows + 1) * pad), "#E9ECF1")
dr = ImageDraw.Draw(G)
try: f = ImageFont.truetype("/root/.fonts/Montserrat_600SemiBold.ttf", 13)
except Exception: f = None
for i, im in enumerate(ims):
    x = pad + (i % cols) * (w + pad); y = pad + (i // cols) * (h + 22 + pad)
    G.paste(im.resize((w, h), Image.LANCZOS), (x, y))
    dr.rectangle([x, y, x + w - 1, y + h - 1], outline="#C9CED6")
    dr.text((x, y + h + 4), f"{i+1:02d}", fill="#111318", font=f)
G.save(out)
print(out, len(ims))
