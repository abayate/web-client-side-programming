<template>
  <nav class="indigo darken-2">
    <div class="nav-wrapper container">
      <span class="brand-logo">Album Explorer</span>
      <span class="right hide-on-small-only">Anthony Bayate &middot; Vue 3</span>
    </div>
  </nav>

  <div class="container">
    <h1>Music Albums</h1>
    <p class="subtitle">Built by <strong>Anthony Bayate</strong> with Vue + Vite</p>

    <form class="row" @submit.prevent="fetchAlbums">
      <div class="input-field col s6">
        <input v-model="searchTerm" type="text" placeholder="Artist name" />
      </div>
      <div class="input-field col s3">
        <select v-model="sortBy" class="browser-default">
          <option value="relevance">Sort: relevance</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="tracks">Most tracks</option>
        </select>
      </div>
      <div class="input-field col s3">
        <button class="btn indigo" type="submit">Search</button>
      </div>
    </form>

    <div v-if="error" class="error card-panel red lighten-4">{{ error }}</div>

    <div v-else-if="isLoading" class="progress">
      <div class="indeterminate"></div>
    </div>

    <p v-else-if="sortedAlbums.length === 0" class="grey-text">No albums found for "{{ lastSearch }}".</p>

    <div v-else class="row">
      <p class="grey-text col s12">{{ sortedAlbums.length }} albums for "{{ lastSearch }}"</p>
      <div v-for="album in sortedAlbums" :key="album.collectionId" class="col s12 m6 l4">
        <div class="card hoverable">
          <div class="card-image">
            <!-- iTunes returns 100x100 art; swap to 400x400 so it isn't blurry -->
            <img :src="bigArt(album.artworkUrl100)" :alt="`Album Art for ${album.collectionName}`" />
          </div>
          <div class="card-content">
            <span class="card-title truncate">{{ album.collectionName }}</span>
            <p><strong>Artist:</strong> {{ album.artistName }}</p>
            <p><strong>Genre:</strong> {{ album.primaryGenreName }}</p>
            <p><strong>Released:</strong> {{ album.releaseDate?.slice(0, 4) }} &middot; {{ album.trackCount }} tracks</p>
            <p v-if="album.collectionPrice"><strong>Price:</strong> ${{ album.collectionPrice }}</p>
          </div>
          <div class="card-action">
            <a :href="album.collectionViewUrl" target="_blank" rel="noopener noreferrer">View on iTunes</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const albums = ref([]);
    const error = ref(null);
    const isLoading = ref(true);
    const searchTerm = ref('jack johnson');
    const lastSearch = ref('');
    const sortBy = ref('relevance');
    const limit = 12; // Number of albums to fetch

    const bigArt = url => url?.replace('100x100bb', '400x400bb');

    // Sorting happens on the client so changing it doesn't hit the API again
    const sortedAlbums = computed(() => {
      const list = [...albums.value];
      if (sortBy.value === 'newest') list.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
      if (sortBy.value === 'oldest') list.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
      if (sortBy.value === 'tracks') list.sort((a, b) => b.trackCount - a.trackCount);
      return list;
    });

    const fetchAlbums = async () => {
      isLoading.value = true;
      error.value = null;
      lastSearch.value = searchTerm.value;
      try {
        const term = encodeURIComponent(searchTerm.value.trim());
        const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=${limit}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        albums.value = data.results;
      } catch (err) {
        error.value = 'Error fetching albums: ' + err.message;
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(fetchAlbums);

    return { albums, sortedAlbums, error, isLoading, searchTerm, lastSearch, sortBy, bigArt, fetchAlbums };
  },
};
</script>

<style>
body { background: #f3f4fa; }
h1 { font-size: 2.6rem; margin-bottom: 0; }
.subtitle { margin-top: 4px; color: #555; }
.nav-wrapper .right { padding-right: 8px; }
.card .card-image img { height: 260px; object-fit: cover; }
.card .card-content { min-height: 200px; }
.card .card-title { font-size: 1.2rem; line-height: 1.4; }
.error {
  color: red;
  font-weight: bold;
}
</style>
