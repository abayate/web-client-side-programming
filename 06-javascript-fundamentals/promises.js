// 2.3 Promises - Handling Asynchronous Operations

console.log('=== Promise Basics ===');

// Creating a Promise
const feastPromise = new Promise((resolve, reject) => {
  let isFeastReady = true;

  if (isFeastReady) {
    resolve('The feast is ready! Enjoy the meal.');
  } else {
    reject('The feast is not ready yet. Please wait.');
  }
});

// Consuming the Promise with .then() and .catch()
feastPromise
  .then(message => {
    console.log(message); // This will run if the promise is resolved
  })
  .catch(error => {
    console.log(error); // This will run if the promise is rejected
  });

console.log('---');

// Practice Example 1: Quest Promise (resolved)
console.log('=== Quest Simulation ===');
const questPromise = new Promise((resolve, reject) => {
  const questCompleted = true;

  setTimeout(() => {
    if (questCompleted) {
      resolve('Quest completed! You have slain the dragon and rescued the princess!');
    } else {
      reject('Quest failed! You were defeated by the dragon.');
    }
  }, 2000);
});

questPromise
  .then(success => {
    console.log('✅ ' + success);
  })
  .catch(failure => {
    console.log('❌ ' + failure);
  });

console.log('---');

// Practice Example 2: Battle Promise (rejected)
console.log('=== Battle Simulation ===');
const battlePromise = new Promise((resolve, reject) => {
  const didWin = false;

  setTimeout(() => {
    if (didWin) {
      resolve('We won the battle! Victory is ours!');
    } else {
      reject('We lost the battle. We must retreat!');
    }
  }, 3000);
});

battlePromise
  .then(victory => {
    console.log('🏆 ' + victory);
  })
  .catch(defeat => {
    console.log('⚔️ ' + defeat);
  });

console.log('---');

// Practice Example 3: Chaining Promises
console.log('=== Chaining Promises ===');
const trainPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Training begins!');
  }, 1000);
});

trainPromise
  .then(message => {
    console.log(message);
    return 'Skills improved!';
  })
  .then(nextMessage => {
    console.log(nextMessage);
    return 'You are ready for battle!';
  })
  .then(finalMessage => {
    console.log(finalMessage);
  })
  .catch(error => {
    console.log('Training failed: ' + error);
  });

console.log('---');

// Practice Example: Dragons Promise (Resolved)
console.log('=== Dragons Promise ===');
const getDragons = new Promise((resolve, reject) => {
  setTimeout(() => {
    const dragons = ['Drogon', 'Rhaegal', 'Viserion'];
    resolve(dragons);
  }, 2000);
});

getDragons
  .then((dragons) => {
    console.log('Daenerys has dragons:', dragons);
  })
  .catch((error) => {
    console.error('Failed to get dragons:', error);
  });

console.log('---');

// Practice: Change to false (Rejected with catch block)
console.log('=== Dragons Promise - Rejected with Catch ===');
const getDragonsRejected = new Promise((resolve, reject) => {
  setTimeout(() => {
    const hasDragons = false;
    if (hasDragons) {
      const dragons = ['Drogon', 'Rhaegal', 'Viserion'];
      resolve(dragons);
    } else {
      reject('Dragons were lost in the war!');
    }
  }, 2000);
});

getDragonsRejected
  .then((dragons) => {
    console.log('Daenerys has dragons:', dragons);
  })
  .catch((error) => {
    console.error('Failed to get dragons:', error);
  });

console.log('---');

// Practice: Rejected Promise without Catch Block
console.log('=== Dragons Promise - Rejected without Catch (Unhandled) ===');
const getDragonsUnhandled = new Promise((resolve, reject) => {
  setTimeout(() => {
    const hasDragons = false;
    if (hasDragons) {
      const dragons = ['Drogon', 'Rhaegal', 'Viserion'];
      resolve(dragons);
    } else {
      reject('Dragons were lost in the war!');
    }
  }, 2000);
});

getDragonsUnhandled
  .then((dragons) => {
    console.log('Daenerys has dragons:', dragons);
  });

/* FINDINGS:
- Original getDragons (resolved): Resolves after 2 seconds and logs dragons array
- getDragonsRejected: Rejects with error message, caught by .catch() block - logs error
- getDragonsUnhandled: Rejects but NO .catch() block - causes UnhandledPromiseRejectionWarning
- IMPORTANT: Always include .catch() to handle potential rejections!
*/
