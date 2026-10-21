import { LitElement, html, css } from 'lit';

// The lab used the Tenor v1 GIF API, which now answers
// 403 "Tenor API is discontinued". DummyJSON is a free, keyless API with
// fashion products and photos, so the component shows those instead.
const API = 'https://dummyjson.com/products/category';
const CATEGORIES = {
  'womens-dresses': 'Dresses',
  'tops': 'Tops',
  'mens-shirts': 'Shirts',
  'womens-shoes': 'Women\'s Shoes',
  'mens-shoes': 'Men\'s Shoes',
  'sunglasses': 'Sunglasses',
};

class GifList extends LitElement {
  static styles = css`
    :host { display: block; max-width: 1100px; margin: 0 auto; padding: 0 16px 32px; }
    header { background: #be185d; color: white; padding: 20px 24px; border-radius: 0 0 12px 12px; }
    header h1 { margin: 0; font-size: 2rem; }
    header p { margin: 4px 0 0; opacity: .9; }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
    .tabs button {
      border: 1px solid #be185d; background: white; color: #be185d;
      padding: 6px 14px; border-radius: 999px; cursor: pointer; font: inherit;
    }
    .tabs button[aria-pressed='true'] { background: #be185d; color: white; }
    ul {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
    }
    li {
      margin: 10px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      width: calc(33.333% - 20px);
      box-sizing: border-box;
      background: white;
      transition: transform .15s, box-shadow .15s;
    }
    li:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.12); }
    @media (max-width: 700px) { li { width: calc(100% - 20px); } }
    img {
      max-width: 100%;
      height: 220px;
      width: 100%;
      object-fit: contain;
      border-radius: 5px;
      background: #fafafa;
    }
    .title { font-weight: 600; margin: 8px 0 4px; }
    .meta { display: flex; justify-content: space-between; color: #555; font-size: .9rem; }
    .price { color: #be185d; font-weight: 700; }
    .status { padding: 20px; color: #555; }
    .error { color: #b91c1c; font-weight: bold; }
  `;

  static properties = {
    owner: { type: String },
    items: { type: Array },
    category: { type: String },
    loading: { type: Boolean },
    error: { type: String },
  };

  constructor() {
    super();
    this.owner = '';
    this.items = [];
    this.category = 'womens-dresses';
    this.loading = false;
    this.error = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  async fetchData() {
    this.loading = true;
    this.error = '';
    try {
      const response = await fetch(`${API}/${this.category}?limit=9`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data (HTTP ${response.status})`);
      }
      const data = await response.json();
      this.items = data.products;
    } catch (error) {
      console.error('Error fetching data:', error);
      this.error = error.message;
      this.items = [];
    } finally {
      this.loading = false;
    }
  }

  selectCategory(category) {
    this.category = category;
    this.fetchData();
  }

  render() {
    return html`
      <header>
        <h1>Fashion Finds</h1>
        <p>A Lit web component by ${this.owner}</p>
      </header>

      <div class="tabs">
        ${Object.entries(CATEGORIES).map(([key, label]) => html`
          <button aria-pressed=${key === this.category} @click=${() => this.selectCategory(key)}>
            ${label}
          </button>
        `)}
      </div>

      ${this.loading ? html`<p class="status">Loading...</p>` : ''}
      ${this.error ? html`<p class="status error">${this.error}</p>` : ''}

      <ul>
        ${this.items.map(item => html`
          <li>
            <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
            <p class="title">${item.title}</p>
            <div class="meta">
              <span class="price">$${item.price}</span>
              <span>&#9733; ${item.rating}</span>
            </div>
          </li>
        `)}
      </ul>
    `;
  }
}

customElements.define('gif-list', GifList);
