// Full portfolio: a cover page + one page per project, in one print job.
import { loadSite, loadAllProjects, esc, formatDates, host } from './common.js';
import { buildOnePager, fitOnePager, qrSVG, contactLine, siteHomeUrl } from './onepager.js';

const root = document.getElementById('print-root');
const status = document.getElementById('status');
const btn = document.getElementById('print-btn');

init();

async function init() {
  try {
    const [site, projects] = await Promise.all([loadSite(), loadAllProjects()]);
    document.title = `${site.name} · Engineering Portfolio`;

    root.append(buildCover(site, projects));
    const sheets = projects.map((p, i) => buildOnePager(p, site, { pageLabel: `${i + 2} / ${projects.length + 1}` }));
    root.append(...sheets);
    await Promise.all(sheets.map(fitOnePager));

    status.textContent = `${projects.length + 1} pages: a cover page plus one page per project. Choose "Save as PDF" as the printer for a file.`;
    btn.disabled = false;
    btn.addEventListener('click', () => window.print());
  } catch (err) {
    status.textContent = err.message;
  }
}

function buildCover(site, projects) {
  const home = siteHomeUrl(site);
  const covers = projects.slice(0, 4);
  const el = document.createElement('article');
  el.className = 'onepager op-coverpage';
  el.innerHTML = `
    <div class="cp-top">
      <p class="cp-kicker">Engineering Portfolio</p>
      <h1 class="cp-name">${esc(site.fullName || site.name)}</h1>
      <p class="cp-cred">${esc(site.credential || site.headline || '')}</p>
      <p class="cp-contact">${contactLine(site)}</p>
    </div>

    ${covers.length ? `<div class="cp-covers" style="--n:${covers.length}">
      ${covers.map((p) => `<figure><img src="${esc(p.cover)}" alt="${esc(p.coverAlt)}" style="object-position:${esc(p.coverPosition)}"></figure>`).join('')}
    </div>` : ''}

    <section class="cp-contents">
      <h2>Projects</h2>
      <ol>
        ${projects.map((p, i) => `<li>
          <span class="cp-num">${String(i + 1).padStart(2, '0')}</span>
          <span><span class="cp-title">${esc(p.title)}</span><br><span class="cp-sub">${esc([formatDates(p), p.category, p.org].filter(Boolean).join(' · '))}</span></span>
          <span class="cp-page">p. ${i + 2}</span>
        </li>`).join('')}
      </ol>
    </section>

    <footer class="op-foot">
      <div class="op-qr">${qrSVG(home)}</div>
      <div class="op-foot-text">
        <strong>Interactive portfolio with 3D models, video and files</strong>
        <span>${esc(host(home))}</span>
      </div>
      <div class="op-page">1 / ${projects.length + 1}</div>
    </footer>`;
  return el;
}
