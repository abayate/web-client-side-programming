const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'express', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'history.html'));
});

app.get('/achievement', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'achievement.html'));
});

app.get('/achievements', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'achievement.html'));
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Express server is active' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});