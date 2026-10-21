// Lab 5, Section 6, Part 4: THE CAPSTONE CHALLENGE - Recipe Agent.
// Anthony Bayate - TECH*3500*01
//
// Requirement: an agent that, asked "What do I need to make Spaghetti Carbonara?",
// uses a custom get_recipe_ingredients tool to list the ingredients.
//
// The handout asks for a simple if/else on dishName. I kept that exact behaviour as the
// contract (unknown dish -> the required "Sorry, I don't know the recipe for that dish."),
// but backed it with a small lookup table and case-insensitive matching, because the
// literal if/else fails the moment the model passes "spaghetti carbonara" in lowercase -
// which it does, since users type it that way. I also added a second tool so the agent has
// to actually choose between tools rather than only ever having one option.

import dotenv from 'dotenv';
import { z } from 'zod';
import { Agent, run, tool } from '@openai/agents';

dotenv.config({ override: true });

// --- The recipe "database" -----------------------------------------------------

const RECIPES: Record<string, { ingredients: string; minutes: number }> = {
  'spaghetti carbonara': {
    ingredients:
      'Spaghetti, eggs, Pecorino Romano cheese, guanciale, and black pepper.',
    minutes: 20,
  },
  'chicken adobo': {
    ingredients:
      'Chicken thighs, soy sauce, cane vinegar, garlic, bay leaves, whole black peppercorns, and steamed rice to serve.',
    minutes: 45,
  },
  'margherita pizza': {
    ingredients:
      'Pizza dough, San Marzano tomatoes, fresh mozzarella, fresh basil, olive oil, and salt.',
    minutes: 90,
  },
};

// Normalizing the key is the whole reason this works when the model sends
// "spaghetti carbonara" instead of "Spaghetti Carbonara".
const normalize = (dish: string) => dish.trim().toLowerCase().replace(/\s+/g, ' ');

// --- Tool 1: the required ingredients lookup -----------------------------------

const getRecipeIngredientsTool = tool({
  name: 'get_recipe_ingredients',
  description: 'Get the list of ingredients needed to make a specific dish.',
  parameters: z.object({
    dishName: z.string().describe('The name of the dish, for example "Spaghetti Carbonara"'),
  }),
  execute: async ({ dishName }) => {
    console.log(`  [tool] get_recipe_ingredients called with dishName="${dishName}"`);

    const recipe = RECIPES[normalize(dishName)];
    if (recipe) {
      return recipe.ingredients;
    }
    return "Sorry, I don't know the recipe for that dish.";
  },
});

// --- Tool 2: so the agent has a real choice to make ----------------------------

const getCookTimeTool = tool({
  name: 'get_cook_time',
  description: 'Get the approximate total time in minutes needed to make a specific dish.',
  parameters: z.object({
    dishName: z.string().describe('The name of the dish, for example "Spaghetti Carbonara"'),
  }),
  execute: async ({ dishName }) => {
    console.log(`  [tool] get_cook_time called with dishName="${dishName}"`);

    const recipe = RECIPES[normalize(dishName)];
    if (recipe) {
      return `${dishName} takes about ${recipe.minutes} minutes from start to finish.`;
    }
    return "Sorry, I don't know how long that dish takes.";
  },
});

// --- The agent -----------------------------------------------------------------

const agent = new Agent({
  name: 'Recipe Agent',
  instructions:
    'You are a helpful chef that can provide recipes. Use the get_recipe_ingredients tool ' +
    'to look up what a dish requires, and the get_cook_time tool when the user asks how ' +
    'long something takes. Never invent ingredients from your own knowledge - if a tool ' +
    'says you do not know the dish, tell the user that plainly.',
  tools: [getRecipeIngredientsTool, getCookTimeTool],
});

// --- Run -----------------------------------------------------------------------
// Several questions, so the transcript shows the agent picking the right tool each time
// and handling the unknown-dish path.

const QUESTIONS = [
  'What do I need to make Spaghetti Carbonara?',      // the required question
  'How long does Spaghetti Carbonara take?',           // should choose the OTHER tool
  'What do I need to make Chicken Adobo?',             // second known dish
  'What do I need to make Beef Wellington?',           // unknown -> the fallback string
];

async function main() {
  console.log('Running the Recipe Agent...\n');

  for (const question of QUESTIONS) {
    console.log('='.repeat(68));
    console.log(`USER: ${question}`);
    console.log('='.repeat(68));

    const result = await run(agent, question);

    console.log('--- Agent Final Output ---');
    console.log(result.finalOutput);
    console.log();
  }
}

main().catch(console.error);
