# Sandro & Kopi — Save the Date

A single-file, mobile-first wedding Save-the-Date for **Syros, Greece · 13 September 2026**.
Three scroll-snapping screens: a wavy-framed photo, an interactive map of the Cyclades,
and an autoplaying video with a live countdown + RSVP popup.

Everything lives in **`index.html`** (HTML, CSS, JS inline). The only assets are
`cover.jpg` (photo) and `wedding.mp4` (video). No build step.

---

## ⚙️ Before you send it — set these two things

Both are in the `CONFIG` block near the bottom of `index.html`, inside `<script>`:

1. **Go-live date** — drives the 7-day RSVP countdown:
   ```js
   const GO_LIVE = new Date('2026-06-14T12:00:00'); // ← change to the day you send the invite
   ```
   The reply deadline is automatically `GO_LIVE + 7 days`.

2. **RSVP → Google Sheet** (optional) — paste your Apps Script web-app URL:
   ```js
   const RSVP_ENDPOINT = ''; // ← '' = popup works but does not save
   ```
   Setup steps are in `rsvp-apps-script.gs`. Until set, the RSVP popup still works (it just
   shows the thank-you message without recording the response).

---

## 🚀 Deploy to GitHub Pages

From this folder:

```bash
git init
git add .
git commit -m "Save the date site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save.**
After ~1 minute your site is live at `https://<your-username>.github.io/<repo>/`.

> Tip: for a nicer link preview when you share it, set `og:image` in `index.html` to the
> full URL of your cover image (e.g. `https://<user>.github.io/<repo>/cover.jpg`).

---

## 🖼 Replacing the photo or video

- **Photo:** replace `cover.jpg` (portrait works best — it fills a 4:5 frame).
- **Video:** replace `wedding.mp4` with a web-optimized **H.264 MP4** (not `.mov`/HEVC).
  It plays in a small portrait frame, so ~540p is plenty. On a Mac you can convert with:
  ```bash
  avconvert -p Preset960x540 -s your-clip.mov -o wedding.mp4 --replace
  ```

---

## 🔍 Local preview

Any static server works, e.g.:
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

---

## Notes
- Fonts load from Google Fonts (needs internet). Everything else is self-contained.
- Respects `prefers-reduced-motion`. Works offline except for the web fonts.
