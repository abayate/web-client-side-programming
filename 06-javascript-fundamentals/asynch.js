// Part 2: Intro to Asynchronous JS
// 2.1 Fundamentals of Asynchronicity

// Synchronous code - runs sequentially, blocking execution
console.log('Jon Snow arrives at the Wall.');
console.log('He takes the black.');
console.log('He joins the Night\'s Watch.');

console.log('---');

// Asynchronous code - operations run concurrently without blocking
console.log('Daenerys starts hatching her dragon eggs.');
setTimeout(() => {
  console.log('Dragon egg hatched!');
}, 2000);
console.log('Daenerys plans her next battle.');

console.log('---');

// Practice: Change timeout values to 3, 4, and 0 seconds

// Test with 3 seconds:
console.log('Test 1 - 3 second delay:');
console.log('Starting process...');
setTimeout(() => {
  console.log('Task completed after 3 seconds!');
}, 3000);
console.log('Process initiated (non-blocking).');

console.log('---');

// Test with 4 seconds:
console.log('Test 2 - 4 second delay:');
console.log('Starting long process...');
setTimeout(() => {
  console.log('Task completed after 4 seconds!');
}, 4000);
console.log('Long process initiated (non-blocking).');

console.log('---');

// Test with 0 seconds:
console.log('Test 3 - 0 second delay:');
console.log('Starting instant process...');
setTimeout(() => {
  console.log('Task completed after 0 seconds!');
}, 0);
console.log('Instant process initiated (non-blocking).');

/* FINDINGS:
- Jon Snow, He takes the black, He joins the Night's Watch execute immediately (synchronous)
- Daenerys starts..., Daenerys plans... execute immediately, then after 2 seconds the dragon egg hatches
- This shows async doesn't block: "plans her next battle" prints BEFORE "Dragon egg hatched!"
- With 0ms timeout: Even with 0 delay, the callback is still placed in the event queue and runs AFTER synchronous code
- Larger timeouts (3, 4 seconds) cause longer waits before the callback executes
- Key insight: setTimeout with 0ms doesn't run immediately - it defers execution to after the call stack is clear
*/
