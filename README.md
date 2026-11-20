# Website: The People v. *E. coli*

The companion site that the poster's QR code will open. One page, made for phones, in the same courtroom style as the poster. In English and Arabic: the EN / عربي button in the top corner switches language (the site remembers the choice, and opens in Arabic on phones set to Arabic).

## The sections
1. **Court is in session**: the title, a cell swimming in, and a "Skip to the trial" button.
2. **Exhibit 1, How small?**: zoom from a hand, to a skin cell, to *E. coli*, with a scale bar.
3. **Exhibit 2, 20 minutes**: a division simulator (Start, Reset, and jumps to 1 h, 5 h and 10 h).
4. **Exhibit 3, Examine the defendant**: tap the numbers on the cell to learn each part.
5. **The hearing**: a Defence / Prosecution switch that turns the page green or red and swaps the evidence.
6. **Exhibit 4, Build a foe**: drag (or tap) a virus or a plasmid onto a friendly cell and watch it become STEC or UPEC-like.
7. **You are the judge**: 8 strains, guilty or not guilty, with a score at the end and a share button.
8. **Exhibit 5, Under the microscope**: an animated close-up of the gut wall in 8 stages: O157:H7 lands, injects Tir with a needle, builds a pedestal, multiplies and spreads, releases Shiga toxin, reaches the blood and kidneys, and leaves to infect the next person. Next, Back, Play and dots.
9. **The court orders**: cook a burger with a temperature slider (safe at 71 °C), then five prevention habits.
10. **Verdict**: "It depends on the strain".
11. **Your certificate**: 8 badges ("evidence") for finishing the exhibits. At 8/8 the visitor can save a certificate with their name as a PNG.

A thin progress bar, an **Exhibits** menu (with a ✓ on the ones you finished) and a back-to-top button help visitors move around; the sources list is collapsed behind a tap.

Badges, the chosen language and the name are kept only in the visitor's own browser (localStorage). Nothing is sent anywhere.

## Change something
Edit `src/index.html` (the English text), `js/i18n.js` (the Arabic text, and texts used by the scripts), `css/style.css` (the look), `js/main.js` (the first sections, the game and the badges) or `js/play.js` (Build a foe, Under the microscope, the burger and the certificate). Then rebuild from the `ecoli-friend-or-foe` folder:

```
python3 scripts/build-site.py
```

This writes `site/index.html` with the artwork filled in. The artwork is drawn by the same code as the poster (`ecoli-concepts/`).

Names, university and supervisor are placeholders in `src/index.html` (search for `[`).

## What to upload
The whole `site/` folder, as it is. `src/` and this README are not needed online, but they don't hurt. All paths are relative, so the site works on GitHub Pages under any address.

## Rules it follows
- No libraries, no CDNs, no tracking, no data collected.
- About 830 KB in total. The Fraunces font is cut down to Latin letters and saved as WOFF2; Arabic uses the phone's own Arabic font.
- Animations pause when off screen, and turn off for anyone who has "reduce motion" switched on in their phone settings.
- Font: Fraunces (SIL Open Font License, see `assets/fonts/OFL-Fraunces.txt`).
