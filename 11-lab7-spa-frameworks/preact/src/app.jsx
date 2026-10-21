import { useState, useEffect } from 'preact/hooks';
import 'materialize-css/dist/css/materialize.min.css';
import './app.css';

// The lab used /public/collection/v1/search, which the Met retired on 2026-10-01.
// Its replacement is /v1.1/search, which is paginated with limit/offset.
const MET = 'https://collectionapi.metmuseum.org/public/collection';
const TOPICS = ['painting', 'sunflowers', 'samurai', 'egypt', 'ocean', 'portrait'];

export function App() {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('painting');

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${MET}/v1.1/search?q=${encodeURIComponent(query)}&hasImages=true&limit=40`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const objectIDs = data.objectIDs || [];

        // allSettled: one broken object no longer makes the whole page fail
        const results = await Promise.allSettled(
          objectIDs.map(id => fetch(`${MET}/v1/objects/${id}`).then(res => res.json()))
        );
        const filteredArtworks = results
          .filter(r => r.status === 'fulfilled' && r.value.primaryImageSmall)
          .map(r => r.value)
          .slice(0, 12);
        setArtworks(filteredArtworks);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [query]);

  return (
    <>
      <nav class="brown darken-2">
        <div class="nav-wrapper container">
          <span class="brand-logo">Met Gallery</span>
          <span class="right hide-on-small-only">Anthony Bayate &middot; Preact</span>
        </div>
      </nav>
      <div class="container">
        <h1>Art Collection</h1>
        <p class="subtitle">Curated by <strong>Anthony Bayate</strong> with Preact + Vite</p>

        <div class="topics">
          {TOPICS.map(t => (
            <button
              class={`btn-small ${t === query ? 'brown' : 'brown lighten-4 brown-text'}`}
              onClick={() => setQuery(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <div class="progress"><div class="indeterminate"></div></div>}
        {error && <p class="error">{error}</p>}
        {!loading && !error && artworks.length === 0 && <p>No artworks with images found.</p>}

        <div class="row">
          {artworks.map(art => (
            <div class="col s12 m6 l4" key={art.objectID}>
              <div class="card hoverable">
                <div class="card-image">
                  <img src={art.primaryImageSmall} alt={art.title} loading="lazy" />
                </div>
                <div class="card-content">
                  <span class="card-title truncate" title={art.title}>{art.title}</span>
                  <p><strong>Artist:</strong> {art.artistDisplayName || 'Unknown'}</p>
                  <p><strong>Date:</strong> {art.objectDate || 'Unknown'}</p>
                  <p><strong>Culture:</strong> {art.culture || 'Unknown'}</p>
                  <p><strong>Department:</strong> {art.department}</p>
                </div>
                <div class="card-action">
                  <a href={art.objectURL} target="_blank" rel="noopener noreferrer">
                    View on Met Museum
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
