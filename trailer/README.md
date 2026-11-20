# Trailer: The People v. *E. coli*

A looping 43-second trailer built from the **same original artwork** as the poster and the site, so it matches them exactly. Two uses:

1. **An attract loop at the booth** — put it fullscreen on a laptop or a screen next to the poster; it loops forever on its own.
2. **A video for social media** — screen-record it once and you have an MP4.

## Open it
It is part of the site, so once the site is online it lives at **`<your-site>/trailer/`**. Offline, double-click `index.html`. Either way, press **F** for fullscreen. There is a link back to the site in the corner, and the site links here from its home page and its Exhibits menu.

| Key | What it does |
|---|---|
| **F** | Fullscreen on/off |
| **Space** | Pause / resume |
| **←** **→** | Previous / next scene |

## The six scenes (43 s)
1. **Title** (6 s) — the cell drifts behind "The People v. *E. coli*".
2. **The defence** (7 s) — K-12, Nissle 1917 and the commensal strain.
3. **The prosecution** (7 s) — O157:H7, UPEC and NMEC K1.
4. **Under the microscope** (9 s) — the attack plays through its 8 stages.
5. **You are the judge** (6.5 s) — the scales.
6. **Verdict** (8 s) — "It depends on the strain", the QR spot and your names.

## To record it as an MP4 (on this Mac, no extra software)
1. Open `index.html` and press **F** for fullscreen.
2. Press **⇧ ⌘ 5**, choose **Record Entire Screen**, press Record.
3. Let it run one full loop (about 45 seconds), then stop from the menu bar.
4. The MP4 lands on your Desktop.

The stage is a fixed 1920 × 1080 box scaled to the window, so a fullscreen recording comes out as clean HD.

## Change something
Edit `src.html` (text and scene order, `data-dur` sets each scene's length in milliseconds), `trailer.css` (the look) or `trailer.js` (playback). It shares the site's fonts (`../assets/fonts/`), so nothing is duplicated. Then rebuild from the `ecoli-friend-or-foe` folder:

```
python3 scripts/build-trailer.py
```

That fills in the artwork and lifts the microscope animation straight out of the site's stylesheet, so the trailer never drifts out of sync with the site.

## Still to fill in
The names, university, festival and the QR code are placeholders, the same ones as the poster and the site. The QR goes in once the site is deployed.
