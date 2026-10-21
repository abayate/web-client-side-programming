// Lab 5 - Task 2, part 1: same structure as the lab handout, but with my own prompt.
// The handout asked for "List 10 breeds of cats"; I changed it to a prompt that is
// actually relevant to this course so the difference in output is obvious.

import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from the .env file
// NOTE (debugging log): my machine already had a stale OPENAI_API_KEY set as a Windows
// user environment variable. dotenv does NOT overwrite variables that already exist, so
// .env was silently ignored and every request failed with "429 You have no credits
// remaining" even though the key in .env was fine. `override: true` fixes it.
dotenv.config({ override: true });

// The OpenAI constructor automatically looks for the OPENAI_API_KEY
// in the environment variables (process.env)
const openai = new OpenAI();

const MY_PROMPT =
  'I am a college student learning client-side web programming. ' +
  'Explain the difference between running an AI model in the browser with TensorFlow.js ' +
  'and calling a hosted LLM API like OpenAI from a Node.js server. ' +
  'Give me three concrete trade-offs and finish with a one-sentence rule of thumb.';

async function main() {
  console.log('--- Non-Streaming Example ---');
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: MY_PROMPT }],
  });
  console.log(completion.choices[0]?.message?.content);

  console.log('\n--- Streaming Example ---');
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: MY_PROMPT }],
    stream: true,
  });

  for await (const part of stream) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
  }
  process.stdout.write('\n');
}

main().catch((error) => {
  console.error('Request failed:', error.message);
  process.exit(1);
});
