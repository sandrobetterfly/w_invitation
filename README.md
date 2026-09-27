# Sandro & Kopi — wedding site (portfolio demo)

A four-page, mobile-first wedding site for **Syros, Greece**, built as a plain
static site: hand-written HTML/CSS/JS, **inline in single files**. No framework,
no build step, no npm, no external JS dependencies.

It began as a real Save-the-Date and now serves as a **portfolio piece** — a
working demo shown to prospective clients who want something similar.

**Live:** https://wedding.khasia.ge · also https://sandrobetterfly.github.io/w_invitation/

| Page | File | What it demonstrates |
|---|---|---|
| `/` | `index.html` | 3-screen scroll-snap: cover, "guess the island" game, film + RSVP |
| `/details` | `details/index.html` | Live countdown, wedding-day schedule, embedded map |
| `/seating` | `seating/index.html` | Bilingual search — type latin `nino`, find Georgian `ნინო` |
| `/brunch` | `brunch/index.html` | Menu pre-ordering, dish + coffee, writes to a Google Sheet |

Every page carries the same burger menu (top-right) linking all four.

> **The dates show September 2027 on purpose.** The real wedding was 15 Sep 2026;
> the demo date is rolled forward so the countdown runs and nothing reads as
> expired to a prospective client. See `CLAUDE.md` §6 before changing it.

---

## Local preview

`python3 -m http.server` is sandbox-blocked on this machine, so use the bundled
Node server (it serves directory indexes, which the clean URLs need):

```bash
node .claude/serve.js
```

Then open http://localhost:4599 — and `/details`, `/seating`, `/brunch`.

**No build. No test suite.** The files in the repo *are* the deploy artifact.

---

## Deploy

```bash
git add <files> && git commit -m "..."
git push origin main          # GitHub Pages auto-builds (~1 min)
```

⚠️ `wedding.khasia.ge` is fronted by Cloudflare, so a **brand-new path** can 404
there for a few minutes after the GitHub build goes green. The `github.io` URL
updates first. Details and the fix in `CLAUDE.md` §6.

---

## Forms

Both the RSVP popup (`/`) and the brunch order (`/brunch`) POST to the same
Google Apps Script web app, which writes to two tabs of one sheet — `RSVPs` and
`Brunch`. Source and deploy steps: `rsvp-apps-script.gs`.

Check which build is deployed by opening the `/exec` URL — it should say
`RSVP endpoint is live. [v2-brunch]`.

---

## Notes

- Fonts load from Google Fonts (needs internet). Everything else is self-contained.
- Respects `prefers-reduced-motion`.
- Full architecture, design tokens, gotchas and command recipes: **`CLAUDE.md`**.
