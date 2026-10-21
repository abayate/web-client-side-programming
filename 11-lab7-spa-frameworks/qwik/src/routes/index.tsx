import { component$, useSignal, useComputed$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

interface Movie {
  id: number;
  name: string;
  image: { medium: string } | null;
  summary: string | null;
  genres: string[];
  rating: { average: number | null };
  url: string;
}

// FIX 1: useClientEffect$ was removed from Qwik. Its replacement for
// browser-only code is useVisibleTask$, but the idiomatic Qwik way to load
// page data is routeLoader$: it runs on the server before render, so the
// HTML arrives with the movies already in it (no loading flash, nothing to
// hydrate).
export const useMovies = routeLoader$(async () => {
  try {
    const response = await fetch('https://api.tvmaze.com/shows');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: Movie[] = await response.json();
    return { movies: data.slice(0, 12), error: '' };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { movies: [] as Movie[], error: String(error) };
  }
});

export default component$(() => {
  const result = useMovies();
  const filter = useSignal('');

  // Recomputed only when the filter text changes; this is the only code that
  // gets downloaded to the browser, and only after the user types.
  const visible = useComputed$(() =>
    result.value.movies.filter(m => m.name.toLowerCase().includes(filter.value.toLowerCase()))
  );

  return (
    <>
      <nav class="teal darken-3">
        <div class="nav-wrapper container">
          <span class="brand-logo">Qwik Movies</span>
          <span class="right hide-on-small-only">Anthony Bayate &middot; Qwik</span>
        </div>
      </nav>
      <div class="container">
        <h1>Movies</h1>
        <p class="subtitle">Built by <strong>Anthony Bayate</strong> with Qwik City (server-loaded, resumable)</p>

        <div class="input-field">
          <input type="text" placeholder="Filter shows..." bind:value={filter} />
        </div>

        {result.value.error && <p class="red-text">Error: {result.value.error}</p>}

        <div class="row">
          {visible.value.map(movie => (
            <div class="col s12 m6 l4" key={movie.id}>
              <div class="card hoverable">
                <div class="card-image">
                  {/* FIX 2: some shows have image: null, which crashed movie.image.medium */}
                  <img
                    src={movie.image?.medium ?? 'https://placehold.co/210x295?text=No+Image'}
                    alt={movie.name}
                    width={210}
                    height={295}
                  />
                  <span class="card-title">{movie.name}</span>
                  <span class="rating">&#9733; {movie.rating.average ?? 'N/A'}</span>
                </div>
                <div class="card-content">
                  <p class="grey-text">{movie.genres.join(' / ')}</p>
                  {/* FIX 3: Qwik uses dangerouslySetInnerHTML, not innerHTML */}
                  <p dangerouslySetInnerHTML={movie.summary ?? 'No summary available.'}></p>
                </div>
                <div class="card-action">
                  <a href={movie.url} target="_blank" rel="noopener noreferrer">View on TVMaze</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Qwik Movies | Anthony Bayate',
};
