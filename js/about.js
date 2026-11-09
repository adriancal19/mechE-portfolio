// About page: content comes from the "about" block in site.json.
import { loadSite, renderChrome, esc, inline, showError } from './common.js';

const main = document.getElementById('main');

init();

async function init() {
  let site;
  try {
    site = await loadSite();
  } catch (err) {
    showError(main, 'Something went wrong', err.message);
    return;
  }
  renderChrome(site, 'about');
  const a = site.about || {};

  main.innerHTML = `
    <div class="about-hero">
      <figure class="about-photo"><img src="${esc(a.photo || '')}" alt="${esc(a.photoAlt || site.name)}"></figure>
      <div class="about-text">
        <p class="eyebrow">About</p>
        <h1>${esc(site.name)}</h1>
        <p class="about-headline">${esc(site.credential || site.headline || '')}</p>
        ${(a.bio || []).map((b) => `<p class="bio">${inline(b)}</p>`).join('')}
        <div class="about-actions">
          <a class="btn btn-primary" href="index.html">See my projects</a>
          ${site.resume ? `<a class="btn" href="${esc(site.resume)}" target="_blank" rel="noopener">Resume (PDF)</a>` : ''}
          ${site.email ? `<a class="btn" href="mailto:${esc(site.email)}">Email me</a>` : ''}
          ${site.linkedin ? `<a class="btn" href="${esc(site.linkedin)}" target="_blank" rel="noopener">LinkedIn <span aria-hidden="true">↗</span></a>` : ''}
        </div>
      </div>
    </div>`;
}
