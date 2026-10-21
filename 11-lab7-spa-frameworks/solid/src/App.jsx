import { createSignal, createMemo, onMount, For, Show } from 'solid-js';

function App() {
  const [cartoons, setCartoons] = createSignal([]);
  const [search, setSearch] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  // Only the cards whose title matches the search box; Solid re-runs this
  // memo only when cartoons() or search() changes.
  const filtered = createMemo(() => {
    const q = search().toLowerCase();
    return cartoons().filter(c => c.title.toLowerCase().includes(q));
  });

  onMount(async () => {
    try {
      const response = await fetch('https://api.sampleapis.com/cartoons/cartoons2D');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setCartoons(data.slice(0, 12)); // first 12 cartoons for demonstration
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <nav class="deep-orange darken-2">
        <div class="nav-wrapper container">
          <span class="brand-logo">Toon Shelf</span>
          <span class="right hide-on-small-only">Anthony Bayate &middot; SolidJS</span>
        </div>
      </nav>
      <div class="container">
        <h1>Cartoons</h1>
        <p class="subtitle">Built by <strong>Anthony Bayate</strong> with Solid + Vite</p>

        <div class="input-field">
          <input
            type="text"
            placeholder="Filter by title..."
            value={search()}
            onInput={e => setSearch(e.currentTarget.value)}
          />
        </div>

        <Show when={loading()}>
          <div class="progress"><div class="indeterminate"></div></div>
        </Show>
        <Show when={error()}>
          <p class="red-text">Error: {error()}</p>
        </Show>

        <div class="row">
          {/* <For> instead of .map(): Solid keys items itself, so no key prop */}
          <For each={filtered()} fallback={!loading() && <p>No cartoons match.</p>}>
            {cartoon => (
              <div class="col s12 m6 l4">
                <div class="card hoverable">
                  <div class="card-image">
                    <img
                      src={cartoon.image}
                      alt={cartoon.title}
                      loading="lazy"
                      onError={e => (e.currentTarget.src = 'https://placehold.co/400x300?text=' + encodeURIComponent(cartoon.title))}
                    />
                  </div>
                  <div class="card-content">
                    <span class="card-title">{cartoon.title}</span>
                    <p><strong>Year:</strong> {cartoon.year} &middot; {cartoon.episodes} episodes &middot; {cartoon.rating}</p>
                    <p><strong>Creator:</strong> {cartoon.creator.join(', ')}</p>
                    <div class="genres">
                      <For each={cartoon.genre}>{g => <span class="chip">{g}</span>}</For>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  );
}

export default App;
