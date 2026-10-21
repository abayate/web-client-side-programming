"""Take a full-screen screenshot and save it to ./screenshots with the next number.

Usage:
    python snap.py "Antigravity IDE installed"        # 3-second delay
    python snap.py "Codex in VS Code" 5               # 5-second delay

Gives you a few seconds to switch to the window you want captured.
"""
import re
import sys
import time
from pathlib import Path

from PIL import ImageGrab

SHOTS = Path(__file__).parent / "screenshots"


def next_number():
    nums = [int(m.group()) for p in SHOTS.glob("*") if (m := re.match(r"\d+", p.name))]
    return max(nums, default=0) + 1


def main():
    if len(sys.argv) < 2:
        sys.exit('Usage: python snap.py "caption" [delay_seconds]')
    caption = sys.argv[1]
    delay = float(sys.argv[2]) if len(sys.argv) > 2 else 3
    SHOTS.mkdir(exist_ok=True)

    for s in range(int(delay), 0, -1):
        print(f"Capturing in {s}...", flush=True)
        time.sleep(1)
    time.sleep(delay - int(delay))

    safe = re.sub(r'[<>:"/\\|?*]', "", caption).replace(" ", "_")
    out = SHOTS / f"{next_number():02d}_{safe}.png"
    ImageGrab.grab(all_screens=True).save(out)
    print(f"Saved {out.name}")


if __name__ == "__main__":
    main()
