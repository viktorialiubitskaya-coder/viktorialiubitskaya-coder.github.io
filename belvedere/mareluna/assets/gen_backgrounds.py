#!/usr/bin/env python3
"""Generate section background images via Google Imagen 4."""
import base64, json, os, subprocess, requests

API_KEY = "AIzaSyDe0KI-k4aip5ufMKi0WjnCYNfy6IrUkNI"
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=" + API_KEY
OUT = os.path.dirname(os.path.abspath(__file__))

BACKGROUNDS = [
    {
        "file": "bg-pizza-drink.jpg",
        "ratio": "16:9",
        "quality": 88,
        "max_px": 1600,
        "prompt": (
            "Aged cream paper background (#f5f1e8) with classic Italian Sicilian azulejo tile pattern "
            "in deep cobalt blue on the right edge, fragmenting into scattered tile fragments and ink "
            "splash particles toward the left center. The blue ceramic tiles feature traditional "
            "Mediterranean motifs: floral mandalas, geometric stars, decorative borders, baroque "
            "flourishes. Classic Calabrian maiolica style. Tiles have hand-painted texture with paint "
            "bleed and aging. Background is warm cream paper with subtle grain, like an old menu page. "
            "The pattern occupies roughly the right 35% with organic broken edges, leaving left 65% as "
            "clean cream paper for text overlay. High resolution, professional editorial quality. "
            "Strictly Italian Mediterranean ceramic tradition, no Asian or Chinese or Japanese elements, "
            "no text, no watermarks, no logos, no photographs."
        ),
    },
    {
        "file": "bg-menu-highlights.jpg",
        "ratio": "16:9",
        "quality": 88,
        "max_px": 1600,
        "prompt": (
            "Aged cream paper background (#ede5d4) with delicate blue and white Italian azulejo tile "
            "pattern in the top-left corner only. The cobalt blue ceramic tiles fragment and dissolve "
            "into the cream paper toward the center-right with watercolor-like ink scatter. Tiles "
            "feature traditional Mediterranean motifs: floral mandalas, geometric crosses, decorative "
            "arabesques. Most of the composition (right 75%) is clean warm cream paper with subtle "
            "organic grain texture, perfect for text and photography overlay. Italian Calabrian maiolica "
            "tradition, hand-painted feel, slightly aged. No text, no watermarks, no logos. "
            "Only Italian European decorative motifs, no Asian patterns."
        ),
    },
    {
        "file": "bg-recensioni.jpg",
        "ratio": "16:9",
        "quality": 88,
        "max_px": 1600,
        "prompt": (
            "Aged cream paper background (#f5f1e8) with a single column of blue azulejo tile pattern "
            "running vertically along the right edge only. The cobalt blue Italian ceramic tiles feature "
            "traditional Mediterranean motifs and fragment organically into the cream paper toward the "
            "left center with ink splash particles. Pattern occupies roughly the right 25% with broken "
            "hand-torn edges. Left 75% is clean warm cream paper with paper grain texture. Italian "
            "Sicilian Amalfi maiolica tradition, hand-painted ceramic feel. "
            "No text, no watermarks, no logos, no Asian elements."
        ),
    },
    {
        "file": "bg-chi-siamo.jpg",
        "ratio": "16:9",
        "quality": 88,
        "max_px": 1600,
        "prompt": (
            "Deep rich navy blue background (dark midnight blue, #0a1838 to #152a52 gradient) with subtle "
            "cobalt blue Italian azulejo tile pattern in the right corner, glowing gently as if backlit "
            "from behind. The traditional Mediterranean ceramic tiles fragment into scattered luminous "
            "particles toward the center, like glowing ink in dark water. Most of the composition is "
            "rich navy blue (left 70%), perfect for white text overlay. The azulejo pattern is delicate, "
            "glowing, dreamlike, almost ghostly, with low contrast against the dark background. "
            "Italian Calabrian maiolica style. Mood: nighttime, quiet, Mediterranean contemplative. "
            "No text, no watermarks, no logos. NOT black — deep dark navy blue."
        ),
    },
    {
        "file": "bg-contatti.jpg",
        "ratio": "16:9",
        "quality": 88,
        "max_px": 1600,
        "prompt": (
            "Deep navy blue background (#0a1838) with a soft glow of cobalt blue azulejo tile pattern "
            "in the bottom-right corner only. Traditional Italian Mediterranean ceramic tiles fragment "
            "and dissolve into the dark navy with luminous glowing edges. Pattern occupies bottom-right "
            "20%, rest is rich dark navy blue. Pattern is subtle, ghostly, like moonlight on water, "
            "very low contrast. Italian Calabrian maiolica tradition. Mediterranean night mood. "
            "NOT black — deep navy blue. No text, no watermarks, no logos."
        ),
    },
    {
        "file": "paper-texture-tile.jpg",
        "ratio": "1:1",
        "quality": 85,
        "max_px": 800,
        "prompt": (
            "Seamless tileable warm cream paper texture, base color #f5f1e8, slightly aged and "
            "weathered like an old Italian restaurant menu page. Subtle organic grain, very faint paper "
            "fibers, tiny imperfections, soft texture variations. Photorealistic, professional, "
            "can be tiled seamlessly without visible edges. Pure paper texture only, "
            "no images, no patterns, no text, no decorations."
        ),
    },
]

def generate(bg):
    name = bg["file"]
    print(f"\nGenerating {name} ({bg['ratio']})...")
    payload = {
        "instances": [{"prompt": bg["prompt"]}],
        "parameters": {"sampleCount": 1, "aspectRatio": bg["ratio"]},
    }
    r = requests.post(BASE_URL, json=payload, timeout=90)
    if r.status_code != 200:
        print(f"  ERROR {r.status_code}: {r.text[:400]}")
        return False
    data = r.json()
    try:
        b64 = data["predictions"][0]["bytesBase64Encoded"]
    except (KeyError, IndexError) as e:
        print(f"  ERROR parsing response: {e}")
        return False
    png_path = os.path.join(OUT, name.replace(".jpg", "_tmp.png"))
    jpg_path = os.path.join(OUT, name)
    with open(png_path, "wb") as f:
        f.write(base64.b64decode(b64))
    subprocess.run([
        "sips", "-s", "format", "jpeg",
        "-s", "formatOptions", str(bg["quality"]),
        "-Z", str(bg["max_px"]),
        png_path, "--out", jpg_path
    ], capture_output=True)
    os.remove(png_path)
    size_kb = os.path.getsize(jpg_path) // 1024
    print(f"  Saved → {name} ({size_kb}KB)")
    return True

for bg in BACKGROUNDS:
    generate(bg)

print("\nDone.")
