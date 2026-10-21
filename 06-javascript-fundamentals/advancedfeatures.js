// 2.10. Advanced Async Features

console.log('=== ADVANCED ASYNC FEATURES ===\n');

// ============================================
// 1. EVENT EMITTERS
// ============================================

console.log('--- Event Emitters Example ---');

const EventEmitter = require('events');
const emitter = new EventEmitter();

// Listen for custom events
emitter.on('knightArrives', (name) => {
  console.log(`🗡️ ${name} has arrived at Winterfell`);
});

emitter.on('battleStart', (location) => {
  console.log(`⚔️ Battle begins at ${location}!`);
});

// Emit custom events
emitter.emit('knightArrives', 'Brienne of Tarth');
emitter.emit('knightArrives', 'Jaime Lannister');
emitter.emit('battleStart', 'The Trident');

console.log('');

// ============================================
// Example 2: Event Emitter with Data
// ============================================

console.log('--- Event Emitter with Multiple Listeners ---');

const gameEmitter = new EventEmitter();

// Multiple listeners for same event
gameEmitter.on('dragon', (action) => {
  console.log(`🐉 Dragon action: ${action}`);
});

gameEmitter.on('dragon', (action) => {
  console.log(`📣 Alert: ${action}`);
});

gameEmitter.emit('dragon', 'Drogon takes flight!');

console.log('');

// ============================================
// Example 3: Event Emitter - Once Method
// ============================================

console.log('--- Once Method (fires only once) ---');

const throneEmitter = new EventEmitter();

throneEmitter.once('kingCrowned', (name) => {
  console.log(`👑 ${name} has been crowned king!`);
});

throneEmitter.emit('kingCrowned', 'Jon Snow');
throneEmitter.emit('kingCrowned', 'Daenerys'); // This won't trigger the listener

console.log('');

// ============================================
// Example 4: Event Emitter - Remove Listeners
// ============================================

console.log('--- Removing Listeners ---');

const questEmitter = new EventEmitter();

const questHandler = (quest) => {
  console.log(`Quest accepted: ${quest}`);
};

questEmitter.on('questAccepted', questHandler);
questEmitter.emit('questAccepted', 'Slay the dragon');

// Remove the listener
questEmitter.removeListener('questAccepted', questHandler);
questEmitter.emit('questAccepted', 'Save the princess'); // Won't log

console.log('');

// ============================================
// Example 5: Simple Web Worker Simulation
// ============================================

console.log('--- Web Worker Simulation ---');
console.log(`
WEB WORKERS - Offload intensive tasks to separate threads

Main thread (this file) ━━━━━━━━━ Worker thread (separate file)
                        postMessage
                        ─────────>
                        <─────────
                        postMessage

EXAMPLE FILES:
// worker.js
const { parentPort } = require('worker_threads');
parentPort.on('message', (data) => {
  const result = data[0] * data[1];
  parentPort.postMessage(result);
});

// main.js
const { Worker } = require('worker_threads');
const worker = new Worker('./worker.js');
worker.postMessage([10, 2]);
worker.on('message', (result) => {
  console.log('Result:', result); // 20
});

USE CASES:
✅ Heavy calculations (physics, crypto)
✅ Image processing
✅ Data parsing (JSON, CSV)
✅ Database queries
✅ Long-running algorithms
`);

// ============================================
// Example 6: Observable Pattern (without RxJS)
// ============================================

console.log('--- Observable Pattern (Custom Implementation) ---');

class SimpleObservable {
  constructor(subscribe) {
    this.subscribe = subscribe;
  }

  static create(subscribe) {
    return new SimpleObservable(subscribe);
  }
}

// Create an observable that emits values over time
const dragonObservable = SimpleObservable.create((observer) => {
  let count = 0;
  const interval = setInterval(() => {
    count++;
    observer.next(`Dragon ${count} spotted!`);

    if (count === 3) {
      clearInterval(interval);
      observer.complete();
    }
  }, 1000);
});

// Subscribe to the observable
console.log('Subscribing to dragon sightings...');
dragonObservable.subscribe({
  next: (value) => console.log(`📣 ${value}`),
  error: (err) => console.error('Error:', err),
  complete: () => console.log('✅ All dragons spotted!')
});

console.log('');

// ============================================
// Example 7: Observer Pattern
// ============================================

console.log('--- Observer Pattern ---');

class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class BattleObserver {
  constructor(name) {
    this.name = name;
  }

  update(battleNews) {
    console.log(`${this.name} received: ${battleNews}`);
  }
}

const battleSubject = new Subject();
const scout1 = new BattleObserver('Scout 1');
const scout2 = new BattleObserver('Scout 2');

battleSubject.subscribe(scout1);
battleSubject.subscribe(scout2);

battleSubject.notify('Enemy forces approaching from the north!');

console.log('');

// ============================================
// SUMMARY & COMPARISON
// ============================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         ADVANCED ASYNC FEATURES COMPARISON                    ║
╚════════════════════════════════════════════════════════════════╝

1. EVENT EMITTERS (Node.js)
   ─────────────────────────
   Use: Publish-subscribe pattern, event-driven architecture
   Methods: .on(), .once(), .emit(), .removeListener()

   PROS: ✅ Built-in, Simple, Decoupled components
   CONS: ❌ No error handling, Memory leaks if not removed

   BEST FOR: Node.js event handling, custom events

2. WEB WORKERS
   ───────────
   Use: Offload CPU-intensive tasks to background threads
   Methods: postMessage(), new Worker()

   PROS: ✅ True parallelism, Non-blocking UI
   CONS: ❌ Separate file, Serialization overhead, Complex

   BEST FOR: Heavy computations, data processing

3. OBSERVABLES (RxJS)
   ─────────────────
   Use: Handle streams of asynchronous data
   Methods: .subscribe(), .pipe(), .map(), .filter()

   PROS: ✅ Powerful operators, Cancellable, Composable
   CONS: ❌ Requires library, Learning curve

   BEST FOR: Real-time data (WebSockets, events), complex flows

4. PROMISES & ASYNC/AWAIT
   ────────────────────────
   Use: Single async operation with result/error

   PROS: ✅ Native, Simple, Good for single operations
   CONS: ❌ Can't cancel, Multiple callbacks

   BEST FOR: API calls, file operations, simple async tasks

╔════════════════════════════════════════════════════════════════╗
║              WHEN TO USE WHAT?                                ║
╚════════════════════════════════════════════════════════════════╝

Task Type                          | Best Choice
─────────────────────────────────────────────────────
Single API call                    | fetch + async/await
Multiple parallel API calls        | Promise.all() + async/await
Event-driven application           | Event Emitters
Heavy computation                  | Web Workers
Real-time data stream              | Observables (RxJS)
User interactions                  | Event Emitters
Background tasks                   | setTimeout/Web Workers
Cancellable operations             | Observables or AbortController
Error handling chains              | Promises or async/await
`);
