// TV Show Finder - Anthony Bayate
// Improvements over the lab starter:
//  - search box (TVMaze search endpoint) instead of a fixed list
//  - loading / error states are actually used
//  - HTML in summaries is stripped so it can't inject markup
//  - shows without an image get a placeholder instead of crashing
//  - rating, genres and premiere year on each card
//  - cards are built in one pass instead of innerHTML += in a loop

const API = 'https://api.tvmaze.com';
const PLACEHOLDER = 'https://placehold.co/210x295?text=No+Image';

const moviesContainer = document.getElementById('movies');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('error');
const count = document.getElementById('count');

function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
  return doc.body.textContent || 'No summary available.';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

function movieCard(show) {
  const summary = stripHtml(show.summary);
  const short = summary.length > 180 ? summary.slice(0, 180) + '...' : summary;
  const rating = show.rating?.average ?? 'N/A';
  const year = show.premiered ? show.premiered.slice(0, 4) : '?';
  const genres = (show.genres || [])
    .map(g => `<span class="chip">${escapeHtml(g)}</span>`)
    .join('');

  return `
    <div class="col s12 m6 l4">
      <div class="card hoverable">
        <div class="card-image">
          <img src="${show.image?.medium ?? PLACEHOLDER}" alt="${escapeHtml(show.name)}" loading="lazy">
          <span class="card-title">${escapeHtml(show.name)}</span>
          <span class="rating">&#9733; ${rating}</span>
        </div>
        <div class="card-content">
          <p class="grey-text">${year} &middot; ${escapeHtml(show.language ?? '')}</p>
          <div>${genres}</div>
          <p>${escapeHtml(short)}</p>
        </div>
        <div class="card-action">
          <a href="${show.url}" target="_blank" rel="noopener noreferrer">View on TVMaze</a>
        </div>
      </div>
    </div>`;
}

async function loadShows(query = '') {
  loading.style.display = 'block';
  errorBox.style.display = 'none';
  moviesContainer.innerHTML = '';

  try {
    const url = query ? `${API}/search/shows?q=${encodeURIComponent(query)}` : `${API}/shows`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // the search endpoint wraps each show as { score, show }
    const shows = (query ? data.map(r => r.show) : data).slice(0, 12);
    count.textContent = `Showing ${shows.length} show(s)${query ? ` for "${query}"` : ''}`;
    moviesContainer.innerHTML = shows.map(movieCard).join('');
  } catch (error) {
    console.error('Error fetching data:', error);
    errorBox.textContent = `Could not load shows: ${error.message}`;
    errorBox.style.display = 'block';
  } finally {
    loading.style.display = 'none';
  }
}

document.getElementById('search-form').addEventListener('submit', e => {
  e.preventDefault();
  loadShows(document.getElementById('search').value.trim());
});

loadShows();
