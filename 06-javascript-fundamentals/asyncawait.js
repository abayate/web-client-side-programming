// 2.6. Async/Await - Modern Way to Handle Asynchronous Operations

console.log('=== Async/Await Basics ===');

// async function always returns a Promise
async function fetchDragons() {
  const dragons = new Promise((resolve) => {
    setTimeout(() => resolve(['Drogon', 'Rhaegal', 'Viserion']), 2000);
  });
  const result = await dragons; // await pauses execution until promise resolves
  console.log('Dragons:', result);
}

fetchDragons();

console.log('---');

// Example 2: Multiple await statements
console.log('=== Multiple Await Statements ===');

async function prepareForBattle() {
  console.log('Preparing for battle...');

  // First task: Gather weapons (1 second)
  const weapons = await new Promise((resolve) => {
    setTimeout(() => resolve(['Sword', 'Shield', 'Bow']), 1000);
  });
  console.log('Weapons gathered:', weapons);

  // Second task: Assemble troops (2 seconds)
  const troops = await new Promise((resolve) => {
    setTimeout(() => resolve(['Knights', 'Archers', 'Cavalry']), 2000);
  });
  console.log('Troops assembled:', troops);

  // Third task: Final preparations (1 second)
  const status = await new Promise((resolve) => {
    setTimeout(() => resolve('All forces ready for battle!'), 1000);
  });
  console.log('✅ ' + status);
}

prepareForBattle();

console.log('---');

// Example 3: Error handling with try/catch
console.log('=== Error Handling with Try/Catch ===');

async function attemptToDefeatDragons() {
  try {
    console.log('Attempting to defeat the dragon...');

    const dragonDefeat = new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = false;
        if (success) {
          resolve('Dragon defeated! Victory!');
        } else {
          reject('Dragon is too powerful! We must retreat!');
        }
      }, 2000);
    });

    const result = await dragonDefeat;
    console.log('✅ ' + result);
  } catch (error) {
    console.log('❌ ' + error);
  }
}

attemptToDefeatDragons();

console.log('---');

// Example 4: Parallel await with Promise.all()
console.log('=== Parallel Operations with Async/Await ===');

async function gatherAllResources() {
  console.log('Gathering all resources in parallel...');

  try {
    const food = new Promise((resolve) => {
      setTimeout(() => resolve('Food supplies secured'), 1000);
    });

    const gold = new Promise((resolve) => {
      setTimeout(() => resolve('Gold treasury filled'), 1500);
    });

    const horses = new Promise((resolve) => {
      setTimeout(() => resolve('Horses saddled'), 2000);
    });

    // Wait for all promises in parallel
    const [foodStatus, goldStatus, horsesStatus] = await Promise.all([food, gold, horses]);

    console.log('🥖 ' + foodStatus);
    console.log('💰 ' + goldStatus);
    console.log('🐴 ' + horsesStatus);
    console.log('All resources ready!');
  } catch (error) {
    console.error('Failed to gather resources:', error);
  }
}

gatherAllResources();

console.log('---');

// Example 5: async function with return value
console.log('=== Async Function with Return Value ===');

async function buildArmy() {
  const recruits = await new Promise((resolve) => {
    setTimeout(() => resolve(5000), 1000);
  });

  const veterans = await new Promise((resolve) => {
    setTimeout(() => resolve(2000), 1000);
  });

  const totalSoldiers = recruits + veterans;
  return totalSoldiers;
}

// Calling async function and using .then() to get the result
buildArmy().then((total) => {
  console.log(`Total army size: ${total} soldiers`);
});

console.log('---');

// Example 6: Using async/await with .then()
console.log('=== Combining Async/Await with .then() ===');

async function summitTheKing() {
  const message = await new Promise((resolve) => {
    setTimeout(() => resolve('The King has arrived!'), 1500);
  });
  return message;
}

summitTheKing()
  .then((message) => {
    console.log('📣 ' + message);
    return 'Prepare the throne room!';
  })
  .then((instruction) => {
    console.log('📣 ' + instruction);
  });

/* KEY POINTS ON ASYNC/AWAIT:
- async function always returns a Promise
- await pauses execution until the Promise resolves
- Makes asynchronous code look synchronous and easier to read
- Must use try/catch for error handling (instead of .catch())
- Can combine with Promise.all() for parallel operations
- Can still use .then() on async functions since they return Promises
- Cleaner and more readable than Promise chains for complex logic
*/
