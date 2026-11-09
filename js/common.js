// Shared helpers: loading JSON, header/footer, cards, text formatting.
// Every path is relative, so the site works at /portfolio/ and on a custom domain.

// ---- Character limits (keep in sync with README + _template) ----
export const LIMITS = {
  title: 60,
  org: 60,
  summary: 300,
  caption: 120,
  specs: 8,          // rows shown on the web page
  printSpecs: 6,     // rows shown on the one-pager
  specLabel: 22,
  specValue: 34,
  printText: 350,    // print.problem / print.approach / print.results
};

const textCache = new Map();

export function getText(path) {
  if (!textCache.has(path)) {
    textCache.set(path, fetch(path, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) {
        const err = new Error(`Could not load ${path} (HTTP ${res.status}).`);
        err.status = res.status;
        throw err;
      }
      return res.text();
    }));
  }
  return textCache.get(path);
}

export async function getJSON(path) {
  const text = await getText(path);
  try { return JSON.parse(text); }
  catch (err) { throw new Error(`${path} has a JSON formatting error: ${err.message}`); }
}

export const loadSite = () => getJSON('site.json');

export async function loadManifest() {
  const data = await getJSON('projects/projects.json');
  const list = Array.isArray(data) ? data : data.projects || [];
  return list
    .map((item, index) => (typeof item === 'string' ? { slug: item } : item))
    .filter((item) => item && item.slug && !item.slug.startsWith('_') && item.hidden !== true)
    .map((item, index) => ({ ...item, order: index }));
}

/** Load one project and normalize it so the rest of the code can trust its shape. */
export async function loadProject(slug, meta = {}) {
  if (!/^[\w-]+$/.test(slug)) throw new Error(`"${slug}" is not a valid project name.`);
  const base = `projects/${slug}/`;
  let raw;
  try {
    raw = parseProjectMd(await getText(`${base}project.md`));
  } catch (err) {
    if (err.status !== 404) throw err;
    raw = await getJSON(`${base}project.json`); // older format still works
  }
  return normalizeProject(raw, slug, base, meta);
}

// ---- project.md parser ----
// Format: a "---" block of "key: value" lines, then "## Section" blocks.
// See projects/_template/project.md for the full template.
const KEY_MAP = {
  title: 'title', org: 'org', organization: 'org', team: 'org', role: 'role',
  start: 'start', end: 'end', category: 'category', skills: 'skills', tags: 'tags', tools: 'tags',
  cover: 'cover', coveralt: 'coverAlt', coverposition: 'coverPosition', hover: 'hover',
  model: 'model', modelalt: 'modelAlt', modelposter: 'modelPoster',
};
const SECTION_MAP = {
  summary: 'summary', specs: 'specs', specifications: 'specs',
  gallery: 'gallery', photos: 'gallery', images: 'gallery',
  problem: 'problem', approach: 'approach', results: 'results',
  whatilearned: 'learned', learned: 'learned', lessonslearned: 'learned', iterations: 'iterations',
  beforeafter: 'compare', compare: 'compare', video: 'videos', videos: 'videos',
  downloads: 'downloads', files: 'downloads', links: 'links',
  onepager: 'print', print: 'print', pdf: 'print',
};
const keyOf = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
const splitList = (s) => (s ? String(s).split(',').map((x) => x.trim()).filter(Boolean) : []);
const listItems = (content) => content.split('\n').map((l) => l.trim())
  .filter((l) => /^[-*]\s+/.test(l)).map((l) => l.replace(/^[-*]\s+/, ''));
const cells = (line) => line.split('|').map((c) => c.trim());

function splitSpec(line) {
  let label, value;
  if (line.includes('|')) [label, value] = cells(line);
  else {
    const i = line.indexOf(':');
    if (i < 0) return null;
    label = line.slice(0, i).trim();
    value = line.slice(i + 1).trim();
  }
  return label && value ? { label, value } : null;
}

function parsePrintSection(content) {
  const out = { figures: [] };
  const parts = content.split(/^###[ \t]*(.+?)[ \t]*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const k = keyOf(parts[i]);
    const body = (parts[i + 1] || '').trim();
    if (k === 'figures' || k === 'images') out.figures = listItems(body).map((l) => cells(l)[0]).filter(Boolean);
    else if (['problem', 'approach', 'results'].includes(k)) out[k] = body.replace(/\s*\n\s*/g, ' ');
  }
  return out;
}

export function parseProjectMd(text) {
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
  const raw = { sections: {}, print: {} };
  let body = src;

  const fm = /^\s*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(src);
  if (fm) {
    body = src.slice(fm[0].length);
    for (const line of fm[1].split('\n')) {
      const m = /^\s*([^:#]+?)\s*:\s*(.*?)\s*$/.exec(line);
      const k = m && KEY_MAP[keyOf(m[1])];
      if (k && m[2]) raw[k] = m[2];
    }
  }
  raw.skills = splitList(raw.skills);
  raw.tags = splitList(raw.tags);
  raw.model = raw.model ? { src: raw.model, alt: raw.modelAlt || '', poster: raw.modelPoster || '' } : null;

  const parts = body.split(/^##(?!#)[ \t]*(.+?)[ \t]*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const key = SECTION_MAP[keyOf(parts[i])];
    const content = (parts[i + 1] || '').trim();
    if (!key || !content) continue;
    const rows = () => listItems(content).map(cells);
    switch (key) {
      case 'summary': raw.summary = content.replace(/\s*\n\s*/g, ' '); break;
      case 'specs': raw.specs = listItems(content).map(splitSpec).filter(Boolean); break;
      case 'gallery': raw.gallery = rows().map(([src = '', caption = '', alt = '']) => ({ src, caption, alt })); break;
      case 'compare':
        raw.compare = rows().map(([before = '', after = '', beforeLabel = '', afterLabel = '', caption = '']) =>
          ({ before, after, beforeLabel, afterLabel, caption }));
        break;
      case 'videos':
        raw.videos = rows().map(([url = '', caption = '', poster = '']) =>
          (/youtu\.?be/i.test(url) ? { youtube: url, caption } : { src: url, caption, poster }));
        break;
      case 'downloads': raw.downloads = rows().map(([label = '', file = '', size = '']) => ({ label, file, size })); break;
      case 'links': raw.links = rows().map(([label = '', url = '']) => ({ label, url })); break;
      case 'print': raw.print = parsePrintSection(content); break;
      default: raw.sections[key] = content;
    }
  }
  return raw;
}

/** Load every project in the manifest. Broken ones are skipped (and reported). */
export async function loadAllProjects() {
  const manifest = await loadManifest();
  const results = await Promise.allSettled(manifest.map((m) => loadProject(m.slug, m)));
  const projects = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') projects.push(r.value);
    else reportProblem(`${manifest[i].slug}: ${r.reason.message}`);
  });
  return projects;
}

const isBlank = (v) => v == null || (typeof v === 'string' && v.trim() === '');
const isAbsolute = (src) => /^(https?:)?\/\//i.test(src) || src.startsWith('data:');

function normalizeProject(raw, slug, base, meta) {
  const resolve = (src) => (isBlank(src) ? '' : isAbsolute(src) ? src : base + src.replace(/^\.\//, ''));
  const arr = (v) => (Array.isArray(v) ? v : []);

  const gallery = arr(raw.gallery)
    .filter((g) => g && !isBlank(g.src))
    .map((g) => ({ src: resolve(g.src), caption: g.caption || '', alt: g.alt || g.caption || raw.title || '' }));
  const cover = resolve(raw.cover) || (gallery[0] && gallery[0].src) || '';

  const p = {
    slug,
    base,
    featured: Boolean(meta.featured ?? raw.featured),
    order: meta.order ?? 0,
    title: raw.title || slug,
    org: raw.org || '',
    role: raw.role || '',
    start: String(raw.start || ''),
    end: String(raw.end || ''),
    category: raw.category || '',
    skills: arr(raw.skills).filter(Boolean),
    tags: arr(raw.tags).filter(Boolean),
    summary: raw.summary || '',
    cover,
    coverAlt: raw.coverAlt || raw.title || '',
    coverPosition: raw.coverPosition || 'center',
    hover: resolve(raw.hover),
    gallery: gallery.length ? gallery : cover ? [{ src: cover, caption: '', alt: raw.coverAlt || raw.title || '' }] : [],
    specs: arr(raw.specs).filter((s) => s && !isBlank(s.label) && !isBlank(s.value)),
    sections: raw.sections || {},
    compare: arr(raw.compare)
      .filter((c) => c && !isBlank(c.before) && !isBlank(c.after))
      .map((c) => ({ ...c, before: resolve(c.before), after: resolve(c.after) })),
    model: raw.model && !isBlank(raw.model.src)
      ? { ...raw.model, src: resolve(raw.model.src), poster: resolve(raw.model.poster) }
      : null,
    videos: arr(raw.videos)
      .filter((v) => v && (!isBlank(v.youtube) || !isBlank(v.src)))
      .map((v) => ({ ...v, src: resolve(v.src), poster: resolve(v.poster) })),
    downloads: arr(raw.downloads)
      .filter((d) => d && !isBlank(d.file))
      .map((d) => ({ ...d, file: resolve(d.file) })),
    links: arr(raw.links).filter((l) => l && !isBlank(l.url)),
    print: raw.print || {},
    resolve,
  };
  p.print = { ...p.print, figures: arr(p.print.figures).filter((f) => !isBlank(f)).map(resolve) };
  checkLimits(p);
  return p;
}

// ---- Dates ----
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const isPresent = (s) => /^(present|now|ongoing|current)$/i.test(s);

/** Reads "MM/YYYY", "MM/YY", "YYYY-MM" or "YYYY" → { year, month } (month may be 0 = unknown). */
export function parseDate(s) {
  const str = String(s || '').trim();
  let m = /^(\d{1,2})\s*[/.-]\s*(\d{4}|\d{2})$/.exec(str);           // 01/2026, 1/26
  if (m) return { year: m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]), month: Number(m[1]) };
  m = /^(\d{4})(?:\s*[-/.]\s*(\d{1,2}))?$/.exec(str);                 // 2026-01, 2026
  if (m) return { year: Number(m[1]), month: Number(m[2] || 0) };
  return null;
}

export function formatMonth(s) {
  if (!s) return '';
  if (isPresent(s)) return 'Present';
  const d = parseDate(s);
  if (!d) return s;
  return d.month ? `${String(d.month).padStart(2, '0')}/${d.year}` : String(d.year);
}

export function formatDates(p) {
  const a = formatMonth(p.start);
  const b = formatMonth(p.end);
  if (!a) return b;
  if (!b || a === b) return a;
  return `${a} – ${b}`;
}

/** Date line on the card, e.g. "01/2026 – 10/2026" or "08/2025 – Present" */
export function cardYear(p) {
  return formatDates(p);
}

/** Sortable number: higher = newer. "present" counts as newest. */
export function dateKey(p) {
  const s = p.end || p.start;
  if (isPresent(s)) return 999999;
  const d = parseDate(s);
  return d ? d.year * 100 + (d.month || 12) : 0;
}

// ---- Text helpers ----
export function esc(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Escape, then allow **bold** and [link text](https://url). */
export function inline(str = '') {
  return esc(str)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|project\.html|projects\/)[^)\s]+)\)/g, (m, text, url) => {
      const ext = /^https?:/.test(url);
      return `<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
    });
}

/** Section text → HTML. Accepts a string (blank line = new paragraph) or an array of
 *  strings. Lines starting with "- " become bullet points. */
export function richText(value) {
  const lines = (Array.isArray(value) ? value.join('\n') : String(value || '')).split('\n');
  let html = '', para = [], list = [];
  const flushPara = () => { if (para.length) html += `<p>${inline(para.join(' '))}</p>`; para = []; };
  const flushList = () => { if (list.length) html += `<ul>${list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`; list = []; };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (/^###\s+/.test(line)) { flushPara(); flushList(); html += `<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`; continue; }
    if (/^[-•*]\s+/.test(line)) { flushPara(); list.push(line.replace(/^[-•*]\s+/, '')); }
    else { flushList(); para.push(line); }
  }
  flushPara(); flushList();
  return html;
}

/** Plain text version (for print): drops bullets and markdown. */
export function plainText(value) {
  const s = Array.isArray(value) ? value.join('\n') : String(value || '');
  return s
    .split('\n')
    .map((l) => l.trim().replace(/^(#{1,6}|[-•*])\s+/, ''))
    .filter((l) => l && !/^TODO\b/i.test(l))
    .join(' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cut text to n characters at a word boundary, adding an ellipsis. */
export function truncate(str = '', n = 300) {
  const s = String(str).trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > n * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.–-]+$/, '')}…`;
}

/** First sentences that fit within n characters. */
export function firstSentences(str = '', n = 350) {
  const s = String(str).trim();
  if (s.length <= n) return s;
  const sentences = s.match(/[^.!?]+[.!?]+(\s|$)/g) || [s];
  let out = '';
  for (const sen of sentences) {
    if ((out + sen).trim().length > n) break;
    out += sen;
  }
  return out.trim() || truncate(s, n);
}

export function host(url = '') {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

// ---- Content checker (shows only when previewing locally) ----
const problems = [];
const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname) || location.hostname.startsWith('192.168.');

export function reportProblem(msg) {
  console.warn(`[portfolio] ${msg}`);
  problems.push(msg);
  if (!isLocal) return;
  clearTimeout(reportProblem.t);
  reportProblem.t = setTimeout(renderProblems, 300);
}

function renderProblems() {
  let box = document.querySelector('.content-check');
  if (!box) {
    box = document.createElement('aside');
    box.className = 'content-check';
    box.setAttribute('aria-label', 'Content check');
    document.body.append(box);
  }
  box.innerHTML = `<button type="button" aria-label="Dismiss">×</button>
    <strong>Content check (only visible on your local preview)</strong>
    <ul>${[...new Set(problems)].map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;
  box.querySelector('button').onclick = () => box.remove();
}

function checkLimits(p) {
  const over = (field, value, max) => {
    if (value && value.length > max) reportProblem(`${p.slug}: ${field} is ${value.length} characters (limit ${max}).`);
  };
  over('title', p.title, LIMITS.title);
  over('org', p.org, LIMITS.org);
  over('summary', p.summary, LIMITS.summary);
  p.gallery.forEach((g, i) => over(`gallery[${i + 1}] caption`, g.caption, LIMITS.caption));
  if (p.specs.length > LIMITS.specs) reportProblem(`${p.slug}: ${p.specs.length} specs (limit ${LIMITS.specs}; the one-pager shows the first ${LIMITS.printSpecs}).`);
  p.specs.forEach((s) => {
    over(`spec label "${s.label}"`, String(s.label), LIMITS.specLabel);
    over(`spec value "${s.value}"`, String(s.value), LIMITS.specValue);
  });
  ['problem', 'approach', 'results'].forEach((k) => over(`print.${k}`, p.print[k], LIMITS.printText));
  if (!p.cover) reportProblem(`${p.slug}: no cover image.`);
}

// Missing images: hide the broken icon and report the path.
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el && el.tagName === 'IMG' && !el.classList.contains('is-missing')) {
    el.classList.add('is-missing');
    reportProblem(`Image not found: ${el.getAttribute('src')}`);
  }
}, true);

// ---- Layout: header + footer ----
export function renderChrome(site, active) {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  const link = (href, label, key, extra = '') =>
    `<li><a href="${href}"${key === active ? ' aria-current="page"' : ''}${extra}>${label}</a></li>`;

  if (header) {
    header.className = 'site-header';
    header.innerHTML = `<div class="wrap">
      <a class="brand" href="index.html">${esc(site.name)}</a>
      <nav class="site-nav" aria-label="Main">
        <ul>
          ${link('index.html', 'Projects', 'projects')}
          ${link('about.html', 'About', 'about')}
          ${link(esc(site.resume), 'Resume', 'resume', ' target="_blank" rel="noopener"')}
        </ul>
      </nav>
    </div>`;
  }

  if (footer) {
    footer.className = 'site-footer';
    const links = [
      site.email && `<li><a href="mailto:${esc(site.email)}">Email</a></li>`,
      site.linkedin && `<li><a href="${esc(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>`,
      site.github && `<li><a href="${esc(site.github)}" target="_blank" rel="noopener">GitHub</a></li>`,
      site.resume && `<li><a href="${esc(site.resume)}" target="_blank" rel="noopener">Resume (PDF)</a></li>`,
    ].filter(Boolean).join('');
    footer.innerHTML = `<div class="wrap">
      <div class="footer-top">
        <div>
          <p class="footer-name">${esc(site.name)}</p>
          <p class="footer-sub">${esc(site.headline)}${site.location ? ` · ${esc(site.location)}` : ''}</p>
          ${site.email ? `<p class="footer-sub"><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>` : ''}
        </div>
        <ul class="footer-links" aria-label="Contact">${links}</ul>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${esc(site.name)}</span>
        <a href="print-all.html">Print full portfolio</a>
      </div>
    </div>`;
  }
}

// ---- Product card (used on Home and in "More projects") ----
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function cardHTML(p, { eager = false, showBadge = true } = {}) {
  const meta = [cardYear(p), p.category].filter(Boolean).join(' · ');
  const pos = esc(p.coverPosition);
  const hover = canHover && p.hover
    ? `<img class="img-hover" src="${esc(p.hover)}" alt="" loading="lazy" decoding="async" style="object-position:${pos}">`
    : '';
  return `<li class="card">
    <a href="project.html?p=${encodeURIComponent(p.slug)}">
      <div class="card-media">
        ${showBadge && p.featured ? '<span class="card-badge">Featured</span>' : ''}
        <img src="${esc(p.cover)}" alt="${esc(p.coverAlt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" style="object-position:${pos}">
        ${hover}
      </div>
      <div class="card-info">
        <h3 class="card-title">${esc(p.title)}</h3>
        <p class="card-meta">${esc(meta)}</p>
      </div>
    </a>
  </li>`;
}

export function showError(container, title, message) {
  container.innerHTML = `<div class="notice wrap">
    <h1>${esc(title)}</h1>
    <p>${esc(message)}</p>
    <a class="btn" href="index.html">Back to all projects</a>
  </div>`;
}
