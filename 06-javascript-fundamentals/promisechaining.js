// 2.4 Promise Chaining - Multiple Asynchronous Operations in Sequence

console.log('=== Battle of Winterfell - Promise.all() Example ===');

const getDragons = new Promise((resolve, reject) => {
  setTimeout(() => {
    const dragons = ['Drogon', 'Rhaegal', 'Viserion'];
    resolve(dragons);
  }, 2000);
});

const prepareArmy = new Promise((resolve, reject) => {
  setTimeout(() => {
    const army = ['Unsullied', 'Dothraki', 'Northmen'];
    resolve(army);
  }, 3000);
});

const forgeWeapons = new Promise((resolve, reject) => {
  setTimeout(() => {
    const weapons = ['Valyrian Steel Swords', 'Dragonglass Arrows'];
    resolve(weapons);
  }, 4000);
});

console.log('Preparing for the Battle of Winterfell...');

Promise.all([getDragons, prepareArmy, forgeWeapons])
  .then((results) => {
    const [dragons, army, weapons] = results;
    console.log('Daenerys has dragons:', dragons);
    console.log('Jon Snow has gathered the army:', army);
    console.log('Weapons are ready:', weapons);
    return 'Battle of Winterfell';
  })
  .then((battle) => {
    console.log('Next event:', battle);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

console.log('---');

// Practice: Magical Gathering Simulation
console.log('=== Magical Gathering Preparation ===');

// 1. Gather magical ingredients (2 seconds)
const gatherIngredients = new Promise((resolve, reject) => {
  setTimeout(() => {
    const ingredients = ['Dragon Scale', 'Phoenix Feather', 'Unicorn Horn', 'Moonstone'];
    resolve(ingredients);
  }, 2000);
});

// 2. Prepare enchanted hall (3 seconds)
const prepareHall = new Promise((resolve, reject) => {
  setTimeout(() => {
    const confirmation = 'Enchanted hall is prepared with protective wards and magical decorations!';
    resolve(confirmation);
  }, 3000);
});

// 3. Brew the potions (4 seconds)
const brewPotions = new Promise((resolve, reject) => {
  setTimeout(() => {
    const potions = ['Elixir of Wisdom', 'Potion of Courage', 'Healing Draught', 'Invisibility Brew'];
    resolve(potions);
  }, 4000);
});

// 4. Send magical invitations (2 seconds)
const sendInvitations = new Promise((resolve, reject) => {
  setTimeout(() => {
    const wizards = ['Gandalf', 'Merlin', 'Albus Dumbledore', 'Hermione Granger'];
    resolve(wizards);
  }, 2000);
});

console.log('Preparing the magical gathering...');

Promise.all([gatherIngredients, prepareHall, brewPotions, sendInvitations])
  .then((results) => {
    const [ingredients, hall, potions, wizards] = results;
    console.log('✨ Ingredients gathered:', ingredients);
    console.log('🏰 ' + hall);
    console.log('🧪 Potions brewed:', potions);
    console.log('📜 Invitations sent to:', wizards);
    return 'All preparations complete! The gathering begins!';
  })
  .then((message) => {
    console.log('🎉 ' + message);
  })
  .catch((error) => {
    console.error('Preparation failed:', error);
  });

console.log('---');

// Bonus: Promise Chaining Example
console.log('=== Sequential Quest - Promise Chaining ===');

const startQuest = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Quest has started!');
  }, 1000);
});

startQuest
  .then((message) => {
    console.log(message);
    return 'Traveling to the enchanted forest...';
  })
  .then((message) => {
    console.log(message);
    return 'Found the ancient artifact!';
  })
  .then((message) => {
    console.log(message);
    return 'Returning to the kingdom...';
  })
  .then((message) => {
    console.log(message);
    return 'Quest complete! Victory!';
  })
  .then((message) => {
    console.log('✅ ' + message);
  })
  .catch((error) => {
    console.error('Quest failed:', error);
  });

/* NOTES on Promise.all():
- Waits for ALL promises to complete
- Resolves when all promises resolve
- Rejects if ANY promise rejects
- Returns results in same order as input array
- Perfect for parallel operations that all need to complete
*/

console.log('===');
console.log('=== Promise API - Promise.all() with resolve() ===');

// Using Promise.resolve() - directly returns a resolved promise
const promise1 = Promise.resolve('Winter is Coming');
const promise2 = Promise.resolve('The North Remembers');
const promise3 = Promise.resolve('Valar Morghulis');

Promise.all([promise1, promise2, promise3])
  .then((messages) => {
    console.log('Messages:', messages);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

console.log('---');
console.log('=== Promise API - Promise.race() ===');

// Promise.race() - returns the FIRST promise to complete
const racePromise1 = new Promise((resolve) => setTimeout(resolve, 500, 'Arya Stark'));
const racePromise2 = new Promise((resolve) => setTimeout(resolve, 1000, 'Sansa Stark'));

Promise.race([racePromise1, racePromise2])
  .then((winner) => {
    console.log('First to complete:', winner);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

console.log('---');

// Practice: Promise.race() with different scenarios
console.log('=== Practice: Race Between Warriors ===');

const aragornReady = new Promise((resolve) => {
  setTimeout(() => resolve('Aragorn is ready! ⚔️'), 2000);
});

const gimliReady = new Promise((resolve) => {
  setTimeout(() => resolve('Gimli is ready! 🪓'), 1500);
});

const legolasReady = new Promise((resolve) => {
  setTimeout(() => resolve('Legolas is ready! 🏹'), 2500);
});

Promise.race([aragornReady, gimliReady, legolasReady])
  .then((firstReady) => {
    console.log('First warrior ready:', firstReady);
    return 'Battle can begin!';
  })
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

/* NOTES on Promise API:
- Promise.all(): Waits for ALL promises to complete. If ANY rejects, the whole thing rejects.
- Promise.race(): Returns the FIRST promise to settle (resolve or reject). Ignores others.
- Promise.resolve(value): Immediately returns a resolved promise with the value.
- Promise.reject(reason): Immediately returns a rejected promise with the reason.
*/
