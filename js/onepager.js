// Builds the letter-size one-pager for a project (used by project.html and print-all.html).
// Layout is fixed at 8.5 x 11 in. Text that runs long is shrunk a little, then trimmed.
import { esc, formatDates, plainText, firstSentences, truncate, host, LIMITS } from './common.js';

export function projectUrl(site, slug) {
  const base = site.siteUrl ? site.siteUrl.replace(/\/?$/, '/') : new URL('./', location.href).href;
  return `${base}project.html?p=${encodeURIComponent(slug)}`;
}

export function siteHomeUrl(site) {
  return site.siteUrl ? site.siteUrl.replace(/\/?$/, '/') : new URL('./', location.href).href;
}

/** QR code as crisp vector SVG (uses the qrcode-generator library if it loaded). */
export function qrSVG(text) {
  if (typeof window.qrcode !== 'function') return '';
  const qr = window.qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" role="img" aria-label="QR code linking to ${esc(text)}"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
}

export function contactLine(site) {
  return [site.email, site.phone, site.linkedin && host(site.linkedin), site.github && host(site.github)]
    .filter(Boolean)
    .map(esc)
    .join('<span class="op-dot">·</span>');
}

function printText(p, key) {
  const custom = (p.print[key] || '').trim();
  const text = custom || plainText(p.sections[key]);
  return firstSentences(text, LIMITS.printText);
}

function pickFigures(p) {
  if (p.print.figures.length) return p.print.figures.slice(0, 3).map((src) => {
    const g = p.gallery.find((x) => x.src === src);
    return { src, caption: g ? g.caption : '' };
  });
  // Default: gallery images other than the cover, then before/after images.
  const pool = [
    ...p.gallery.filter((g) => g.src !== p.cover),
    ...p.compare.flatMap((c) => [
      { src: c.before, caption: c.beforeLabel || 'Before' },
      { src: c.after, caption: c.afterLabel || 'After' },
    ]),
  ];
  return pool.slice(0, 3);
}

const cleanCaption = (c) => truncate(String(c || '').replace(/^TODO:?\s*/i, ''), 90);

/** Returns an <article class="onepager"> element for one project. */
export function buildOnePager(p, site, { pageLabel = '' } = {}) {
  const url = projectUrl(site, p.slug);
  const specs = p.specs.slice(0, LIMITS.printSpecs);
  const figs = pickFigures(p);
  const blocks = [
    ['Problem', printText(p, 'problem')],
    ['Approach', printText(p, 'approach')],
    ['Results', printText(p, 'results')],
  ].filter(([, t]) => t);
  const meta = [formatDates(p), p.category, p.tags.slice(0, 4).join(', ')].filter(Boolean).join('  ·  ');

  const el = document.createElement('article');
  el.className = 'onepager';
  el.innerHTML = `
    <header class="op-head">
      <div class="op-name">${esc(site.name)}</div>
      <div class="op-contact">${contactLine(site)}</div>
    </header>

    <div class="op-titlebar">
      ${p.org ? `<p class="op-org">${esc(p.org)}${p.role ? ` · ${esc(p.role)}` : ''}</p>` : ''}
      <h1 class="op-title">${esc(truncate(p.title, LIMITS.title))}</h1>
      <p class="op-meta">${esc(meta)}</p>
    </div>

    <div class="op-top">
      <figure class="op-cover"><img src="${esc(p.cover)}" alt="${esc(p.coverAlt)}" style="object-position:${esc(p.coverPosition)}"></figure>
      <div class="op-side">
        <p class="op-summary" data-fit>${esc(truncate(p.summary, LIMITS.summary))}</p>
        ${specs.length ? `<section class="op-specs">
          <h2>Specifications</h2>
          <dl>${specs.map((s) => `<div><dt>${esc(truncate(String(s.label), LIMITS.specLabel))}</dt><dd>${esc(truncate(String(s.value), LIMITS.specValue))}</dd></div>`).join('')}</dl>
        </section>` : ''}
      </div>
    </div>

    ${blocks.length ? `<div class="op-body" style="--cols:${blocks.length}">
      ${blocks.map(([h, t]) => `<section data-fit><h2>${h}</h2><p>${esc(t)}</p></section>`).join('')}
    </div>` : '<div class="op-body op-body-empty"></div>'}

    ${figs.length ? `<div class="op-figs" style="--n:${figs.length}">
      ${figs.map((f) => `<figure><div class="op-fig-img"><img src="${esc(f.src)}" alt="${esc(cleanCaption(f.caption))}"></div>${f.caption ? `<figcaption>${esc(cleanCaption(f.caption))}</figcaption>` : ''}</figure>`).join('')}
    </div>` : ''}

    <footer class="op-foot">
      <div class="op-qr">${qrSVG(url)}</div>
      <div class="op-foot-text">
        <strong>Full project, photos and files</strong>
        <span>${esc(host(url))}</span>
      </div>
      ${pageLabel ? `<div class="op-page">${esc(pageLabel)}</div>` : ''}
    </footer>`;
  return el;
}

/** Shrink text slightly, then trim, until every block fits. Call after the element is in the DOM. */
export async function fitOnePager(el) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const blocks = [...el.querySelectorAll('[data-fit]')];
  const overflowing = () => blocks.some((b) => b.scrollHeight > b.clientHeight + 1) || el.scrollHeight > el.clientHeight + 1;

  let scale = 1;
  while (overflowing() && scale > 0.86) {
    scale = Math.round((scale - 0.035) * 1000) / 1000;
    el.style.setProperty('--op-scale', scale);
  }

  // Still too long: trim each overflowing block word by word (binary search).
  for (const b of blocks) {
    const p = b.tagName === 'P' ? b : b.querySelector('p');
    if (!p || b.scrollHeight <= b.clientHeight + 1) continue;
    const words = p.textContent.split(' ');
    let lo = 5, hi = words.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      p.textContent = `${words.slice(0, mid).join(' ').replace(/[\s,;:.–-]+$/, '')}…`;
      if (b.scrollHeight <= b.clientHeight + 1) lo = mid; else hi = mid - 1;
    }
    p.textContent = `${words.slice(0, lo).join(' ').replace(/[\s,;:.–-]+$/, '')}…`;
  }
}
