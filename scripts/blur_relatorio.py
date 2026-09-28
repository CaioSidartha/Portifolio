from PIL import Image, ImageFilter, ImageDraw
from pathlib import Path

src = Path(r"C:\Users\caiom\OneDrive\Área de Trabalho\CaioPortifolio\assets\MonitorOps\relatorio.png")
img = Image.open(src).convert("RGBA")
w, h = img.size
print("size", w, h)

base = img.copy()
# Coordenadas em frações — cobrir KPIs monetários + colunas VALOR* da tabela
regions = [
    # KPI VALOR TOCADO (card 3)
    (0.365, 0.205, 0.530, 0.325),
    # KPI VALOR GANHO (card 4)
    (0.540, 0.205, 0.710, 0.325),
    # Cabeçalhos + células VALOR TOCADO / VALOR GANHO na tabela
    (0.455, 0.505, 0.655, 0.915),
]

out = base.copy()
for (x0, y0, x1, y1) in regions:
    box = (int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))
    crop = base.crop(box)
    small = crop.resize(
        (max(4, crop.width // 36), max(4, crop.height // 36)),
        Image.Resampling.BILINEAR,
    )
    pixel = small.resize(crop.size, Image.Resampling.NEAREST)
    blurred = pixel.filter(ImageFilter.GaussianBlur(radius=8))
    mask = Image.new("L", crop.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, crop.width - 1, crop.height - 1], radius=8, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=3))
    out.paste(blurred, box[:2], mask)

out_path = src.with_name("relatorio-privado.png")
out.convert("RGB").save(out_path, "PNG", optimize=True)
print("saved", out_path)
