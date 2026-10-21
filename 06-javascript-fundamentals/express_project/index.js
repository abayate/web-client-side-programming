// 3.2. Express Framework - Voldemort Website
// Main Server File

const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

console.log('🖤 Initializing Voldemort Website Server...\n');

// Route for home page
app.get('/', (req, res) => {
  console.log('📄 GET / - Home page requested');
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route for about page
app.get('/about', (req, res) => {
  console.log('📄 GET /about - About page requested');
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route for history page
app.get('/history', (req, res) => {
  console.log('📄 GET /history - History page requested');
  res.sendFile(path.join(__dirname, 'views', 'history.html'));
});

// Route for achievements page
app.get('/achievements', (req, res) => {
  console.log('📄 GET /achievements - Achievements page requested');
  res.sendFile(path.join(__dirname, 'views', 'achievements.html'));
});

// API Route: Get Voldemort facts as JSON
app.get('/api/facts', (req, res) => {
  const facts = [
    'Lord Voldemort was born as Tom Marvolo Riddle',
    'He created seven Horcruxes to achieve immortality',
    'His fear of death led to his dark path',
    'He ruled through fear and deception',
    'He was ultimately defeated by love and sacrifice'
  ];
  res.json({ facts: facts, count: facts.length });
});

// Catch-all route for 404 - Page Not Found
app.get('*', (req, res) => {
  console.log(`⚠️  404 - Path "${req.path}" not found`);
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err);
  res.status(500).send('<h1>500 - Internal Server Error</h1>');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🖤 VOLDEMORT WEBSITE SERVER RUNNING 🖤   ║
╚════════════════════════════════════════════╝

🌐 Server: http://localhost:${PORT}

📍 Available Routes:
   GET /              → Home
   GET /about         → About Voldemort
   GET /history       → History
   GET /achievements  → Achievements
   GET /api/facts     → Voldemort Facts (JSON API)

💾 Static Files:
   /css/styles.css    → Styling
   /js/scripts.js     → Client-side JavaScript

⚠️  Press Ctrl+C to stop the server
  `);
});

module.exports = app;
