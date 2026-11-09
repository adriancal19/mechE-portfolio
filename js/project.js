// Project page: renders any project from projects/<slug>/project.json.
// URL: project.html?p=<slug>
import {
  loadSite, loadProject, loadAllProjects, renderChrome, cardHTML,
  formatDates, esc, inline, richText, showError, host,
} from './common.js';
import { buildOnePager, fitOnePager } from './onepager.js';

const main = document.getElementById('main');
const slug = new URLSearchParams(location.search).get('p');

const SECTIONS = [
  ['problem', 'Problem'],
  ['approach', 'Approach'],
  ['results', 'Results'],
  ['learned', 'What I Learned'],
  ['iterations', 'Iterations'],
];

init();

async function init() {
  let site;
  try {
    site = await loadSite();
    renderChrome(site, 'projects');
  } catch (err) {
    showError(main, 'Something went wrong', err.message);
    return;
  }

  if (!slug) {
    showError(main, 'No project selected', 'Pick a project from the catalog.');
    return;
  }

  let p;
  try {
    p = await loadProject(slug);
  } catch (err) {
    const notFound = /HTTP 404/.test(err.message);
    showError(main, notFound ? 'Project not found' : 'This project could not be loaded',
      notFound ? `There is no project called "${slug}".` : err.message);
    return;
  }

  document.title = `${p.title} · ${site.name}`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && p.summary) desc.setAttribute('content', p.summary);

  main.innerHTML = `
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol><li><a href="index.html">Projects</a></li>${p.category ? `<li><a href="index.html?skill=${encodeURIComponent(p.category)}">${esc(p.category)}</a></li>` : ''}<li aria-current="page">${esc(p.title)}</li></ol>
      </nav>

      <div class="product">
        <section class="product-gallery" aria-label="Photos">${galleryHTML(p)}</section>
        <div class="product-info">${infoHTML(p)}</div>
      </div>

      ${bodyHTML(p)}
      <section class="detail" id="related" hidden>
        <h2>More projects</h2>
        <ul class="related"></ul>
      </section>
    </div>`;

  setupGallery(p);
  setupCompare();
  setupToc();
  if (p.model) loadModelViewer();
  document.getElementById('print-btn').addEventListener('click', () => window.print());

  // Build the printable one-pager off-screen and fit it to the page.
  const printRoot = document.getElementById('print-root');
  const sheet = buildOnePager(p, site);
  printRoot.append(sheet);
  fitOnePager(sheet);

  renderRelated(p);
}

// ---------- Gallery ----------
function galleryHTML(p) {
  const imgs = p.gallery;
  if (!imgs.length) return '';
  const first = imgs[0];
  return `
    <figure class="gallery-main">
      <button type="button" class="gallery-stage" id="gallery-stage" aria-label="Enlarge image 1 of ${imgs.length}">
        <img id="gallery-img" src="${esc(first.src)}" alt="${esc(first.alt)}" fetchpriority="high">
        <span class="zoom-hint" aria-hidden="true">Click to enlarge</span>
      </button>
      <figcaption id="gallery-caption">${esc(stripTodo(first.caption))}</figcaption>
    </figure>
    ${imgs.length > 1 ? `<ul class="thumbs" aria-label="Choose image">
      ${imgs.map((g, i) => `<li><button type="button" data-i="${i}" aria-label="Show image ${i + 1}: ${esc(g.alt)}" aria-current="${i === 0}">
        <img src="${esc(g.src)}" alt="" loading="lazy" decoding="async"></button></li>`).join('')}
    </ul>` : ''}`;
}

// Captions starting with "TODO" are reminders for you; they are hidden on the live site.
const stripTodo = (s = '') => (/^TODO\b/i.test(s.trim()) ? '' : s);

function setupGallery(p) {
  const imgs = p.gallery;
  if (!imgs.length) return;
  const stage = document.getElementById('gallery-stage');
  const mainImg = document.getElementById('gallery-img');
  const caption = document.getElementById('gallery-caption');
  const thumbs = [...document.querySelectorAll('.thumbs button')];
  let current = 0;

  const show = (i) => {
    current = (i + imgs.length) % imgs.length;
    const g = imgs[current];
    mainImg.classList.remove('is-missing');
    mainImg.src = g.src;
    mainImg.alt = g.alt;
    caption.textContent = stripTodo(g.caption);
    stage.setAttribute('aria-label', `Enlarge image ${current + 1} of ${imgs.length}`);
    thumbs.forEach((t, j) => t.setAttribute('aria-current', String(j === current)));
  };

  thumbs.forEach((t) => t.addEventListener('click', () => show(Number(t.dataset.i))));

  // ----- Lightbox -----
  const dlg = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-caption');
  const lbCount = document.getElementById('lb-count');
  const prev = document.getElementById('lb-prev');
  const next = document.getElementById('lb-next');
  let lbIndex = 0;

  const lbShow = (i) => {
    lbIndex = (i + imgs.length) % imgs.length;
    const g = imgs[lbIndex];
    lbImg.classList.remove('is-missing');
    lbImg.src = g.src;
    lbImg.alt = g.alt;
    lbCap.textContent = stripTodo(g.caption);
    lbCount.textContent = `${lbIndex + 1} / ${imgs.length}`;
  };
  prev.hidden = next.hidden = imgs.length < 2;

  stage.addEventListener('click', () => {
    lbShow(current);
    dlg.showModal();
    document.getElementById('lb-close').focus();
  });
  document.getElementById('lb-close').addEventListener('click', () => dlg.close());
  prev.addEventListener('click', () => lbShow(lbIndex - 1));
  next.addEventListener('click', () => lbShow(lbIndex + 1));
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbShow(lbIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); lbShow(lbIndex + 1); }
  });
  // Click the empty area around the image to close
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.classList.contains('lb-stage') || e.target.tagName === 'FIGURE') dlg.close();
  });
  dlg.addEventListener('close', () => { show(lbIndex); stage.focus(); });

  // Swipe on phones
  let x0 = null;
  dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

// ---------- Right column ----------
function infoHTML(p) {
  const eyebrow = [p.org, p.role].filter(Boolean).join(' · ');
  return `
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(p.title)}</h1>
    <p class="product-dates">${esc(formatDates(p))}${p.category ? ` · ${esc(p.category)}` : ''}</p>
    ${p.tags.length ? `<ul class="tag-list" aria-label="Skills and tools">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${p.summary ? `<p class="product-summary">${inline(p.summary)}</p>` : ''}
    <p class="details-jump"><a class="text-link" href="#details">Read the full project <span aria-hidden="true">↓</span></a></p>
    ${p.specs.length ? `<section class="specs" aria-labelledby="specs-h">
      <h2 id="specs-h">Specifications</h2>
      <dl>${p.specs.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>
    </section>` : ''}
    <div class="product-actions">
      ${p.links.length ? `<div class="product-links">${p.links.map((l) =>
        `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || host(l.url))} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : ''}
      <button type="button" class="btn btn-primary btn-block" id="print-btn">Print / Save as PDF</button>
    </div>`;
}

// ---------- Project body: every section visible, with an "On this page" menu ----------
function bodyHTML(p) {
  const blocks = [
    ...SECTIONS.filter(([k]) => hasContent(p.sections[k])).map(([k, label]) => ({
      id: k, label, html: `<div class="prose">${richText(hideTodoLines(p.sections[k]))}</div>`,
    })),
    p.model && { id: 'model', label: '3D model', html: modelHTML(p) },
    p.compare.length && { id: 'compare', label: 'Before / After', html: compareHTML(p) },
    p.videos.length && { id: 'videos', label: 'Video', html: videosHTML(p) },
    p.downloads.length && { id: 'files', label: 'Files', html: downloadsHTML(p) },
  ].filter(Boolean);
  if (!blocks.length) return '';

  return `<div class="project-body" id="details">
    <nav class="toc" aria-label="On this page">
      <p class="toc-title">On this page</p>
      <ul>${blocks.map((b) => `<li><a href="#sec-${b.id}">${b.label}</a></li>`).join('')}</ul>
    </nav>
    <div class="doc">
      ${blocks.map((b) => `<section class="doc-section" id="sec-${b.id}" aria-labelledby="sec-${b.id}-h">
        <h2 id="sec-${b.id}-h">${b.label}</h2>
        ${b.html}
      </section>`).join('')}
    </div>
  </div>`;
}

// Highlight the menu item for the section currently on screen.
function setupToc() {
  const links = [...document.querySelectorAll('.toc a')];
  if (!links.length) return;
  const list = document.querySelector('.toc ul');
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const setActive = (a) => {
    links.forEach((l) => l.removeAttribute('aria-current'));
    a.setAttribute('aria-current', 'true');
    // On phones the menu is a horizontal strip: keep the active chip in view.
    if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(byId.get(e.target.id)); });
  }, { rootMargin: '-25% 0px -65% 0px' });
  document.querySelectorAll('.doc-section').forEach((s) => observer.observe(s));
}

function modelHTML(p) {
  return `<model-viewer src="${esc(p.model.src)}" ${p.model.poster ? `poster="${esc(p.model.poster)}"` : ''}
      alt="${esc(p.model.alt || `3D model of ${p.title}`)}" camera-controls touch-action="pan-y"
      auto-rotate auto-rotate-delay="1500" rotation-per-second="18deg" shadow-intensity="0.7"
      exposure="1" environment-image="neutral" loading="lazy" interaction-prompt="auto"></model-viewer>
    <p class="model-hint">Drag to rotate · scroll or pinch to zoom${p.model.caption ? ` · ${esc(p.model.caption)}` : ''}</p>`;
}

function compareHTML(p) {
  return p.compare.map((c, i) => {
    const b = c.beforeLabel || 'Before';
    const a = c.afterLabel || 'After';
    return `<figure class="compare">
      <div class="compare-frame">
        <img class="compare-before" src="${esc(c.before)}" alt="${esc(b)}" loading="lazy">
        <img class="compare-after" src="${esc(c.after)}" alt="${esc(a)}" loading="lazy">
        <span class="compare-handle" aria-hidden="true"></span>
        <span class="compare-label before" aria-hidden="true">${esc(b)}</span>
        <span class="compare-label after" aria-hidden="true">${esc(a)}</span>
        <input class="compare-range" type="range" min="0" max="100" value="50" step="1"
          aria-label="Slide to compare ${esc(b)} and ${esc(a)}" id="compare-${i}">
      </div>
      ${isLocal || stripTodo(c.caption || '') ? (c.caption ? `<figcaption>${esc(c.caption)}</figcaption>` : '') : ''}
    </figure>`;
  }).join('');
}

function setupCompare() {
  document.querySelectorAll('.compare-frame').forEach((frame) => {
    const range = frame.querySelector('.compare-range');
    const set = () => {
      frame.style.setProperty('--pos', `${range.value}%`);
      range.setAttribute('aria-valuetext', `${range.value}% revealed`);
    };
    range.addEventListener('input', set);
    set();
  });
}

let modelViewerLoaded = false;
function loadModelViewer() {
  if (modelViewerLoaded) return;
  modelViewerLoaded = true;
  const s = document.createElement('script');
  s.type = 'module';
  s.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
  document.head.append(s);
}

// Lines starting with "TODO" are notes to yourself; they are hidden on the live site
// but still visible on your local preview so you remember to fill them in.
const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
function hideTodoLines(v) {
  if (isLocal) return v;
  const lines = (Array.isArray(v) ? v.join('\n') : String(v || '')).split('\n');
  return lines.filter((l) => !/^\s*(-\s*)?TODO\b/i.test(l)).join('\n');
}
function hasContent(v) {
  const text = Array.isArray(v) ? v.join('') : String(v || '');
  return text.trim() !== '' && (isLocal || hideTodoLines(v).trim() !== '');
}

// ---------- Videos ----------
function youtubeId(v) {
  const s = String(v.youtube || '');
  const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(s) ? s : '';
}

function videosHTML(p) {
  return `<div class="videos">
    ${p.videos.map((v) => {
      const id = youtubeId(v);
      const title = v.caption || `${p.title} video`;
      const frame = id
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(title)}" loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`
        : `<video controls preload="none" playsinline ${v.poster ? `poster="${esc(v.poster)}"` : ''}>
            <source src="${esc(v.src)}" type="video/mp4">
            <a href="${esc(v.src)}">Download the video</a>
          </video>`;
      return `<figure class="video"><div class="video-frame">${frame}</div>${v.caption ? `<figcaption>${esc(v.caption)}</figcaption>` : ''}</figure>`;
    }).join('')}
  </div>`;
}

// ---------- Downloads ----------
function downloadsHTML(p) {
  return `<ul class="downloads">
    ${p.downloads.map((d) => {
      const ext = (d.file.split('?')[0].split('.').pop() || '').toUpperCase();
      const meta = [ext, d.size].filter(Boolean).join(' · ');
      return `<li><a href="${esc(d.file)}" target="_blank" rel="noopener">
        <span class="dl-name">${esc(d.label || d.file.split('/').pop())}</span>
        <span class="dl-meta">${esc(meta)} <span aria-hidden="true">↓</span></span>
      </a></li>`;
    }).join('')}
  </ul>`;
}

// ---------- More projects ----------
async function renderRelated(p) {
  let all;
  try { all = await loadAllProjects(); } catch { return; }
  const others = all
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({
      o,
      score: (o.category === p.category ? 3 : 0)
        + o.skills.filter((s) => p.skills.includes(s)).length
        + o.tags.filter((t) => p.tags.includes(t)).length
        + (o.featured ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.o.order - b.o.order)
    .slice(0, 4)
    .map((x) => x.o);
  if (!others.length) return;
  const section = document.getElementById('related');
  section.querySelector('.related').innerHTML = others.map((o) => cardHTML(o, { showBadge: false })).join('');
  section.hidden = false;
}
