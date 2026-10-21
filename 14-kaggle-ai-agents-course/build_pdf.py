"""Combine every image in ./screenshots into one submission PDF.

Images are placed in filename order, one per page, scaled to fit.
The caption under each image comes from its filename:
    03_Antigravity_IDE_installed.png  ->  "Antigravity IDE installed"

Usage:
    python build_pdf.py                       # uses NAME below
    python build_pdf.py "First Last"          # override the name
"""
import re
import sys
from datetime import date
from pathlib import Path

from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

NAME = "Anthony Bayate"
TITLE = "Project 1 - 5-Day AI Agents: Intensive Vibe Coding Course With Google"

HERE = Path(__file__).parent
SHOTS = HERE / "screenshots"
EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"}
MARGIN = 36  # 0.5 inch


def caption_for(path):
    stem = re.sub(r"^\d+[\s_-]*", "", path.stem)
    return stem.replace("_", " ").strip()


def header(c, name, width, height, page):
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, height - MARGIN, name)
    c.setFont("Helvetica", 9)
    c.drawRightString(width - MARGIN, height - MARGIN, f"Page {page}")
    c.drawString(MARGIN, height - MARGIN - 14, TITLE)
    c.line(MARGIN, height - MARGIN - 20, width - MARGIN, height - MARGIN - 20)
    return height - MARGIN - 30  # top of usable area


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else NAME
    images = sorted(p for p in SHOTS.iterdir() if p.suffix.lower() in EXTS)
    if not images:
        sys.exit(f"No images found in {SHOTS}")

    out = HERE / f"Proj1_{name.replace(' ', '_')}.pdf"
    width, height = letter
    c = canvas.Canvas(str(out), pagesize=letter)
    c.setTitle(f"{name} - Project 1")

    # Cover page
    top = header(c, name, width, height, 1)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(MARGIN, top - 40, "Project 1 Screenshots")
    c.setFont("Helvetica", 12)
    c.drawString(MARGIN, top - 62, "5-Day AI Agents: Intensive Vibe Coding Course With Google")
    c.drawString(MARGIN, top - 80, f"Submitted: {date.today():%B %d, %Y}")
    y = top - 115
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, y, "Contents")
    c.setFont("Helvetica", 11)
    for i, img in enumerate(images, start=2):
        y -= 16
        if y < MARGIN:
            break
        c.drawString(MARGIN + 10, y, f"p.{i}  {caption_for(img)}")
    c.showPage()

    for page, img in enumerate(images, start=2):
        top = header(c, name, width, height, page)
        cap = caption_for(img)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(MARGIN, top - 4, cap)

        with Image.open(img) as im:
            im = im.convert("RGB")
            iw, ih = im.size
            box_w = width - 2 * MARGIN
            box_h = top - 18 - MARGIN
            scale = min(box_w / iw, box_h / ih)
            dw, dh = iw * scale, ih * scale
            c.drawImage(ImageReader(im), MARGIN, top - 18 - dh, dw, dh)
        c.showPage()

    c.save()
    print(f"Wrote {out} ({len(images)} screenshots)")


if __name__ == "__main__":
    main()
