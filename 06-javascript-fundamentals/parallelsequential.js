// 2.8. Parallel vs Sequential Execution with Async/Await

console.log('=== Parallel Execution with Promise.all() ===');

async function prepareForBattle() {
  console.log('Starting battle preparations (parallel)...');
  const startTime = Date.now();

  const getDragons = new Promise((resolve) => {
    setTimeout(resolve, 2000, ['Drogon', 'Rhaegal', 'Viserion']);
  });

  const gatherArmy = new Promise((resolve) => {
    setTimeout(resolve, 3000, 'Unsullied');
  });

  // Both promises run in PARALLEL, not sequentially
  // Total time: 3000ms (longest promise), not 5000ms (sum of both)
  const [dragons, army] = await Promise.all([getDragons, gatherArmy]);

  console.log('Dragons:', dragons);
  console.log('Army:', army);

  const endTime = Date.now();
  console.log(`⏱️ Total time: ${endTime - startTime}ms (Parallel - fastest)`);
}

prepareForBattle();

console.log('---');

// Comparison: Sequential Execution (SLOWER)
console.log('=== Sequential Execution (Slower) ===');

async function prepareForBattleSequential() {
  console.log('Starting battle preparations (sequential)...');
  const startTime = Date.now();

  // First promise
  const getDragons = await new Promise((resolve) => {
    setTimeout(resolve, 2000, ['Drogon', 'Rhaegal', 'Viserion']);
  });
  console.log('Dragons:', getDragons);

  // Second promise - waits for first to complete
  const gatherArmy = await new Promise((resolve) => {
    setTimeout(resolve, 3000, 'Unsullied');
  });
  console.log('Army:', gatherArmy);

  const endTime = Date.now();
  console.log(`⏱️ Total time: ${endTime - startTime}ms (Sequential - slower)`);
}

prepareForBattleSequential();

console.log('---');

// Sequential Execution with for...of loop
console.log('=== Sequential Execution with for...of Loop ===');

async function trainDragons() {
  console.log('Starting dragon training (sequential)...');
  const startTime = Date.now();

  const dragonNames = ['Drogon', 'Rhaegal', 'Viserion'];

  for (const dragon of dragonNames) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`✅ ${dragon} is trained!`);
  }

  const endTime = Date.now();
  console.log(`⏱️ Total time: ${endTime - startTime}ms (3 dragons × 1 second each)`);
}

trainDragons();

console.log('---');

// Practice: Parallel Dragon Training (FASTER)
console.log('=== Practice: Parallel Dragon Training (Faster) ===');

async function trainDragonsParallel() {
  console.log('Starting dragon training (parallel)...');
  const startTime = Date.now();

  const dragonNames = ['Drogon', 'Rhaegal', 'Viserion'];

  // Create all training promises at once
  const trainingPromises = dragonNames.map((dragon) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ ${dragon} is trained!`);
        resolve(dragon);
      }, 1000);
    });
  });

  // Wait for all to complete in parallel
  const trainedDragons = await Promise.all(trainingPromises);

  const endTime = Date.now();
  console.log(`⏱️ Total time: ${endTime - startTime}ms (Parallel - much faster!)`);
  console.log('Trained dragons:', trainedDragons);
}

trainDragonsParallel();

console.log('---');

// Advanced Practice: Mixed Parallel and Sequential
console.log('=== Advanced: Mixed Parallel and Sequential ===');

async function prepareArmy() {
  console.log('Preparing army for battle...');
  const startTime = Date.now();

  try {
    // PARALLEL: Gather all resources at once
    console.log('Phase 1: Gathering resources in parallel...');
    const [weapons, armor, food] = await Promise.all([
      new Promise((resolve) => {
        setTimeout(() => resolve('Weapons assembled'), 2000);
      }),
      new Promise((resolve) => {
        setTimeout(() => resolve('Armor distributed'), 1500);
      }),
      new Promise((resolve) => {
        setTimeout(() => resolve('Food packed'), 2500);
      })
    ]);

    console.log('✅ ' + weapons);
    console.log('✅ ' + armor);
    console.log('✅ ' + food);

    // SEQUENTIAL: Train troops one by one
    console.log('\nPhase 2: Training troops sequentially...');
    const squads = ['Squad A', 'Squad B', 'Squad C'];

    for (const squad of squads) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`✅ ${squad} is ready for battle!`);
    }

    console.log('\n🎉 Army is fully prepared!');
    const endTime = Date.now();
    console.log(`⏱️ Total time: ${endTime - startTime}ms`);
    console.log(`   (2.5s parallel + 3s sequential = ~5.5s total)`);

  } catch (error) {
    console.error('Failed to prepare army:', error);
  }
}

prepareArmy();

/* PERFORMANCE COMPARISON:
Sequential (3 × 1000ms):     3000ms total ⏱️⏱️⏱️
Parallel   (3 × 1000ms):     1000ms total ⏱️ (3x FASTER!)

WHEN TO USE:
- Promise.all() (PARALLEL): Operations are INDEPENDENT, can run together
- for...await...of (SEQUENTIAL): Operations DEPEND on previous results

EXAMPLES:
- PARALLEL: Fetch data from multiple APIs, train multiple dragons
- SEQUENTIAL: Step-by-step recipe, database migrations, logging events in order
*/
