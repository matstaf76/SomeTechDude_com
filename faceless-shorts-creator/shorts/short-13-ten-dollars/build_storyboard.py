#!/usr/bin/env python3
"""Emit script.md + beats.json for short-13 from one source of truth."""
import json, math, os, re

ROOT = "/home/user/SomeTechDude_com/faceless-shorts-creator"
PROJ = os.path.join(ROOT, "shorts", "short-13-ten-dollars")

WPS = 2.25          # gentle storyteller pace (example short-7 ran 2.2-2.5)
BREATH = 0.7        # inter-beat pause

# beat, icon, on-screen, clean caption text, v3 delivery tags, keep-in-55s-cut
BEATS = [
 ("hook-bigday","😄","Jake and Maya side by side, morning light, backpacks on",
  "Jake and Maya are cousins, and today is a very big day.",
  "[warmly]", True),
 ("fieldtrip","🚌","The yellow school bus pulling up outside school",
  "Their class is going on a field trip to the bank!",
  "[cheerfully]", True),
 ("giftcard","💳","Grandma pressing a shiny gift card into each small hand",
  "Grandma gives them each a shiny ten-dollar gift card. “This is your lunch money — the rest is yours to choose.”",
  "[warmly] ... [gently]", True),
 ("arrive-city","🏙️","Bus rolling into Fairweather — tall glass towers, coin motifs",
  "The school bus rolls into Fairweather, the city of money.",
  "[curiously]", True),
 ("bank-wonder","✨","Bank interior like a museum — gold, glass, high ceilings",
  "Inside, the bank sparkles like a museum of gold and glass.",
  "[in awe]", True),
 ("iron-banker","🛡️","The Iron Banker waving — gray beard, deep purple and gold armor",
  "A kind banker with a gray beard waves hello — the Iron Banker! He wears deep purple and gold armor — like the most important suit in the world.",
  "[warmly] ... [impressed]", True),
 ("temptation-shop","🏪","Shop window crammed with toys and candy, kids slowing down",
  "On the way to the tour, they pass a shop full of toys and candy.",
  "[curiously]", True),
 ("vault","🏛️","Giant vault door open, coins stacked to the ceiling",
  "The Iron Banker shows them a giant vault stacked with coins.",
  "[in awe]", False),
 ("hunger","🌩️","Jake's hand on his tummy, Maya laughing",
  "Soon their tummies rumble — it's time for lunch!",
  "[playfully]", True),
 ("price-shock","🤔","Food counter menu board; Maya recounting her card, brow furrowed",
  "At the food counter, a sandwich costs more than Jake expected. Maya counts her money again and again, but the numbers won't come out right.",
  "[worried]", True),
 ("the-swipe","⚡","A shimmer crackling beside the candy rack — too-good-to-resist glow",
  "Then something crackles strangely beside the candy rack. It's The Swipe — a shimmer that makes things look too good to pass up!",
  "[mysteriously]", True),
 ("jack-ruiner","👤","Jack the Ruiner half-hidden behind the high price board",
  "And hiding behind the high food prices stands Jack the Ruiner.",
  "[ominously]", True),
 ("naming-1","🛡️","Iron Banker kneeling to the kids' eye level, calm and kind",
  "“You can see them now,” the Iron Banker says gently. “Most grown-ups can see them too, once they know to look.”",
  "[gently]", True),
 ("naming-2","💡","Split frame: The Swipe labelled, Jack labelled — both dimming",
  "“The Swipe makes you want things fast, and Jack hides sneaky high prices. Just knowing their names takes away some of their power!”",
  "[confidently]", True),
 ("lunch-gift","🍱","Iron Banker clapping, huge grin, trays appearing",
  "Then the Iron Banker claps his hands and grins a big grin. “Lunch is on me today — it makes me happy to see kids eat!”",
  "[cheerfully] ... [laughs]", True),
 ("cheer","😂","Whole class cheering, trays passed down a long table",
  "The whole class cheers as trays of food are passed down the table.",
  "[excited]", False),
 ("payoff-loop","😉","Iron Banker winking; Jake and Maya grinning — matches beat 1 framing",
  "“Now,” says the Iron Banker with a wink, “let's talk about saving your money — right after lunch!” When you know the name of a trap, it loses its power.",
  "[warmly] ... [knowingly]", True),
]

# Art the story needs. Characters are drawn once and reused; backgrounds are per-scene.
CHARACTERS = [
 ("jake", "Jake, 8, cousin — needs: neutral, excited, worried, grinning"),
 ("maya", "Maya, 8, cousin — needs: neutral, counting money, worried, grinning"),
 ("iron-banker", "Kind banker, gray beard, deep purple + gold armor — needs: waving, kneeling, clapping, winking"),
 ("jack-ruiner", "Jack the Ruiner — hides behind high prices; menacing but not scary for age 5"),
 ("the-swipe", "The Swipe — not a person: a shimmer/crackle effect that flatters whatever it touches"),
 ("grandma", "Grandma — single warm appearance, handing over gift cards"),
]
BACKGROUNDS = [
 ("home-morning", "Doorstep / kitchen, warm morning light"),
 ("school-bus", "Yellow bus exterior and interior window seat"),
 ("fairweather", "The city of money — glass towers, coin motifs, wide establishing"),
 ("bank-hall", "Bank interior, museum-like: gold, glass, tall ceilings"),
 ("toy-shop", "Shop window packed with toys and candy"),
 ("vault", "Giant vault door, coins stacked high"),
 ("food-counter", "Cafeteria counter, menu board with prices, candy rack"),
 ("lunch-table", "Long table, trays, whole class seated"),
]


def words(s):
    return len(re.findall(r"[A-Za-z0-9'’$-]+", s))


def build():
    vo, images, t = [], [], 0.0
    for beat, icon, onscreen, text, tags, keep in BEATS:
        dur = round(words(text) / WPS + BREATH, 1)
        vo.append({
            "beat": beat,
            "text": text,
            # tags drive ElevenLabs v3 delivery; they are stripped from the word map
            "tts": f"{tags.split(' ... ')[0]} {text}" if tags else text,
            "start": round(t, 2),
            "end": round(t + dur, 2),
            "words": [],          # filled by tools/gen_voice.py once ElevenLabs is reachable
        })
        images.append({"beat": beat, "prompt": onscreen})
        t += dur

    total = math.ceil(t)
    doc = {
        "id": "short-13-ten-dollars",
        "title": "The $10 Decision",
        "subtype": "image-story",
        "series": "kids-money",
        "audience": "ages 5+",
        "composition": "Short13Dollars",
        "format": {"width": 1080, "height": 1920, "fps": 30, "durationSec": total},
        "voiceStatus": "pending: ElevenLabs unreachable in this container",
        "notes": (
            "Storyboard pass. 17 beats from the supplied 17-page script, one beat per page. "
            "`text` = clean caption, `tts` = same line with v3 delivery tags. `words` is EMPTY "
            "on purpose: per-word caption timing comes from ElevenLabs word timestamps via "
            "tools/gen_voice.py, which cannot run here. start/end windows are estimates at "
            f"{WPS} words/sec + {BREATH}s breath and will be re-fitted to the real VO. "
            "Beat 17 is framed to match beat 1 so the short loops seamlessly; no CTA outro."
        ),
        "lesson": "Knowing what's a trap changes everything.",
        "vo": vo,
        "images": images,
    }
    os.makedirs(PROJ, exist_ok=True)
    with open(os.path.join(PROJ, "beats.json"), "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # ---- script.md, generated from the same rows so the two can never drift ----
    drop = [b for b in BEATS if not b[5]]
    total_words = sum(words(b[3]) for b in BEATS)
    # what a 55s cut actually costs: 55s - breath, spent at WPS
    budget_55 = round((55 - len(BEATS) * BREATH) * WPS)
    budget_10 = round((55 - 10 * BREATH) * WPS)  # same 55s but consolidated to 10 beats
    L = []
    A = L.append
    A("# The $10 Decision — kids money short (ages 5+)\n")
    A("**Starring:** Jake & Maya (age 8, cousins) · **Lesson:** knowing what's a trap changes everything.\n")
    A("**Sub-type:** faceless image-story. Supplied character art + backgrounds, animated in Remotion")
    A("(ken-burns / parallax), word-synced captions, ElevenLabs v3 emotion-tagged VO.\n")
    A(f"- Format: 1080×1920 @30, **~{total}s** across {len(BEATS)} beats (one per script page).")
    A(f"- Pace: ~{WPS} words/sec + {BREATH}s breath — gentle storyteller, not shorts-fast.")
    A("- Emotional engine: **worry → naming → relief**. The turn is beat 13, where the threats get named.")
    A("- **No CTA outro** (locked brand rule): end on the lesson; beat 17 reframes beat 1 for a seamless loop.\n")
    A("## ⚠️ Length\n")
    A(f"At {total}s this is ~3× the repo's 42s shorts. Three options, your call:\n")
    A(f"1. **Ship it long** — YouTube Shorts allows up to 3 min. Keeps all {len(BEATS)} pages as written.")
    A(f"2. **Condense to ~55s** — this is a rewrite, not a trim. The script is {total_words} VO words;")
    A(f"   55s buys ~{budget_55} words across {len(BEATS)} beats, or ~{budget_10} if consolidated to 10.")
    A(f"   So roughly **two-thirds of the words have to go**. Dropping the {len(drop)} beats marked ✂")
    A("   below is only the start — every remaining line needs shortening too.")
    A("3. **Split in two** — beats 1–9 as *the trip*, 10–17 as *the traps*. Two ~70s shorts, one series.")
    A("   Keeps every word, and the traps land in their own episode.\n")
    A("Recommendation: **3**. The naming beats (11–14) are the payload and deserve room;")
    A("halving the words to hit 55s would cost exactly the part the lesson rests on.\n")
    A("## Beat sheet\n")
    A("| # | Beat | | On screen | VO (clean) | v3 tags | ~s |")
    A("|---|------|---|-----------|------------|---------|----|")
    for i, ((beat, icon, onscreen, text, tags, keep), v) in enumerate(zip(BEATS, vo), 1):
        mark = "" if keep else "✂"
        A(f"| {i} | `{beat}` {mark} | {icon} | {onscreen} | {text} | `{tags}` | {round(v['end']-v['start'],1)} |")
    A("\n## Art checklist\n")
    A("Characters are drawn once and reused across beats — these are the character sheets:\n")
    for name, need in CHARACTERS:
        A(f"- **{name}** — {need}")
    A("\nBackgrounds, one per location:\n")
    for name, need in BACKGROUNDS:
        A(f"- **{name}** — {need}")
    A("\nDrop them in `media/projects/short-13-ten-dollars/` and the composition reads them")
    A("via `staticFile('projects/short-13-ten-dollars/<name>.png')`.\n")
    A("## Status\n")
    A("- [x] Script → 17 beats, timed")
    A("- [ ] **Beat sheet locked** ← your review gate; cheapest place to change anything")
    A("- [ ] Art supplied (character sheets + backgrounds)")
    A("- [ ] TSX composition `Short13Dollars` + `npm run gen`")
    A("- [ ] Phone-scale frame QA, then silent render")
    A("- [ ] VO + word-synced captions — needs ElevenLabs, run on a machine that can reach it")
    with open(os.path.join(PROJ, "script.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")

    print(f"{total}s across {len(BEATS)} beats")
    print("55s budget check written to script.md")
    print("wrote:", os.path.relpath(PROJ, ROOT) + "/{script.md,beats.json}")


build()
