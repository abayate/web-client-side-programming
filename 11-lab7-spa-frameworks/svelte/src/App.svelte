<script>
  import { onMount } from 'svelte';

  // Svelte 5 runes: $state replaces plain `let` for reactive values
  let asteroids = $state([]);
  let loading = $state(true);
  let error = $state('');
  let hazardOnly = $state(false);
  let sortBy = $state('size');

  // Derived list: re-computed automatically when the filter or sort changes
  let visible = $derived.by(() => {
    const list = hazardOnly ? asteroids.filter(a => a.is_potentially_hazardous_asteroid) : [...asteroids];
    if (sortBy === 'size') list.sort((a, b) => maxSize(b) - maxSize(a));
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  });

  const maxSize = a => a.estimated_diameter.meters.estimated_diameter_max;
  const fmt = n => Math.round(n).toLocaleString();

  const fetchAsteroids = async () => {
    try {
      const apiKey = 'DEMO_KEY'; // NASA API demo key
      const endpoint = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status} (DEMO_KEY is rate limited)`);
      const data = await response.json();

      asteroids = data.near_earth_objects.slice(0, 12);
    } catch (err) {
      console.error('Error fetching data:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  };

  onMount(fetchAsteroids);
</script>

<nav class="blue-grey darken-4">
  <div class="nav-wrapper container">
    <span class="brand-logo">NEO Watch</span>
    <span class="right hide-on-small-only">Anthony Bayate &middot; Svelte 5</span>
  </div>
</nav>

<div class="container">
  <h1>Near Earth Objects</h1>
  <p class="subtitle">Tracked by <strong>Anthony Bayate</strong> with Svelte + Vite, data from NASA NeoWs</p>

  <div class="controls">
    <label>
      <input type="checkbox" class="filled-in" bind:checked={hazardOnly} />
      <span>Potentially hazardous only</span>
    </label>
    <select class="browser-default" bind:value={sortBy}>
      <option value="size">Sort by size</option>
      <option value="name">Sort by name</option>
    </select>
    <span class="grey-text">{visible.length} of {asteroids.length} objects</span>
  </div>

  {#if loading}
    <div class="progress"><div class="indeterminate"></div></div>
  {:else if error}
    <p class="red-text"><strong>Error:</strong> {error}</p>
  {/if}

  <div class="row">
    {#each visible as asteroid (asteroid.id)}
      <div class="col s12 m6 l4">
        <div class="card" class:hazard={asteroid.is_potentially_hazardous_asteroid}>
          <div class="card-content">
            <span class="card-title">{asteroid.name}</span>
            <p>
              <strong>Diameter:</strong>
              {fmt(asteroid.estimated_diameter.meters.estimated_diameter_min)} -
              {fmt(asteroid.estimated_diameter.meters.estimated_diameter_max)} m
            </p>
            <div class="bar"><span style="width: {Math.min(100, maxSize(asteroid) / 50)}%"></span></div>
            <p>
              <strong>Potentially Hazardous:</strong>
              <span class="badge-inline {asteroid.is_potentially_hazardous_asteroid ? 'red' : 'green'}">
                {asteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
              </span>
            </p>
            <p><strong>First Close Approach:</strong> {asteroid.close_approach_data[0]?.close_approach_date ?? 'n/a'}</p>
          </div>
          <div class="card-action">
            <a href={asteroid.nasa_jpl_url} target="_blank" rel="noopener noreferrer">JPL details</a>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  :global(body) { background: #eceff1; }
  h1 { font-size: 2.6rem; margin-bottom: 0; }
  .subtitle { margin-top: 4px; color: #555; }
  .nav-wrapper .right { padding-right: 8px; }
  .controls { display: flex; align-items: center; gap: 24px; margin: 16px 0; }
  .controls select { width: 180px; }
  .card { border-top: 4px solid #43a047; }
  .card.hazard { border-top-color: #e53935; }
  .card .card-title { font-size: 1.3rem; }
  .bar { height: 6px; background: #e0e0e0; border-radius: 3px; margin: 4px 0 10px; }
  .bar span { display: block; height: 100%; background: #546e7a; border-radius: 3px; }
  .badge-inline { color: white; padding: 1px 8px; border-radius: 10px; font-size: .85rem; }
</style>
