// Lab 5, Section 6, Part 3: the "Functions" example - giving an agent a tool.
// Anthony Bayate - TECH*3500*01

import dotenv from 'dotenv';
import { z } from 'zod';
import { Agent, run, tool } from '@openai/agents';

dotenv.config({ override: true });

const getWeatherTool = tool({
  name: 'get_weather',
  description: 'Get the weather for a given city',
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    // This is a mock tool. In a real app you would call a weather API here.
    console.log(`  [tool] get_weather called with city="${city}"`);
    return `The weather in ${city} is sunny and 75F.`;
  },
});

const agent = new Agent({
  name: 'Data Agent',
  instructions: 'You are a helpful data agent that can provide weather information.',
  tools: [getWeatherTool],
});

async function main() {
  console.log('Running the Functions agent...');
  const result = await run(agent, 'What is the weather in Tokyo?');
  console.log('--- Agent Final Output ---');
  console.log(result.finalOutput);
}

main().catch(console.error);
