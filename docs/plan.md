# Member Icon Library

Approved scope: an English static icon library published publicly on GitHub Pages. Zoe B is the only displayed Zoe variant. Feixue uses the ponytail revision. Eleven members total.

## Implementation

- Test color validation, SVG recoloring, filenames, and member mappings using Node's test runner.
- Build a small HTML/CSS/JavaScript page with an eleven-member grid, a global color picker plus HEX input, original/vector preview modes, PNG output-size selection, and individual SVG/transparent PNG/original generated PNG downloads.
- Copy only selected generated PNGs and traced SVGs into public assets. Never copy source photographs, credentials, local dependencies, or unrelated materials.
- Verify transparency and recoloring in exported files, compare vector and original previews, and check desktop/mobile layout and errors in a browser.
- Commit a standalone website repository, push to Pcerony/sodes-member-icons, enable public Pages on main, and verify the successful build and live page.

## Data And Rendering

`members.json` maps labels to relative SVG and generated-PNG asset URLs. `model.js` validates colors and recolors root SVG color attributes. `app.js` renders cards and exports downloaded files. Transparent PNGs render the recolored SVG into an unfilled canvas. Original PNG downloads preserve the generated source byte-for-byte and its original gray background.

## Boundaries

No new image generation, website backend, tracking, login, photo upload, arbitrary remote SVG loading, batch export, or license claim. Traced SVGs are not pixel-identical to the source PNGs. The original preview/download remains available for comparison.
