"""Optimiza imágenes del proyecto para uso web (JPEG + WebP)."""
from pathlib import Path

from PIL import Image, ImageOps

ASSETS = Path(__file__).parent / "assets"
FOTOS = Path(__file__).parent / "fotos"

# nombre → (ancho máx, alto máx, calidad JPEG, calidad WebP)
PROFILES = {
    "fondo-hero.jpg": (1920, 1280, 82, 80),
    "novios-retrato.jpg": (1200, 1600, 82, 80),
    "hospedaje.jpeg": (900, 900, 80, 78),
    "regalos.jpeg": (900, 900, 80, 78),
    "ceremonia.jpeg": (900, 900, 80, 78),
    "recepcion.jpeg": (900, 900, 80, 78),
    "transporte.jpeg": (900, 900, 80, 78),
}

FOTOS_MAP = {
    "01-fondo-hero-baile.jpg": (1920, 1280, 82, 80),
    "02-novios-retrato.jpg": (1200, 1600, 82, 80),
}


def optimize_image(path: Path, max_w: int, max_h: int, jpg_q: int, webp_q: int) -> None:
    original_kb = path.stat().st_size / 1024
    with Image.open(path) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

        img.save(path, "JPEG", quality=jpg_q, optimize=True, progressive=True)

        webp_path = path.with_suffix(".webp")
        img.save(webp_path, "WEBP", quality=webp_q, method=6)

        jpg_kb = path.stat().st_size / 1024
        webp_kb = webp_path.stat().st_size / 1024
        print(
            f"  {path.name}: {original_kb:.0f} KB -> {jpg_kb:.0f} KB JPG + {webp_kb:.0f} KB WebP "
            f"({img.width}x{img.height})"
        )


def main() -> None:
    print("Optimizando imagenes en assets/...\n")
    for name, profile in PROFILES.items():
        path = ASSETS / name
        if not path.exists():
            print(f"  [omitido] {name} no encontrado")
            continue
        optimize_image(path, *profile)

    if FOTOS.exists():
        print("\nOptimizando originales en fotos/...\n")
        for name, profile in FOTOS_MAP.items():
            path = FOTOS / name
            if not path.exists():
                continue
            optimize_image(path, *profile)

    old_hero = ASSETS / "fondo-hero.jpeg"
    if old_hero.exists():
        old_hero.unlink()
        print("\n  Eliminado fondo-hero.jpeg (duplicado antiguo)")

    print("\nListo.")


if __name__ == "__main__":
    main()
