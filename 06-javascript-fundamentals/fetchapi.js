// 2.9. Fetch API - Making Network Requests

console.log('=== Fetch API Basics ===');

// Example 1: Basic Fetch with Async/Await
async function getCharacterData() {
  try {
    console.log('Fetching character data...');
    const response = await fetch('https://anapioficeandfire.com/api/characters/583');

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Character:', data.name);
    console.log('Titles:', data.titles);
  } catch (error) {
    console.error('Error fetching character:', error);
  }
}

getCharacterData();

console.log('---');

// Example 2: Fetching Multiple Characters
console.log('=== Fetching Multiple Characters ===');

async function getMultipleCharacters() {
  try {
    console.log('Fetching multiple characters...');

    // Fetch multiple characters in parallel
    const [char1, char2, char3] = await Promise.all([
      fetch('https://anapioficeandfire.com/api/characters/1').then(r => r.json()),
      fetch('https://anapioficeandfire.com/api/characters/2').then(r => r.json()),
      fetch('https://anapioficeandfire.com/api/characters/3').then(r => r.json())
    ]);

    console.log('Character 1:', char1.name);
    console.log('Character 2:', char2.name);
    console.log('Character 3:', char3.name);
  } catch (error) {
    console.error('Error fetching characters:', error);
  }
}

getMultipleCharacters();

console.log('---');

// Example 3: Fetch with Query Parameters
console.log('=== Fetch with Query Parameters ===');

async function searchBooks() {
  try {
    console.log('Searching for books...');
    const response = await fetch('https://anapioficeandfire.com/api/books?name=A Game of Thrones');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.length > 0) {
      console.log('Found book:', data[0].name);
      console.log('Released:', data[0].released);
    } else {
      console.log('No books found');
    }
  } catch (error) {
    console.error('Error searching books:', error);
  }
}

searchBooks();

console.log('---');

// Example 4: POST Request with Fetch
console.log('=== Fetch POST Request Example ===');

async function createPost() {
  try {
    console.log('Creating a post...');
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'The Battle of Winterfell',
        body: 'A great battle between the living and the dead',
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Post created:', data);
  } catch (error) {
    console.error('Error creating post:', error);
  }
}

createPost();

console.log('---');

// AXIOS ALTERNATIVE (requires: npm install axios)
// Practice: Convert Fetch to Axios
console.log('=== AXIOS Alternative (for reference) ===');

/*
// To use axios, first install it:
// npm install axios

// Example 1: Basic GET request with Axios
const axios = require('axios');

async function getCharacterDataAxios() {
  try {
    console.log('Fetching character data with axios...');
    const response = await axios.get('https://anapioficeandfire.com/api/characters/583');
    const data = response.data;
    console.log('Character:', data.name);
    console.log('Titles:', data.titles);
  } catch (error) {
    console.error('Error fetching character:', error.message);
  }
}

getCharacterDataAxios();

// Example 2: Multiple requests with Axios
async function getMultipleCharactersAxios() {
  try {
    console.log('Fetching multiple characters with axios...');

    const [char1, char2, char3] = await Promise.all([
      axios.get('https://anapioficeandfire.com/api/characters/1'),
      axios.get('https://anapioficeandfire.com/api/characters/2'),
      axios.get('https://anapioficeandfire.com/api/characters/3')
    ]);

    console.log('Character 1:', char1.data.name);
    console.log('Character 2:', char2.data.name);
    console.log('Character 3:', char3.data.name);
  } catch (error) {
    console.error('Error fetching characters:', error.message);
  }
}

getMultipleCharactersAxios();

// Example 3: POST request with Axios
async function createPostAxios() {
  try {
    console.log('Creating a post with axios...');
    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
      title: 'The Battle of Winterfell',
      body: 'A great battle between the living and the dead',
      userId: 1,
    });

    console.log('Post created:', response.data);
  } catch (error) {
    console.error('Error creating post:', error.message);
  }
}

createPostAxios();
*/

/* FETCH vs AXIOS Comparison:

FETCH (Built-in):
- No installation needed
- Returns Response object, must call .json()
- More verbose for complex requests
- Manual error handling for HTTP errors
- Returns native Promise

AXIOS (Third-party library):
- Must install: npm install axios
- Automatically parses JSON (response.data)
- Simpler syntax for complex requests
- Automatic error handling for HTTP errors (throw on 4xx/5xx)
- Allows request/response interceptors
- Better for complex applications

ADVANTAGES OF AXIOS:
✅ Simpler syntax
✅ Automatic JSON transformation
✅ Automatic error handling for HTTP status codes
✅ Request/response interceptors
✅ Request timeout support
✅ Request cancellation

ADVANTAGES OF FETCH:
✅ No dependencies
✅ Native browser API
✅ Works everywhere
✅ Lightweight
*/
