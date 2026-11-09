# Portfolio

Personal engineering portfolio for Adrian Calderon, built as a minimal "catalog" where projects are the products.
Plain HTML, CSS and JavaScript. No build step, hosted on GitHub Pages.

**You never edit HTML to add a project.** Each project is a folder with a filled-in `project.md` template and its images.

---

## Contents

1. [Preview it on your computer](#1-preview-it-on-your-computer)
2. [How it's organized](#2-how-its-organized)
3. [Add a project (computer)](#3-add-a-project-computer)
4. [Add a project from your phone](#4-add-a-project-from-your-phone)
5. [The project.md template](#5-the-projectmd-template)
6. [Character limits and the one-pager](#6-character-limits-and-the-one-pager)
7. [Images: sizes and resizing](#7-images-sizes-and-resizing)
8. [3D models, videos and downloads](#8-3d-models-videos-and-downloads)
9. [Edit your info, About page and resume](#9-edit-your-info-about-page-and-resume)
10. [Publish on GitHub Pages and connect a custom domain](#10-publish-on-github-pages-and-connect-a-custom-domain)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Preview it on your computer

The site loads its data with `fetch()`, which browsers block when you double-click an HTML file (`file://`).
Use a local server instead:

**Option A: VS Code Live Server (easiest)**
1. In VS Code open the Extensions panel (`Ctrl+Shift+X`), search **Live Server** (by Ritwick Dey) and install it.
   VS Code also suggests it automatically for this folder.
2. Right-click `index.html` → **Open with Live Server**. The page reloads every time you save.

**Option B: Python**
```powershell
py -m http.server 8000
```
Then open http://localhost:8000.

While previewing locally, a yellow **Content check** box appears in the corner if something is wrong:
text over a limit, a missing image, or a JSON typo. It never shows on the live site.

---

## 2. How it's organized

```
index.html            Home: product grid with filters and sort
project.html          Template for every project page: project.html?p=<slug>
about.html            About page (content comes from site.json)
print-all.html        The whole portfolio as one-pagers with a cover page
site.json             Your name, contact info, intro text, filter chips, About bio
css/main.css          Site design (colors and fonts are variables at the top)
css/print.css         Letter-size one-pager layout
js/                   The code (you shouldn't need to touch it)
assets/               resume.pdf, headshot, favicon
projects/
  projects.json       Which projects show, in what order, and which are featured
  _template/
    project.md        ← THE TEMPLATE: copy, fill in, upload
  brake-rotor/
    project.md
    images/
tools/resize-images.ps1   Makes web-sized copies of your photos
```

**`projects/projects.json`** is the list of projects. A static site can't list folders, so every project must be listed here:

```json
{
  "projects": [
    { "slug": "brake-rotor", "featured": true },
    { "slug": "surf-radar",  "featured": true },
    { "slug": "rc-airboat",  "featured": false }
  ]
}
```

- Order here = order on the home page under **Featured** sort (featured projects first, then this order).
- **Newest** sort uses each project's `end` date (`present` counts as newest).
- To hide a project without deleting it, remove its line or add `"hidden": true`.
- Every line except the last needs a comma after it.

---

## 3. Add a project (computer)

1. **Make the folder.** Create `projects/wind-turbine/` (lowercase letters, numbers and dashes only).
   The folder name becomes the link: `project.html?p=wind-turbine`.
2. **Copy the template.** Copy `projects/_template/project.md` into the new folder.
3. **Fill it in.** Open it in VS Code. The grey `<!-- -->` notes explain every field and its limit.
   Leave anything you don't have blank and it won't show.
4. **Add photos** to `projects/wind-turbine/images/` (`cover.jpg`, `hover.jpg`, `01.jpg`, …), resized first
   (see [section 7](#7-images-sizes-and-resizing)). The filenames must match the template exactly.
5. **List it** in `projects/projects.json`: `{ "slug": "wind-turbine", "featured": false }`
6. **Preview** with Live Server and check the yellow Content check box.
7. **Publish:**
   ```powershell
   git add .
   git commit -m "Add wind turbine project"
   git push
   ```
   The live site updates about a minute later.

---

## 4. Add a project from your phone

Use **github.com** in your phone's browser (the GitHub app can't upload files).

1. **Fill out the template.** Open `projects/_template/project.md` on GitHub → **⋯** → **Copy raw file**
   (or tap **Raw** → select all → copy). Paste it into your notes app and fill it in.
   Use photo names **without** `images/` (e.g. `cover: cover.jpg`), since you'll upload them straight into the project folder.
2. **Create the project.** Go to the `projects` folder → **Add file** → **Create new file** → name it
   `wind-turbine/project.md` (typing the `/` creates the folder) → paste your filled-in template → **Commit changes**.
3. **Upload photos.** Open `projects/wind-turbine` → **Add file** → **Upload files** → pick the photos → **Commit changes**.
   Their names must match what you wrote in the template (case-sensitive: `Cover.JPG` ≠ `cover.jpg`).
4. **List it.** Open `projects/projects.json` → pencil icon → add `{ "slug": "wind-turbine", "featured": false }` → **Commit changes**.

Tips:
- **iPhone:** Settings → Camera → Formats → **Most Compatible** saves JPG instead of HEIC.
- Phone photos are 3–6 MB, which slows the site down. Shrink them first at **squoosh.app**
  (resize to 2000 px, quality ~80), or run the resize script on your computer later.

---

## 5. The project.md template

`projects/_template/project.md` covers everything shown on the card, the project page and the one-pager.
It has two parts:

**The top block** between the `---` lines: one `name: value` per line.

```
---
title: Wind Turbine Blade
org: Personal project · Design & Build
role:
start: 01/2026
end: present
category: CAD
skills: CAD, FEA, Manufacturing
tags: SolidWorks, Ansys Mechanical, 3D printing
cover: images/cover.jpg
cover alt: Finished three-blade turbine on a test stand
cover position: center
hover: images/hover.jpg
model: model.glb
model alt: 3D model of the turbine blade
---
```

**Sections**, each starting with `## Name`:

| Section | Format | Shown |
|---|---|---|
| `## Summary` | One paragraph, ≤ 300 chars | Top of the page, card details, one-pager |
| `## Specs` | `- Label: Value` per line, up to 8 | Specs box (first 6 print) |
| `## Gallery` | `- images/01.jpg \| Caption` per line | Photo gallery. The caption is also the alt text |
| `## Problem` `## Approach` `## Results` `## What I Learned` `## Iterations` | Free text: paragraphs, `- ` bullets, `**bold**`, `[link](url)`, `### subheading` | Main project sections |
| `## Before / After` | `- before.jpg \| after.jpg \| Before label \| After label \| Caption` | Comparison slider |
| `## Videos` | `- YouTube link or file.mp4 \| Caption` | Video section |
| `## Downloads` | `- Label \| files/report.pdf \| 1.2 MB` | Files section |
| `## Links` | `- GitHub \| https://…` | Buttons under the specs |
| `## One-Pager` with `### Problem` `### Approach` `### Results` `### Figures` | Short text (≤ 350 chars each); Figures = `- images/02.jpg` lines | Printed one-pager only |

- An empty section (or field) is hidden. Delete example lines you don't use.
- **TODO lines:** a line, caption or spec value starting with `TODO` is a note to yourself. Section lines
  and captions starting with TODO show on your local preview but are hidden on the live site.
- The `<!-- -->` notes in the template are ignored by the site. GitHub also hides them when it displays the file.

(Older `project.json` files still work, but `project.md` is the format to use.)

---

## 6. Character limits and the one-pager

Every project page has a **Print / Save as PDF** button (Ctrl+P works too) that prints a letter-size one-pager:
your name and contact info, title and dates, cover image, specs, condensed Problem / Approach / Results,
2–3 figures and a QR code back to the project page. **Print full portfolio** (footer link, or `print-all.html`) prints a
cover page plus every project, one per page.

| Field | Limit |
|---|---|
| title | 60 |
| org | 60 |
| summary | 300 |
| gallery caption | 120 (≈ 90 shown on the one-pager) |
| specs | 8 rows on the web, first **6** printed |
| spec label / value | 22 / 34 |
| One-Pager Problem / Approach / Results | 350 each |

If the One-Pager text is blank, the printout uses the first sentences of the matching section that fit in 350
characters (bullets are merged and TODO lines skipped). If text still runs long, the one-pager first shrinks the font
slightly and then trims with "…". If you see "…" on the printout, write a shorter One-Pager version.

**Printing tips (Chrome/Edge):** Destination **Save as PDF** · Margins **Default** · Scale **Default (100)**.
Under *More settings*, untick **Headers and footers** so the date and URL don't print in the margins.
The page is sized to fit inside half-inch margins, so it stays on one page even if your browser adds its own.

The QR code points at `siteUrl` in `site.json`. **Update `siteUrl` when you connect a custom domain.**

---

## 7. Images: sizes and resizing

| Image | Size (px) | Aspect | Target file size |
|---|---|---|---|
| `cover` | 1600 × 2000 | 4:5 portrait | ≤ 300 KB |
| `hover` | 1600 × 2000 | 4:5 portrait | ≤ 300 KB |
| gallery | 2000 on the long side | any (4:3 looks best) | ≤ 400 KB |
| before / after | same size as each other, ~2000 wide | any (must match) | ≤ 400 KB |
| headshot | 1200 × 1500 | 4:5 | ≤ 250 KB |

- Use **JPG at quality 75–85** for photos and renders. Use PNG only for screenshots and diagrams with flat colors.
- Keep the subject centered with some margin, since cards crop to 4:5. Use `coverPosition` to adjust.
- For a store-like look, shoot the cover on a plain white or gray background in soft daylight.
- All images below the top of the page are lazy-loaded automatically.

**Resize script (Windows, nothing to install):**
```powershell
# Makes resized copies in <folder>\web\
powershell -ExecutionPolicy Bypass -File tools\resize-images.ps1 -Path "C:\path\to\photos"

# Or write them straight into a project
powershell -ExecutionPolicy Bypass -File tools\resize-images.ps1 -Path "C:\path\to\photos" -OutDir projects\wind-turbine\images
```
Options: `-MaxSize 2000` (longest side) and `-Quality 82`. It respects phone rotation, converts PNG/BMP/TIFF to JPG,
and lowercases the filenames. To crop a cover to exactly 4:5, use the Windows Photos app (Edit → Crop → 4:5) first.

Keep your full-size originals outside the repo, or in a folder named `raw/` (it's git-ignored).

---

## 8. 3D models, videos and downloads

### 3D models (.glb)
The page shows an interactive viewer (Google's `<model-viewer>`, loaded only on projects that have a model).
Visitors can drag to rotate and pinch or scroll to zoom.

**SolidWorks**
1. If your version's **File → Save As** list includes **glTF (*.glb)**, use it and you're done.
2. Otherwise **Save As → STL** (Options: Resolution *Fine*, Units *Millimeters*) for a part, or *Save all components
   as one file* for an assembly. Then convert the file in Blender (below).

**Fusion**
1. **File → Export** → type **OBJ** (keeps per-body colors) or **STL**. Then convert the file in Blender.

**Siemens NX**
1. **File → Export → STL** (or OBJ). Then convert the file in Blender.

**Convert to .glb in Blender** (free, blender.org)
1. Delete the default cube (`X`).
2. **File → Import → STL** or **Wavefront (.obj)**. If it's huge, your CAD was in mm. Set the import **Scale** to `0.001`.
3. Optional: give it a material (Material tab → Base Color gray, Metallic 0.6, Roughness 0.4).
4. If the file is big: select it → Modifiers → **Decimate** → ratio 0.2–0.5.
5. **File → Export → glTF 2.0** → Format **glTF Binary (.glb)** → Export.

Then drag the `.glb` into **gltf.report** → Script → run the Draco compression to make it 5–10× smaller.
Aim for **under 5 MB**. Put it in the project folder and add to the template's top block:
```
model: model.glb
model alt: 3D model of the redesigned rotor
```

### Videos
- **YouTube** (best for anything over ~20 MB): `- https://youtu.be/VIDEO_ID | Dyno test` under `## Videos`. Unlisted videos work.
- **Local mp4** (short clips only, ≤ 20 MB, H.264): `- videos/test.mp4 | Caption | images/poster.jpg` (poster optional).

### Downloads
Put PDFs in the project folder (e.g. `files/`) and list them in the template:
```
## Downloads
- Drawing package | files/drawings.pdf | 1.2 MB
```
Don't upload anything under NDA or anything the team hasn't approved (e.g. Ford work, team drawings).

---

## 9. Edit your info, About page and resume

- **`site.json`** holds your name, email, LinkedIn, GitHub, the home intro line, the filter chip order and the
  About page bio (one paragraph per line in `about.bio`).
- `phone` is blank on purpose so it isn't published. Fill it in to add it to the one-pagers.
- **Resume:** save it as `assets/resume.pdf`. The nav and About links point there. Replace the file to update it.
- **Headshot:** add `assets/headshot.jpg` (1200 × 1500) and change `about.photo` in `site.json` to `"assets/headshot.jpg"`.
- **Colors and fonts:** variables at the top of `css/main.css` (`--accent`, `--surface`, `--font`, …).

---

## 10. Publish on GitHub Pages and connect a custom domain

All links are relative, so the same files work at `adriancal19.github.io/mechE-portfolio/` and on a custom domain.

**First publish**
```powershell
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
gh repo create mechE-portfolio --public --source . --push
```
(Without the GitHub CLI: create an empty public repo named `mechE-portfolio` on github.com, then
`git remote add origin https://github.com/adriancal19/mechE-portfolio.git` and `git push -u origin main`.)

**Turn on Pages:** repo → **Settings → Pages** → Source **Deploy from a branch** → Branch **main** / **(root)** → Save.
After 1–2 minutes the site is live at **https://adriancal19.github.io/mechE-portfolio/**.

The empty `.nojekyll` file matters: it tells GitHub Pages not to hide folders starting with `_` (like `_template`).

**Custom domain (later)**
1. Buy the domain (Cloudflare, Namecheap, Porkbun…).
2. In the repo: **Settings → Pages → Custom domain** → enter it, e.g. `adriancalderon.com` → Save.
3. At your DNS provider:
   - Apex domain (`adriancalderon.com`): four **A** records to `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` subdomain: a **CNAME** record to `adriancal19.github.io`
4. Wait for DNS (minutes to hours), then tick **Enforce HTTPS**.
5. Update `siteUrl` in `site.json` to `https://adriancalderon.com/` so the QR codes point to the new address.

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| Blank page / "Loading…" forever when opening the file directly | Use Live Server or `py -m http.server` (section 1). |
| "JSON formatting error" | Only `projects.json` and `site.json` are JSON: look for a missing comma or quote. Paste the file into jsonlint.com. |
| A section doesn't show | Check the heading spelling (e.g. `## What I Learned`) and that it has text besides TODO lines. |
| Project doesn't show on the home page | Is its slug in `projects/projects.json`, spelled exactly like the folder? |
| Image shows as an empty gray box | Path or filename mismatch (case-sensitive on GitHub). The local Content check lists the exact path. |
| Change not visible on the live site | Wait 1–2 minutes, then hard-refresh (Ctrl+F5). Check the repo's **Actions** tab for the Pages deploy. |
| One-pager shows "…" | Text is too long for the page. Write shorter `## One-Pager` text. |
| QR code missing on the printout | The QR library loads from the internet. Print while online. |
