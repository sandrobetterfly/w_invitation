# HANDOFF — Sandro & Kopi wedding site

> **Status: complete.** Snapshot 2026-09-27, baseline commit `94ba4b1`.
> The living reference (architecture, tokens, gotchas, commands) is
> [`CLAUDE.md`](CLAUDE.md). This file is "where it landed and what was left."

---

## 1. Where it landed

Four pages, live, all reachable from a shared burger menu:

| Page | State |
|---|---|
| `/` | Cover, island game, film + RSVP. Lands on the cover on every load and reload. |
| `/details` | Live countdown, five-step wedding-day schedule, ceremony, OSM map, venue, brunch link. |
| `/seating` | Bilingual find-your-table search. 10 tables, 80 guests. |
| `/brunch` | Pick a dish + a coffee, name, send → Google Sheet. |

The project started as a real Save-the-Date for 15 Sep 2026 and finished as a
**portfolio demo** shown to prospective clients. Everything below follows from
that shift.

---

## 2. What changed in the final pass

- **Repurposed for portfolio use.** The wedding date had passed, so every
  date-driven state had flipped to "it's over" — the countdown read *"Thank you
  for celebrating with us"* and four of five schedule cards were dimmed to 50%.
  Dates rolled to **September 2027** (weekday names included) so the countdown
  runs and nothing reads as expired.
- **Schedule cards are now plain informational boxes.** The `.past` dimming and
  `.now` highlight ring were removed outright.
- **Fixed a reload regression on `/`.** Reloading dropped you on whatever screen
  you were last on rather than the cover — a one-shot `setTimeout(…, 60)` losing
  the race against the video finishing decode. Replaced with a frame-pinned
  reset (`pinTop()`). Verified: reload from `scrollY 2048` now lands at `0`.
- **Added the burger menu** to all four pages. Previously `/seating` and
  `/brunch` were reachable only from inside `/details`, with no way back — the
  seating search, the most technically interesting page, was effectively hidden.
- **Removed the blue topbar** from the three internal pages, now that the menu
  covers navigation.
- **Added `/brunch`** (menu pre-ordering) and rebuilt `/details` from a travel
  guide into a wedding-day guide, dropping the ferry and accommodation sections.

Full detail is in the commit log from `1da8149` onward.

---

## 3. Decisions taken deliberately

Three were raised as concerns and settled by the owner. They are **not**
oversights:

1. **Real guest names stay on `/seating`.** ~80 real first names (Georgian and
   Latin) appear in the public demo. Flagged as a privacy consideration —
   prospective clients see real wedding guests — and kept by choice.
2. **Both forms still write to the live Google Sheet.** A client trying the RSVP
   or brunch flow adds a real row. Expect to clean up demo submissions
   periodically.
3. **The RSVP one-per-device lock is unchanged.** `localStorage.rsvp_sent_v1`
   means once a browser submits, it shows "RSVP sent ✓" permanently — so the
   flow can't be demoed twice from the same laptop without clearing storage.

---

## 4. If you pick this up again

Nothing is broken. These were identified but not built:

- **A reset hatch for the RSVP lock** (e.g. `?demo=1` clearing the flag) so the
  flow survives repeated client demos. This is the one I'd do first.
- **Framing it as a case study** — nothing on the site tells a visitor what they
  are looking at or what it would cost them.
- **Share metadata still sells a wedding**, not a studio. Paste the link into a
  proposal email and the preview card says "Save the Date".
- **The venue card on `/details`** ("You'll find out when you step off the bus")
  reads as unfinished content to a stranger now the wedding is over.
- **Performance:** the 5.4 MB autoplaying video is a slow first impression on
  mobile data. No analytics, so there's no signal on whether prospects open it.

---

## 5. Known limitations (accepted)

- **Forms cannot detect failure.** `mode:'no-cors'` makes the response opaque, so
  the UI always shows success (~2% transient Apps Script failures under burst).
  Cross-check the sheet rather than trusting the UI.
- **The burger menu is duplicated in all four files.** No shared asset — the cost
  of the no-build constraint. Edit it in one place, edit it in four.
- **iPhone SE (375×667):** screen 3 of `/` sits slightly below the fold. Modern
  phones (≥740 tall) fit. Small/old screens are deliberately not special-cased.
- **True iOS audio unlock** for the screen-3 film can't be verified headlessly —
  needs a real device.

---

## 6. Housekeeping

Two stale files sit **untracked** in the repo root: `details-index.html` and
`seating-index.html`. They are Sep-13 snapshots that predate the wedding-day
rebuild (`details-index.html` differs from the live page by ~469 lines) and are
superseded. Safe to delete; left in place rather than removed unasked.
