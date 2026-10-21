// Lab 5, Section 6, Part 2: the "Hello World" agent.
// Anthony Bayate - TECH*3500*01
//
// NOTE ON SETUP: the handout clones the whole openai-agents-js monorepo and imports from
// '../packages/agents/dist/index.js'. I installed the published @openai/agents package
// instead, so the import is just '@openai/agents' and there is no build step. Same SDK,
// far less to download, and the run scripts in package.json work the same way.

import dotenv from 'dotenv';
import { Agent, run } from '@openai/agents';

// Load environment variables from the .env file.
// override: true so a stale machine-level OPENAI_API_KEY cannot shadow .env
dotenv.config({ override: true });

// The agent automatically finds OPENAI_API_KEY in the environment.
const agent = new Agent({
  name: 'Assistant',
  instructions: 'You are a helpful assistant',
});

async function main() {
  console.log('Running the Hello World agent...');
  const result = await run(agent, 'Write a short, four-line poem about the deep ocean.');
  console.log('--- Agent Final Output ---');
  console.log(result.finalOutput);
}

main().catch(console.error);
