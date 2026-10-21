// 2.7. Error Handling - Try/Catch with Async/Await

console.log('=== Basic Error Handling Example ===');

async function fetchDragons() {
  try {
    const dragons = new Promise((resolve, reject) => {
      setTimeout(() => reject('Dragons not found'), 2000);
    });
    const result = await dragons;
    console.log('Dragons:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchDragons();

console.log('---');

// Practice 1: Preparing for the Quidditch Match
console.log('=== Practice 1: Preparing for Quidditch Match ===');

async function prepareQuidditchMatch() {
  try {
    // Step 1: Set up the pitch (1 second)
    const pitchSetup = new Promise((resolve) => {
      setTimeout(() => resolve('Quidditch pitch is set up.'), 1000);
    });
    console.log(await pitchSetup);

    // Step 2: Gather broomsticks (2 seconds) - WILL REJECT
    const broomsticks = new Promise((resolve, reject) => {
      setTimeout(() => reject('Broomsticks are missing!'), 2000);
    });
    console.log(await broomsticks);

    // Step 3: Prepare Golden Snitch (3 seconds) - WON'T REACH HERE IF STEP 2 FAILS
    const goldenSnitch = new Promise((resolve) => {
      setTimeout(() => resolve('Golden Snitch is ready.'), 3000);
    });
    console.log(await goldenSnitch);

    console.log('✅ Quidditch match is ready to begin!');
  } catch (error) {
    console.error('❌ Match preparation failed:', error);
    console.log('Attempting to reschedule the match...');
  }
}

prepareQuidditchMatch();

console.log('---');

// Practice 1B: Quidditch Match - ALL SUCCESS (no errors)
console.log('=== Practice 1B: Quidditch Match (Successful) ===');

async function prepareQuidditchMatchSuccess() {
  try {
    // Step 1: Set up the pitch (1 second)
    const pitchSetup = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Quidditch pitch is set up.'), 1000);
    });
    console.log(await pitchSetup);

    // Step 2: Gather broomsticks (2 seconds)
    const broomsticks = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Broomsticks are gathered.'), 2000);
    });
    console.log(await broomsticks);

    // Step 3: Prepare Golden Snitch (3 seconds)
    const goldenSnitch = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Golden Snitch is ready.'), 3000);
    });
    console.log(await goldenSnitch);

    console.log('🎉 Quidditch match is ready to begin!');
  } catch (error) {
    console.error('❌ Match preparation failed:', error);
  }
}

prepareQuidditchMatchSuccess();

console.log('---');

// Practice 2: Preparing Potions for the Feast
console.log('=== Practice 2: Preparing Potions for the Feast ===');

async function prepareFeastPotions() {
  try {
    // Step 1: Brew Felix Felicis (2 seconds)
    const felixFelicis = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Felix Felicis is brewed.'), 2000);
    });
    console.log(await felixFelicis);

    // Step 2: Prepare Polyjuice Potion (3 seconds) - WILL REJECT
    const polyjuicePotion = new Promise((resolve, reject) => {
      setTimeout(() => reject('Polyjuice Potion ingredients are missing!'), 3000);
    });
    console.log(await polyjuicePotion);

    // Step 3: Create Amortentia (1 second) - WON'T REACH HERE IF STEP 2 FAILS
    const amortentia = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Amortentia is created.'), 1000);
    });
    console.log(await amortentia);

    console.log('🎉 All potions are ready for the feast!');
  } catch (error) {
    console.error('❌ Potion preparation failed:', error);
    console.log('Sending a house-elf to find the missing ingredients...');
  }
}

prepareFeastPotions();

console.log('---');

// Practice 2B: Preparing Potions - ALL SUCCESS (no errors)
console.log('=== Practice 2B: Preparing Potions (Successful) ===');

async function prepareFeastPotionsSuccess() {
  try {
    // Step 1: Brew Felix Felicis (2 seconds)
    const felixFelicis = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Felix Felicis is brewed.'), 2000);
    });
    console.log(await felixFelicis);

    // Step 2: Prepare Polyjuice Potion (3 seconds)
    const polyjuicePotion = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Polyjuice Potion is prepared.'), 3000);
    });
    console.log(await polyjuicePotion);

    // Step 3: Create Amortentia (1 second)
    const amortentia = new Promise((resolve) => {
      setTimeout(() => resolve('✅ Amortentia is created.'), 1000);
    });
    console.log(await amortentia);

    console.log('🎉 All potions are ready for the feast!');
  } catch (error) {
    console.error('❌ Potion preparation failed:', error);
  }
}

prepareFeastPotionsSuccess();

console.log('---');

// Bonus: Multiple Errors with Finally Block
console.log('=== Bonus: Using Finally Block ===');

async function brewWithFinally() {
  try {
    console.log('Starting to brew potion...');

    const potion = new Promise((resolve, reject) => {
      setTimeout(() => reject('Cauldron overheated!'), 1500);
    });

    const result = await potion;
    console.log('Potion brewed successfully:', result);
  } catch (error) {
    console.error('Brewing failed:', error);
  } finally {
    console.log('Cleaning up the potions lab...');
  }
}

brewWithFinally();

/* KEY POINTS ON ERROR HANDLING:
- try block: Code that might throw an error
- catch block: Handles the error when a promise rejects
- finally block: Runs regardless of success or failure (cleanup code)
- If a promise rejects in the try block, execution stops and jumps to catch
- Use try/catch for cleaner error handling than .catch() chains
- Always handle potential errors in async functions
*/
