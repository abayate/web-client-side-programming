// 3.1 Introduction to Node.js - Non-blocking I/O

const fs = require('fs');

console.log("Starting the spell...");

// Non-blocking I/O - readFile with callback
// This operation happens asynchronously
fs.readFile('magic.txt', (err, data) => {
  if (err) {
    console.log("Failed to read the spell");
  } else {
    console.log("Spell content: " + data.toString());
  }
});

console.log("Ready for the next spell!");

console.log('---');

// Another example: Reading multiple files
console.log('\n=== Reading Multiple Files ===');

fs.readFile('magic.txt', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
  } else {
    console.log('File content length:', data.toString().length, 'characters');
  }
});

// This runs immediately, doesn't wait for file read
console.log('File read initiated...');

console.log('---');

// Synchronous vs Asynchronous
console.log('\n=== Synchronous vs Asynchronous ===');

console.log('Asynchronous (non-blocking):');
fs.readFile('magic.txt', (err, data) => {
  if (!err) {
    console.log('✅ File read complete (asynchronous)');
  }
});
console.log('✅ Code continues without waiting');

// Synchronous (blocking) - not recommended for large files
// console.log('\nSynchronous (blocking):');
// const data = fs.readFileSync('magic.txt');
// console.log('✅ File read complete (synchronous)');
// Note: This blocks all code execution until file is read

console.log('---');

// Using Promises with fs
console.log('\n=== Using fs.promises (Async/Await) ===');

const fsPromises = require('fs').promises;

async function readSpell() {
  try {
    const data = await fsPromises.readFile('magic.txt', 'utf-8');
    console.log('Spell content (with async/await):');
    console.log(data);
  } catch (error) {
    console.error('Error reading spell:', error);
  }
}

readSpell();

console.log('---');

// Writing to files
console.log('\n=== Writing to Files ===');

const spellContent = `
A powerful spell for Node.js mastery:
"Nodes of JavaScript, gather round,
Asynchronous power, unbound!
With callbacks and promises true,
Non-blocking I/O will see us through!"

May your code be swift and your servers scalable.
`;

fs.writeFile('written_spell.txt', spellContent, (err) => {
  if (err) {
    console.error('Failed to write spell:', err);
  } else {
    console.log('✅ Spell written to written_spell.txt');
  }
});

/* KEY CONCEPTS:

EVENT-DRIVEN ARCHITECTURE:
- Node.js is built on events and callbacks
- When an event occurs, a callback function is triggered
- Allows handling multiple requests without blocking

NON-BLOCKING I/O:
- fs.readFile() starts reading the file but doesn't wait
- Code continues to next line immediately
- When file is done reading, callback is invoked
- This is why Node.js can handle many requests efficiently

CALLBACK vs PROMISES vs ASYNC/AWAIT:
1. Callbacks (original):
   fs.readFile('file.txt', (err, data) => {})

2. Promises (better):
   fsPromises.readFile('file.txt')
     .then(data => {})
     .catch(err => {})

3. Async/Await (best):
   const data = await fsPromises.readFile('file.txt')

BENEFITS OF NON-BLOCKING I/O:
✅ Can handle thousands of concurrent connections
✅ CPU time not wasted waiting for I/O
✅ Single-threaded model is simpler than thread pools
✅ Better performance for I/O-heavy applications
*/
