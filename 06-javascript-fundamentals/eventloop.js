// 2.2 Event Loop - Demonstrating Call Stack, Web APIs, and Callback Queue

console.log('=== Event Loop Demonstration ===');
console.log('Jon Snow starts his watch.');
setTimeout(() => {
  console.log('Jon Snow spots a White Walker.');
}, 3000);
console.log('Jon Snow patrols the Wall.');

console.log('---');

/*
Event Loop Explanation:
1. 'Jon Snow starts his watch.' - pushed to call stack, executed, popped
2. setTimeout is called - handed off to Web API, not on call stack
3. 'Jon Snow patrols the Wall.' - pushed to call stack, executed, popped
4. After 3 seconds, Web API puts callback in Callback Queue
5. Event loop sees call stack is empty, moves callback from queue to stack
6. 'Jon Snow spots a White Walker.' executes
*/

console.log('=== Winterfell Grand Feast Simulation ===');

// List of guests
const guests = ['Stark', 'Lannister', 'Targaryen'];

// 1. Synchronously log a welcome message for each guest
console.log('Welcome to the Winterfell Grand Feast!');
guests.forEach(guest => {
  console.log(`Welcome, House ${guest}!`);
});

// 2. Asynchronously serve drinks after a short delay
setTimeout(() => {
  console.log('🍷 Drinks are being served to all guests!');
}, 1000);

// 3. Announce the start of the entertainment program synchronously
console.log('--- Entertainment Program Starting ---');

// 4. Asynchronously announce the start of the feast after a short delay
setTimeout(() => {
  console.log('🍽️ The grand feast begins! Please enjoy the food!');
}, 2000);

// 5. Asynchronously perform three different acts at different times
setTimeout(() => {
  console.log('🤹 The juggler takes the stage and performs amazing tricks!');
}, 3000);

setTimeout(() => {
  console.log('🎤 The singer performs a beautiful ballad about dragons and kingdoms!');
}, 5000);

setTimeout(() => {
  console.log('💃 The dancers take the floor with an elegant performance!');
}, 7000);

// 6. Synchronously thank the guests for attending
console.log('Thank you all for attending the Winterfell Grand Feast!');
console.log('We hope you enjoyed the evening!');
