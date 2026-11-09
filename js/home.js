// Home page: builds the product grid from projects/projects.json.
import { loadSite, loadAllProjects, renderChrome, cardHTML, dateKey, esc } from './common.js';

const grid = document.getElementById('grid');
const filtersEl = document.getElementById('filters');
const sortEl = document.getElementById('sort');
const countEl = document.getElementById('count');

// Filter + sort live in the URL (?skill=FEA&sort=newest) so a filtered view can be shared.
const params = new URLSearchParams(location.search);
const state = { skill: params.get('skill') || 'All', sort: params.get('sort') || 'featured' };

let projects = [];

init();

async function init() {
  let site;
  try {
    site = await loadSite();
    renderChrome(site, 'projects');
    document.getElementById('intro').textContent = site.intro || '';
  } catch (err) {
    grid.innerHTML = `<li class="empty-state">${esc(err.message)}</li>`;
    return;
  }

  try {
    projects = await loadAllProjects();
  } catch (err) {
    grid.innerHTML = `<li class="empty-state">${esc(err.message)}</li>`;
    return;
  }

  buildFilters(site.filters || []);
  sortEl.value = state.sort === 'newest' ? 'newest' : 'featured';
  sortEl.addEventListener('change', () => { state.sort = sortEl.value; update(); });
  render();
}

function buildFilters(preferred) {
  // Chips = the preferred order from site.json, limited to skills actually used,
  // plus any extra skills a project uses that aren't in the list.
  const used = new Set(projects.flatMap((p) => [...p.skills, p.category]).filter(Boolean));
  const chips = ['All', ...preferred.filter((s) => used.has(s)), ...[...used].filter((s) => !preferred.includes(s)).sort()];
  if (!chips.includes(state.skill)) state.skill = 'All';

  filtersEl.innerHTML = chips
    .map((c) => `<button type="button" class="chip" data-skill="${esc(c)}" aria-pressed="${c === state.skill}">${esc(c)}</button>`)
    .join('');
  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.skill = btn.dataset.skill;
    filtersEl.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    update();
  });
}

function update() {
  const q = new URLSearchParams();
  if (state.skill !== 'All') q.set('skill', state.skill);
  if (state.sort !== 'featured') q.set('sort', state.sort);
  history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
  render();
}

function render() {
  let list = projects.filter((p) => state.skill === 'All' || p.skills.includes(state.skill) || p.category === state.skill);

  if (state.sort === 'newest') {
    list = [...list].sort((a, b) => dateKey(b) - dateKey(a) || a.order - b.order);
  } else {
    // Featured first, then the order in projects.json
    list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
  }

  countEl.textContent = `${list.length} ${list.length === 1 ? 'project' : 'projects'}`;
  grid.innerHTML = list.length
    ? list.map((p, i) => cardHTML(p, { eager: i < 3 })).join('')
    : '<li class="empty-state">No projects with that skill yet.</li>';
}
