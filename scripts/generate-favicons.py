from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1] / "site"
NAVY = "#0f172a"
BLUE = "#2563eb"
WHITE = "#ffffff"


def font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in (
        Path("C:/Windows/Fonts/georgiab.ttf"),
        Path("C:/Windows/Fonts/timesbd.ttf"),
    ):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


def render(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        (0, 0, size - 1, size - 1),
        radius=round(size * 14 / 64),
        fill=NAVY,
    )

    mark_font = font(round(size * 38 / 64))
    box = draw.textbbox((0, 0), "W", font=mark_font)
    width = box[2] - box[0]
    height = box[3] - box[1]
    draw.text(
        ((size - width) / 2 - box[0], size * 45 / 64 - height - box[1]),
        "W",
        font=mark_font,
        fill=WHITE,
    )

    dot_radius = size * 5 / 64
    dot_x = size * 50 / 64
    dot_y = size * 14 / 64
    draw.ellipse(
        (dot_x - dot_radius, dot_y - dot_radius, dot_x + dot_radius, dot_y + dot_radius),
        fill=BLUE,
    )
    return image


render(48).save(ROOT / "favicon-48x48.png", optimize=True)
render(180).save(ROOT / "apple-touch-icon.png", optimize=True)
render(256).save(
    ROOT / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
