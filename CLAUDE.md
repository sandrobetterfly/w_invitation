# CLAUDE.md — Wedding site (portfolio demo)

> Living reference for anyone (human or agent) picking this up. The site is
> **live and public**, so treat every change as production.
> Point-in-time status lives in [`HANDOFF.md`](HANDOFF.md).

---

## 1. What this is

A four-page wedding site for **Sandro & Kopi**, Syros, Greece. It was a real
Save-the-Date; it is now a **portfolio piece** — a working demo shown to
prospective clients who want a similar wedding site built.

That repurposing drives most of the decisions below: the site must always look
*alive* and *upcoming* to a stranger opening it cold.

- **`/`** — the invitation: mobile-first, 3-screen, scroll-snapping
  (cover → island guessing game → film + RSVP).
- **`/details`** — the wedding day: live countdown, schedule, ceremony, map.
- **`/seating`** — bilingual "find your table": live search with Georgian↔latin
  transliteration. 10 tables, 80 guests, data inline.
- **`/brunch`** — the morning after: pick a dish + a coffee, send.

**Live:** https://wedding.khasia.ge · also https://sandrobetterfly.github.io/w_invitation/
**Repo:** `sandrobetterfly/w_invitation` (GitHub Pages, `main`, `/` root).

---

## 2. Architecture

**Plain static site. No framework, no build step, no npm, no bundler, no
external JS deps.** Everything hand-written and **inline in single files**.

- Vanilla HTML/CSS/JS. CSS custom properties (design tokens) in `:root`.
- **Fonts:** Google Fonts — `Cormorant Garamond` (serif), `Jost` (sans).
  Cormorant has **no Georgian glyphs**, so any Georgian text needs a Noto face
  or it silently falls back to a system font: `/brunch` loads
  `Noto Serif Georgian` behind a `--serif-ge` token; `/seating` loads both
  `Noto Serif Georgian` and `Noto Sans Georgian` and names them directly in its
  font stacks (no token).
- **Icons:** hand-drawn line-art SVG in an inline `<defs>` sprite
  (`<symbol id="i-…">`), used via `<use href="#i-…">`. No icon library.
- **Confetti:** custom `<canvas>` particle code.
- **Forms:** Google Apps Script web app → one Google Sheet, two tabs.
- **Hosting:** GitHub Pages behind Cloudflare.

```
wedding web invitation/        ← repo root
├── index.html                 # invitation (3 screens)
├── details/index.html         # wedding day   → /details
├── seating/index.html         # find-your-table → /seating
├── brunch/index.html          # brunch menu   → /brunch
├── cover.jpg                  # couple photo (800×1200, ~278 KB) — home OG image
├── syros-ermoupoli.webp       # /details header photo (~578 KB)
├── og-image.jpg               # 1200×674 JPEG — OG image for the inner pages
├── wedding.mp4                # screen-3 film (H.264 540×960, ~5.4 MB)
├── rsvp-apps-script.gs        # Apps Script source for both forms
├── README.md · CLAUDE.md · HANDOFF.md · .gitignore
└── .claude/                   # dev-only, GITIGNORED (launch.json + serve.js)
```

**Gitignored:** original source media (`*.mov`, the original `Cover Image … .JPG`),
`illustrations.html` (icon sticker-sheet), `.claude/`, `.DS_Store`.

### Design tokens (`:root`, identical on all four pages)
`--bg:#E1EFEE` (mint) · `--bg-2:#CCE6E6` · `--paper:#FFF` · `--ink:#0A4682`
(deep blue text) · `--ink-soft:#557FA4` · `--sea:#075BB4` · `--sea-light:#6FCAD6`
· `--sea-pale:#C6E7EC` · **`--gold:#FF7653` (coral — the accent/CTA colour,
despite the name)** · `--pink:#EC8CBC` · `--green:#2E9E5B` · `--line:#BCDBDC`
· `--serif` Cormorant · `--sans` Jost.
`--serif-ge` (Noto Serif Georgian) exists on `/brunch` only — see Fonts above.

---

## 3. The burger menu (shared component)

Every page carries the same fixed top-right burger linking all four pages:
**Invitation · Wedding day · Find your table · Brunch**, each with a one-line
descriptor. The current page is marked `aria-current="page"` and styled coral.

Three things to know before touching it:

- **It is duplicated inline in all four files.** There is no shared asset — that
  is the cost of the no-build constraint. Change it in one file, change it in
  four, or the pages drift.
- **`z-index:45`** — deliberately above the section dots (20) and below the RSVP
  modal (50), so it tucks behind the modal instead of floating over it.
- **Hrefs are relative** (`./` at root, `../` in subfolders) so the menu works on
  the `github.io` project path too. Absolute `/…` links break there.
- The overlay is `visibility:hidden` until opened, so it adds **no permanently
  painted full-screen layer** — see the scroll-perf rule in §5.

The internal pages have **no top bar**. The old blue "← back / Sandro & Kopi"
band was removed once the menu covered navigation; on `/details` this also lets
the Ermoupoli photo run full-bleed to the top of the page.

---

## 4. Forms → Google Sheet

Both forms POST to the **same** Apps Script `/exec` URL with
`mode:'no-cors'`, set as `RSVP_ENDPOINT` (in `index.html`) and
`BRUNCH_ENDPOINT` (in `brunch/index.html`).

| Form | Tag | Sheet tab | Columns |
|---|---|---|---|
| RSVP (`/`) | *(none)* | `RSVPs` | First, Last, Sent by, Responded at, Received at |
| Brunch (`/brunch`) | `type=brunch` | `Brunch` | First, Last, Dish, Coffee, Ordered at, Received at |

**Which build is deployed?** Open the `/exec` URL in a browser. It must say
`RSVP endpoint is live. [v2-brunch]`. Without the tag you are on the old
RSVP-only script, which **silently discards** `food`/`coffee` — and `no-cors`
means the page still shows "Order sent!", so nobody finds out.

**To redeploy without changing the URL:** Apps Script → Deploy → **Manage
deployments → ✏️ pencil → Version: New version → Deploy.** "New deployment"
mints a *different* `/exec` URL and breaks both forms.

**Safety net:** brunch orders also ship `sender:"BRUNCH — <dish> / <coffee>"`,
a field the old script *does* read. If the deployment ever regresses, orders
still land — on the `RSVPs` tab — rather than vanishing.

`no-cors` means the response is opaque, so **neither form can detect failure**
(~2% transient Apps Script failures under burst). Accepted; cross-check the
sheet against the guest list rather than trusting the UI.

---

## 5. Code style & standards

- **Single self-contained files.** No build, no framework, no external JS deps.
  New features go inline into the relevant `index.html`.
- **Design tokens first.** Use the `:root` variables. The accent is `--gold`
  (coral `#FF7653`) despite the name.
- **Mobile-first**, two font weights (400/500), **sentence case** copy.
- **Icons:** add glyphs as `<symbol>` in the page's inline sprite — outline
  style, `stroke="currentColor"`, round caps. Each page has its own sprite;
  check the glyph exists there before `<use>`-ing it.
- **Animations:** prefer `transform`/`opacity`. **No `background-attachment:
  fixed`**, and no *permanently painted* fixed full-screen layers — they kill
  mobile scroll perf. (Overlays that are `visibility:hidden` until opened, like
  the menu and the RSVP modal, are fine.)
- Respect `@media (prefers-reduced-motion: reduce)`.
- **Clean URLs:** `/details` is `details/index.html`, etc. GitHub Pages serves
  directory indexes.
- **Commits** end with the `Co-Authored-By:` line. Only commit and push when the
  change is verified.

---

## 6. Gotchas — don't relearn these the hard way

**The demo date is 2027 on purpose.** The real wedding was 15 Sep 2026. Every
date-driven state (countdown, and formerly the schedule's past/now styling)
flips to "it's over" once the date passes, which makes the site look dead to a
prospective client. If you roll it again: it is a global year replace across all
four pages **plus the weekday names** — 15 Sep is a Tuesday in 2026, a Wednesday
in 2027; the 16th is Wednesday then Thursday. Check `data-at` timestamps in
`details/index.html` too.

**The schedule cards are deliberately plain.** `/details` used to dim past
events (`.ev.past{opacity:.5}`) and ring the current one. Both are gone — the
five activities are permanent informational boxes. Don't reintroduce time-driven
styling on them; it is exactly what made the page look broken.

**Never go back to a one-shot scroll reset on `/`.** Scroll-snap makes the
browser restore the previously-viewed screen on reload. The fix is `pinTop()` —
a `requestAnimationFrame` loop that holds `scrollTo(0,0)` across a 450 ms window
on every `pageshow`, then enables `html.snap`. A single `setTimeout(…, 60)`
*loses the race*: the 5.4 MB video finishes decoding afterwards, the document
grows, and the old scroll position comes back. That regressed once already.
Equally: don't put `scroll-snap-type` into static CSS — it lives on `html.snap`
and is enabled only by JS.

**`wedding.khasia.ge` is fronted by Cloudflare**, not configured as a GitHub
Pages custom domain (`cname: null`, no `CNAME` file). It serves heavily-cached
copies of the `…github.io/w_invitation/` origin, so a **newly added path can 404
on the custom domain even after the GitHub build is green**. Order of operations:
confirm the `github.io` URL works (proves the build is fine), purge the
Cloudflare cache, and if still stuck push an empty commit
(`git commit --allow-empty`). A build stuck on `"building"` can be forced with
`gh api -X POST repos/sandrobetterfly/w_invitation/pages/builds`.
In practice inner-page edits appear within ~40–60 s; only brand-new paths lag.

**OG images must be JPEG/PNG, not WebP** — WhatsApp/iMessage won't render WebP
previews. The page may display `.webp`; the share tag points at a `.jpg`.

**Keep the `/details` map embed OpenStreetMap but every click-through Google
Maps.** That split is deliberate.

**macOS `core.ignorecase` is ON** — never use extension patterns like `*.JPG` in
`.gitignore`; they also match `cover.jpg`. Ignore originals by exact name.

**CSS `display:grid` + `place-items:center` does not pack children.** Default
`align-content:stretch` spreads implicit rows across the container, so the
burger's three bars sat 12.1 px apart while the X transform assumed 6 px —
they rotated but never met. Use flexbox when children must sit at content size.

---

## 7. Commands

### Local preview
```bash
node .claude/serve.js          # http://localhost:4599, serves directory indexes
```

### Deploy
```bash
git add <files> && git commit -m "…"
git push origin main           # Pages auto-builds (~1 min)
```

### Re-scrape share previews after deploy
OG cards are cached per URL. In the Facebook Sharing Debugger
(https://developers.facebook.com/tools/debug/) hit **Scrape Again** for each URL.

### Replace the screen-3 video
```bash
FF=$(python3 -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())")
"$FF" -y -i "SOURCE.MOV" -vf "scale=540:-2,fps=30" \
  -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p \
  -movflags +faststart -c:a aac -b:a 96k wedding.mp4
# pip install --user imageio-ffmpeg  if the binary isn't present
```

### Optimize a photo / OG image
```bash
sips -Z 1200 -s format jpeg -s formatOptions 72 "SOURCE.JPG" --out cover.jpg
```
Keep under ~300 KB — it also helps the WhatsApp link-preview fetch.
