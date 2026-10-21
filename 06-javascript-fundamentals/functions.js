function greet(name) {
  return `Hello, ${name}!`;
}
const message = greet("Frodo"); // message will be "Hello, Frodo!" right-click.
console.log(message)

function countTrolls(numberOfTrolls) {
  return `There are ${numberOfTrolls} trolls in Mordor.`;
}

const trollResult = countTrolls(3);
console.log(trollResult);

function reverseName(name) {
  return name.split('').reverse().join('');
}

const reversedName = reverseName("Gandalf");
console.log(reversedName);

const greet2 = function(name) {
    return `Hello, ${name}!`;
};
const message2 = greet2("Gandalf")
console.log(message2);

const defeatOrcs = function(numberOfOrcs, numberOfElves) {
  if (numberOfElves * 1.5 > numberOfOrcs) {
    return `Yes! ${numberOfElves} elves can defeat ${numberOfOrcs} orcs.`;
  } else {
    return `No! ${numberOfElves} elves cannot defeat ${numberOfOrcs} orcs.`;
  }
};

const battleResult = defeatOrcs(500, 300);
console.log(battleResult);

const isRingBearer = function(characterName) {
  return characterName === "Frodo" || characterName === "Sam";
};

const isFreatABearer = isRingBearer("Frodo");
const isSamBearer = isRingBearer("Sam");
const isGandalfBearer = isRingBearer("Gandalf");

console.log(`Is Frodo a ring bearer? ${isFreatABearer}`);
console.log(`Is Sam a ring bearer? ${isSamBearer}`);
console.log(`Is Gandalf a ring bearer? ${isGandalfBearer}`);

// Arrow Functions
// Single parameter, single expression:
const bye = name => `Bye-bye, ${name}!`;
console.log(bye("Frodo"));

// Multiple parameters:
const add = (a, b) => a + b;
console.log(add(1, 2));

// No parameters:
const getRingBearer = () => "Frodo Baggins";
console.log(getRingBearer());

// Multiple statements:
const battle = (warrior, weapon) => {
  console.log(`${warrior} wields a ${weapon}.`);
  return `${warrior} fights bravely!`;
};
console.log(battle("Aragorn", "sword"));

// Constructor Functions
function Elf(name, weapon) {
  this.name = name;
  this.weapon = weapon;
  this.describe = function() {
    console.log(`${this.name} wields a ${this.weapon}.`);
  };
}

const legolas = new Elf("Legolas", "bow and arrow");
const tauriel = new Elf("Tauriel", "dagger");

legolas.describe();
tauriel.describe();

// Practice: Convert Traditional Function to Arrow Function
const travelTo = location => `Traveling to ${location}`;
console.log(travelTo("Mordor"));

// Practice: Write an arrow function to double each element in an array
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(num => num * 2);
console.log("Doubled numbers:", doubled);

// Practice: Write an arrow function to filter out even numbers
const numbers2 = [1, 2, 3, 4, 5, 6];
const oddNumbers = numbers2.filter(num => num % 2 !== 0);
console.log("Odd numbers:", oddNumbers);

// Practice: Write an arrow function that takes an array of names and prints each name with Fellowship message
const fellowshipMembers = ["Frodo", "Sam", "Merry", "Pippin"];
const printFellowship = members => {
  members.forEach(member => {
    console.log(`${member} is part of the Fellowship.`);
  });
};
printFellowship(fellowshipMembers);

// Default Parameters
function greet_default(name = "Stranger") {
  return `Hello, ${name}!`;
}
console.log(greet_default());
console.log(greet_default("Frodo"));

// Practice: Write a function named describeBattle with default parameter
function describeBattle(location, enemies = "orcs") {
  return `A fierce battle is taking place in ${location} against ${enemies}!`;
}

console.log(describeBattle("Moria"));
console.log(describeBattle("Helm's Deep", "Saruman's forces"));
console.log(describeBattle("Mount Doom", "the forces of darkness"));

// Destructuring
// Array destructuring example:
const [a, b] = [1, 2];
console.log(a); // 1
console.log(b); // 2

// Object destructuring practice:
const battleData = {
  location: "Minas Tirith",
  participants: 10000,
  leader: "Aragorn",
  outcome: "Victory",
  details: {
    duration: "3 hours",
    casualties: 2000
  },
  forces: {
    army: "Men of Gondor",
    allies: "Rohirrim"
  }
};

const {
  location,
  participants,
  leader,
  outcome,
  details: { duration, casualties },
  forces: { army, allies }
} = battleData;

console.log(`The battle at ${location} had ${participants} participants led by ${leader}.`);
console.log(`Outcome: ${outcome}. Duration: ${duration}. Casualties: ${casualties}.`);
console.log(`Forces: ${army} and ${allies}.`);
