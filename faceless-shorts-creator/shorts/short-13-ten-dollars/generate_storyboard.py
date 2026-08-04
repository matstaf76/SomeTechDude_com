#!/usr/bin/env python3
r"""
generate_storyboard.py — page art for "The $10 Decision" via the Google GenAI SDK.

WHY GEMINI AND NOT IMAGEN
    The brief asked for imagen-3.0-generate-002 with local images as references. That is not
    possible: Imagen's generate_images endpoint is TEXT-PROMPT ONLY — it has no parameter for
    reference imagery — and imagen-3.0-generate-002 is retired ("no longer available to new
    users"). Reference-image conditioning lives on the Gemini image models, which take image
    Parts alongside the prompt via generate_content. That is what this script uses, so rule 2
    (reuse existing characters, never invent them) is actually enforceable.

RULES THIS SCRIPT ENFORCES
    1. The output folder is created if missing.
    2. Background people are NEVER invented. Every page declares which character PNGs it
       references; the file must exist in the library or the page FAILS LOUD. Crowd pages
       sample from the library's people deterministically (seeded by page id) so reruns
       reproduce the same extras.
    3. Every image is forced to 1:1, centred, sized for 2.5D layering in Remotion.
    4. Outputs are page_01.png … page_17.png plus a .json sidecar per page.

USAGE
    python generate_storyboard.py --list                 # show the manifest and resolved refs
    python generate_storyboard.py --pages 1,2 --dry-run  # validate + show payload, no API call
    python generate_storyboard.py --pages 1,2            # generate pages 1 and 2
    python generate_storyboard.py                        # generate all 17
    python generate_storyboard.py --pages 5 --force      # overwrite an existing page

    --model pro|fast|lite|<raw id>   default pro (character consistency matters most here)
    --library / --output             override the directories
    --size 1K|2K|4K                  default 1K (~1024x1024)

REQUIREMENTS
    pip install google-genai
    GEMINI_API_KEY in the environment or in a .env beside this script.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

# --------------------------------------------------------------------------------------
# Configuration — the two directories from the brief. Override with --library / --output.
# --------------------------------------------------------------------------------------
DEFAULT_LIBRARY = Path(r"C:\Users\matst\Claude\Projects\financialverse-kids\Childrens_Storyboards")
DEFAULT_OUTPUT = Path(r"C:\Users\matst\Claude\Projects\financialverse-kids\The $10 Decision")

# Confirmed against the live models endpoint for this account. Only these accept reference
# images; the imagen-* ids on the same key are text-only and cannot honour rule 2.
MODEL_PRESETS = {
    "pro": "gemini-3-pro-image",         # best character consistency — default for finals
    "fast": "gemini-3.1-flash-image",    # cheaper drafts
    "lite": "gemini-3.1-flash-lite-image",
}
DEFAULT_MODEL = "pro"
DEFAULT_SIZE = "1K"                      # ~1024x1024 at 1:1
ASPECT = "1:1"                           # rule 3, non-negotiable

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

# Distinctive tokens of the named cast. Substring match, because filenames vary wildly
# (Jack_the_Ruiner, JackRuiner_Angry, jack-ruiner-v2 all have to be caught). This is a
# safety net on top of the manifest-derived principal set computed in main().
PRINCIPAL_TOKENS = {"jake", "maya", "ironbanker", "banker", "ruiner", "swipe", "grandma"}
# Folders holding location plates rather than people.
SCENERY_DIRS = {"backgrounds", "background", "locations", "sets", "props", "scenery"}

# Style contract prepended to every page so the 17 pages read as one book.
STYLE = (
    "Children's picture-book illustration for ages 5+, soft painterly watercolour with clean "
    "line work, warm and friendly, bright readable shapes, gentle lighting. "
    "SQUARE 1:1 composition, subject centred with even margins on all four sides, "
    "no text or lettering anywhere in the image, no logos, no watermarks. "
    "Flat mid-ground staging with clear foreground/midground/background separation so the "
    "art can be cut into layers for 2.5D parallax animation."
)

# --------------------------------------------------------------------------------------
# The manifest — 17 pages of "The $10 Decision", matching shorts/short-13-ten-dollars.
#   refs   : library assets that MUST be referenced (rule 2). Missing -> hard error.
#   crowd  : how many additional background people to sample from the library.
# --------------------------------------------------------------------------------------
MANIFEST: list[dict] = [
    dict(page=1, beat="hook-bigday", refs=["jake", "maya"], crowd=0,
         prompt="Jake and Maya, eight-year-old cousins, standing side by side outside their "
                "home in warm morning light, backpacks on, excited for the day ahead."),
    dict(page=2, beat="fieldtrip", refs=["jake", "maya", "school-bus"], crowd=3,
         prompt="A yellow school bus pulling up outside the school. Jake and Maya climbing "
                "aboard with classmates, cheerful morning energy."),
    dict(page=3, beat="giftcard", refs=["jake", "maya", "grandma"], crowd=0,
         prompt="Grandma kneeling to press a shiny ten-dollar gift card into each child's "
                "hand, tender and warm, close family moment."),
    dict(page=4, beat="arrive-city", refs=["school-bus", "fairweather"], crowd=0,
         prompt="The school bus rolling into Fairweather, the city of money — tall friendly "
                "glass towers with coin motifs, wide establishing view."),
    dict(page=5, beat="bank-wonder", refs=["jake", "maya", "bank-hall"], crowd=4,
         prompt="Interior of a grand bank like a museum of gold and glass, high ceilings, "
                "the class gazing upward in wonder."),
    dict(page=6, beat="iron-banker", refs=["iron-banker", "jake", "maya", "bank-hall"], crowd=3,
         prompt="The Iron Banker waving hello — a kind older man with a grey beard wearing "
                "deep purple and gold ceremonial armour, dignified and welcoming."),
    dict(page=7, beat="temptation-shop", refs=["jake", "maya", "toy-shop"], crowd=2,
         prompt="Jake and Maya slowing down at a shop window crammed with toys and candy, "
                "tempted, faces lit by the display."),
    dict(page=8, beat="vault", refs=["iron-banker", "jake", "maya", "vault"], crowd=3,
         prompt="A giant open vault door with coins stacked to the ceiling, the Iron Banker "
                "presenting it, children awed at the scale."),
    dict(page=9, beat="hunger", refs=["jake", "maya"], crowd=2,
         prompt="Jake with a hand on his rumbling tummy, Maya laughing beside him, "
                "lunchtime approaching."),
    dict(page=10, beat="price-shock", refs=["jake", "maya", "food-counter"], crowd=2,
         prompt="At the food counter under a menu board of high prices. Maya recounting the "
                "money on her card, brow furrowed; Jake surprised. Worry, not despair."),
    dict(page=11, beat="the-swipe", refs=["the-swipe", "food-counter"], crowd=0,
         prompt="A strange shimmer crackling beside the candy rack — The Swipe, a glowing "
                "distortion that makes everything behind it look irresistible. Not a person."),
    dict(page=12, beat="jack-ruiner", refs=["jack-ruiner", "food-counter"], crowd=0,
         prompt="Jack the Ruiner half-hidden behind the tall price board, peeking out. "
                "Sneaky and mischievous, mildly comic — never frightening for a five-year-old."),
    dict(page=13, beat="naming-1", refs=["iron-banker", "jake", "maya"], crowd=0,
         prompt="The Iron Banker kneeling to the children's eye level, calm and kind, "
                "explaining gently. Trust and reassurance."),
    dict(page=14, beat="naming-2", refs=["the-swipe", "jack-ruiner"], crowd=0,
         prompt="Split composition: The Swipe on one side and Jack the Ruiner on the other, "
                "both visibly dimmed and shrinking now that they have been named."),
    dict(page=15, beat="lunch-gift", refs=["iron-banker", "jake", "maya", "food-counter"], crowd=3,
         prompt="The Iron Banker clapping his hands with a huge delighted grin as lunch trays "
                "appear. Generous, joyful."),
    dict(page=16, beat="cheer", refs=["jake", "maya", "lunch-table"], crowd=6,
         prompt="The whole class cheering around a long table as trays of food are passed "
                "down. Warm, busy, celebratory."),
    dict(page=17, beat="payoff-loop", refs=["iron-banker", "jake", "maya"], crowd=0,
         prompt="The Iron Banker giving a knowing wink, Jake and Maya grinning back. "
                "Framed to echo page 1 so the story loops."),
]


# --------------------------------------------------------------------------------------
# Library scanning
# --------------------------------------------------------------------------------------
def normalise(stem: str) -> str:
    """jake_neutral_v2 -> jakeneutralv2, so 'jake' can match 'Jake_Neutral.png'."""
    return "".join(ch for ch in stem.lower() if ch.isalnum())


def scan_library(library: Path) -> dict[str, list[Path]]:
    """Map a normalised asset key -> every image file whose stem starts with that key.

    Recursive, so Childrens_Storyboards/characters/Jake.png and a flat layout both work.
    """
    if not library.is_dir():
        sys.exit(f"Library not found: {library}\n"
                 "Pass --library if your asset folder lives elsewhere.")
    index: dict[str, list[Path]] = {}
    for path in sorted(library.rglob("*")):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS:
            index.setdefault(normalise(path.stem), []).append(path)
    return index


def resolve(key: str, index: dict[str, list[Path]]) -> Path:
    """Find one library file for a manifest key. Never invents — raises if absent."""
    want = normalise(key)
    if want in index:
        return index[want][0]
    prefixed = sorted(k for k in index if k.startswith(want))
    if prefixed:
        return index[prefixed[0]][0]
    raise KeyError(key)


def people_pool(index: dict[str, list[Path]], exclude: set[Path]) -> list[Path]:
    """Library images usable as anonymous background people.

    Rule 2: crowds come from real assets, never invention. But not every asset is a valid
    extra — principals must not be duplicated into a crowd (Grandma has one scene; The Swipe
    is an effect, not a person), and location plates are not people at all. Both are filtered
    out here, leaving classmates, teachers and townsfolk.
    """
    def is_principal(p: Path) -> bool:
        stem = normalise(p.stem)
        return any(tok in stem for tok in PRINCIPAL_TOKENS)

    def is_scenery(p: Path) -> bool:
        return bool(SCENERY_DIRS & {q.lower() for q in p.parts})

    everything = [p for paths in index.values() for p in paths
                  if p not in exclude and not is_principal(p) and not is_scenery(p)]
    preferred = [p for p in everything
                 if {"people", "extras", "crowd"} & {q.lower() for q in p.parts}]
    return sorted(set(preferred or everything))


def sample_crowd(pool: list[Path], n: int, seed: str) -> list[Path]:
    """Deterministic pick so a rerun of page 5 references the same extras as before."""
    if n <= 0 or not pool:
        return []
    digest = hashlib.sha256(seed.encode()).digest()
    picks, used = [], set()
    for i in range(min(n, len(pool))):
        idx = digest[i % len(digest)] * 257 + i
        idx %= len(pool)
        while idx in used:
            idx = (idx + 1) % len(pool)
        used.add(idx)
        picks.append(pool[idx])
    return picks


# --------------------------------------------------------------------------------------
# Prompt + payload
# --------------------------------------------------------------------------------------
def mime_for(path: Path) -> str:
    return {"png": "image/png", "webp": "image/webp"}.get(
        path.suffix.lower().lstrip("."), "image/jpeg")


def build_prompt(page: dict, named: list[Path], crowd: list[Path]) -> str:
    parts = [STYLE, "", f"SCENE (page {page['page']:02d}): {page['prompt']}"]
    if named:
        parts += ["", "CHARACTER REFERENCES — match these exactly (design, colours, "
                      "proportions). Do not redesign them:",
                  *(f"  - {p.stem}" for p in named)]
    if crowd:
        parts += ["", "BACKGROUND PEOPLE — reuse these existing designs. Do NOT invent new "
                      "background characters; vary only pose and placement:",
                  *(f"  - {p.stem}" for p in crowd)]
    return "\n".join(parts)


def load_env(script_dir: Path) -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    env = script_dir / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                if k.strip() == "GEMINI_API_KEY":
                    return v.strip().strip('"').strip("'")
    return ""


def explain(exc: Exception) -> str:
    """Turn an SDK exception into one actionable line instead of a wall of stack trace."""
    text = str(exc)
    if "RESOURCE_EXHAUSTED" in text or "429" in text:
        if "limit: 0" in text:
            return ("this Google Cloud project has NO image-generation quota (limit: 0). "
                    "Gemini image models have no free tier — enable billing on the project "
                    "that owns this API key, then rerun.")
        return "rate limited. Wait for the retry window and rerun; finished pages are skipped."
    if "API_KEY_INVALID" in text or "401" in text or "403" in text:
        return "the API key was rejected. Check GEMINI_API_KEY."
    if "no longer available" in text or "404" in text:
        return (f"the model was rejected as unavailable. Retired ids (imagen-3.x, imagen-4 "
                f"fast) fail this way — try --model fast or --model pro.\n    {text[:200]}")
    return f"{type(exc).__name__}: {text[:300]}"


def generate_page(client, types, model: str, size: str, page: dict,
                  named: list[Path], crowd: list[Path], out_png: Path) -> None:
    prompt = build_prompt(page, named, crowd)
    contents: list = [prompt]
    for ref in named + crowd:
        contents.append(types.Part.from_bytes(data=ref.read_bytes(), mime_type=mime_for(ref)))

    resp = client.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(aspect_ratio=ASPECT, image_size=size),
        ),
    )

    blob, notes = None, []
    for cand in (resp.candidates or []):
        for part in ((cand.content.parts if cand.content else None) or []):
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                blob = inline.data
            elif getattr(part, "text", None):
                notes.append(part.text)
    if notes:
        print(f"    model said: {' '.join(notes)[:200]}")
    if not blob:
        raise RuntimeError("no image returned (safety block, refusal, or bad model id)")

    out_png.write_bytes(blob)
    out_png.with_suffix(".json").write_text(json.dumps({
        "page": page["page"], "beat": page["beat"], "model": model,
        "aspect_ratio": ASPECT, "image_size": size, "prompt": prompt,
        "refs": [str(p) for p in named], "crowd": [str(p) for p in crowd],
        "created": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }, indent=2), encoding="utf-8")
    print(f"    -> {out_png.name}  ({len(blob)//1024} KB)  + sidecar")


# --------------------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser(description="Generate page art for The $10 Decision.")
    ap.add_argument("--library", type=Path, default=DEFAULT_LIBRARY)
    ap.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    ap.add_argument("--pages", help="e.g. 1,2 or 3-7 (default: all)")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--size", default=DEFAULT_SIZE, choices=["1K", "2K", "4K"])
    ap.add_argument("--dry-run", action="store_true", help="validate + print payload, no API call")
    ap.add_argument("--list", action="store_true", help="show manifest and resolved refs, then exit")
    ap.add_argument("--force", action="store_true", help="overwrite existing page files")
    args = ap.parse_args()

    wanted: set[int] = set()
    if args.pages:
        for chunk in args.pages.split(","):
            chunk = chunk.strip()
            if "-" in chunk:
                a, b = chunk.split("-", 1)
                wanted.update(range(int(a), int(b) + 1))
            elif chunk:
                wanted.add(int(chunk))
    pages = [p for p in MANIFEST if not wanted or p["page"] in wanted]
    if not pages:
        sys.exit(f"No pages matched --pages {args.pages}")

    index = scan_library(args.library)
    n_files = sum(len(v) for v in index.values())
    print(f"library : {args.library}")
    print(f"          {n_files} image(s), {len(index)} asset key(s)")

    # Rule 1: create the output folder if it does not exist.
    args.output.mkdir(parents=True, exist_ok=True)
    print(f"output  : {args.output}")

    model = MODEL_PRESETS.get(args.model, args.model)
    print(f"model   : {model}   aspect={ASPECT}  size={args.size}\n")

    # Any asset named by ANY page is a principal, so it can never be recycled as anonymous
    # crowd filler — derived from the manifest rather than hardcoded, so adding a character
    # to a page automatically protects it.
    principals: set[Path] = set()
    for page in MANIFEST:
        for key in page["refs"]:
            try:
                principals.add(resolve(key, index))
            except KeyError:
                pass

    # Resolve every reference up front so a missing asset fails before any spend.
    plan, missing = [], []
    for page in pages:
        named: list[Path] = []
        for key in page["refs"]:
            try:
                named.append(resolve(key, index))
            except KeyError:
                missing.append((page["page"], key))
        crowd = sample_crowd(people_pool(index, principals | set(named)), page["crowd"],
                             seed=f"{page['beat']}-{page['page']}")
        plan.append((page, named, crowd))

    if missing:
        print("MISSING ASSETS — rule 2 forbids inventing these, so nothing was generated:\n")
        for pg, key in missing:
            print(f"  page {pg:02d}: no library file matches '{key}'")
        print("\nAdd the artwork (any of .png/.jpg/.webp, name it after the key) and rerun.")
        sys.exit(1)

    for page, named, crowd in plan:
        tag = f"page {page['page']:02d} [{page['beat']}]"
        refs = ", ".join(p.stem for p in named) or "—"
        extras = ", ".join(p.stem for p in crowd) or "—"
        print(f"{tag}\n    refs : {refs}\n    crowd: {extras}")
        if args.list:
            continue
        out_png = args.output / f"page_{page['page']:02d}.png"
        if out_png.exists() and not args.force:
            print("    skip (exists — pass --force to overwrite)")
            continue
        if args.dry_run:
            body = build_prompt(page, named, crowd)
            print("    [dry-run] no API call. prompt preview:")
            for line in body.splitlines()[:6]:
                print(f"      {line[:96]}")
            print(f"      … {len(body)} chars, {len(named) + len(crowd)} reference image(s)")
            continue
        print("    generating…")
        try:
            generate_page(_CLIENT["client"], _CLIENT["types"], model, args.size,
                          page, named, crowd, out_png)
        except Exception as exc:                      # noqa: BLE001 — report, don't traceback
            sys.exit(f"    FAILED on page {page['page']:02d}: {explain(exc)}")

    if args.list or args.dry_run:
        print("\nvalidated; nothing generated.")


_CLIENT: dict = {}

if __name__ == "__main__":
    # Only import/authenticate when a real generation is possible, so --list and --dry-run
    # work on a machine with no SDK and no key.
    if not ({"--dry-run", "--list"} & set(sys.argv)):
        try:
            from google import genai
            from google.genai import types
        except ImportError:
            sys.exit("google-genai not installed. Run: pip install google-genai")
        api_key = load_env(Path(__file__).resolve().parent)
        if not api_key:
            sys.exit("GEMINI_API_KEY not set (environment or .env beside this script).")
        _CLIENT["client"] = genai.Client(api_key=api_key)
        _CLIENT["types"] = types
    main()
