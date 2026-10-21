// 3.1 Express Server - Connecting to File System

// NOTE: Before running this, you need to install express:
// npm install express

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

console.log('🚀 Starting Express server...\n');

// ============================================
// Route 1: Welcome page
// ============================================
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Hogwarts School of Coding!</h1>
    <p>Explore the magical spells:</p>
    <ul>
      <li><a href="/spell">Read the Magic Spell</a></li>
      <li><a href="/json-spell">Get Spell as JSON</a></li>
      <li><a href="/spell-info">Spell Information</a></li>
    </ul>
  `);
});

// ============================================
// Route 2: Serve magic.txt as HTML
// ============================================
app.get('/spell', (req, res) => {
  // Read from file system
  fs.readFile('magic.txt', 'utf-8', (err, data) => {
    if (err) {
      res.status(500).send('Failed to read the spell!');
      console.error('Error reading magic.txt:', err);
    } else {
      res.send(`
        <h1>✨ The Magic Spell ✨</h1>
        <pre style="background: #f0f0f0; padding: 20px; border-radius: 5px;">
${data}
        </pre>
        <a href="/">← Back to Home</a>
      `);
    }
  });
});

// ============================================
// Route 3: Serve magic.txt as JSON
// ============================================
app.get('/json-spell', (req, res) => {
  fs.readFile('magic.txt', 'utf-8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read the spell' });
    } else {
      res.json({
        title: 'The Magic Spell',
        content: data,
        length: data.length,
        lines: data.split('\n').length
      });
    }
  });
});

// ============================================
// Route 4: Spell information
// ============================================
app.get('/spell-info', (req, res) => {
  fs.stat('magic.txt', (err, stats) => {
    if (err) {
      res.status(500).send('File not found!');
    } else {
      res.send(`
        <h1>📖 Spell Information</h1>
        <ul>
          <li><strong>File Name:</strong> magic.txt</li>
          <li><strong>File Size:</strong> ${stats.size} bytes</li>
          <li><strong>Created:</strong> ${stats.birthtime}</li>
          <li><strong>Last Modified:</strong> ${stats.mtime}</li>
        </ul>
        <a href="/">← Back to Home</a>
      `);
    }
  });
});

// ============================================
// Route 5: Using Async/Await (Modern approach)
// ============================================
app.get('/async-spell', async (req, res) => {
  try {
    const data = await fs.promises.readFile('magic.txt', 'utf-8');
    res.send(`
      <h1>✨ Async/Await Spell ✨</h1>
      <pre style="background: #e8f4f8; padding: 20px; border-radius: 5px;">
${data}
      </pre>
      <p><em>This spell was read using async/await!</em></p>
      <a href="/">← Back to Home</a>
    `);
  } catch (error) {
    res.status(500).send('Failed to read the spell: ' + error.message);
  }
});

// ============================================
// Route 6: API endpoint - List all .txt files
// ============================================
app.get('/api/files', (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read directory' });
    } else {
      const txtFiles = files.filter(file => file.endsWith('.txt'));
      res.json({
        message: 'Text files in directory',
        files: txtFiles,
        count: txtFiles.length
      });
    }
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`🌟 Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable routes:`);
  console.log(`  GET /              - Home page`);
  console.log(`  GET /spell         - Read magic.txt as HTML`);
  console.log(`  GET /json-spell    - Get spell as JSON`);
  console.log(`  GET /spell-info    - File information`);
  console.log(`  GET /async-spell   - Read using async/await`);
  console.log(`  GET /api/files     - List all .txt files (API)`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});

/* HOW TO RUN THIS:

1. Make sure express is installed:
   npm install express

2. Make sure magic.txt exists in the same folder

3. Run the server:
   node express_server.js

4. Open your browser and visit:
   http://localhost:3000

5. Click the links to see different routes

KEY CONCEPTS DEMONSTRATED:

✅ FILE SYSTEM INTEGRATION:
   - fs.readFile() - Read file contents
   - fs.stat() - Get file information
   - fs.readdir() - List directory contents

✅ ROUTES:
   - app.get(path, handler) - Define routes
   - (req, res) - Request/Response objects
   - res.send() - Send HTML response
   - res.json() - Send JSON response

✅ ASYNC PATTERNS:
   - Callbacks (fs.readFile with callback)
   - Async/Await (fs.promises.readFile)
   - Error handling

✅ HTTP STATUS CODES:
   - 200 (default) - Success
   - 500 - Server error
   - res.status(500) - Set error status

NEXT STEPS:
- Add middleware (body parser, cors)
- Add POST routes to write files
- Add database integration
- Deploy to Heroku/Railway
*/
