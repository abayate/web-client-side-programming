// Lab 5 - Task 2, part 2: "Explore Models on the OpenAI platform and try a couple of
// other models for the same prompt, compare results."
//
// This sends ONE identical prompt to several models and prints a side-by-side table of
// latency, token usage, and estimated cost, followed by each model's full answer.

import OpenAI from 'openai';
import dotenv from 'dotenv';

// NOTE (debugging log): my machine already had a stale OPENAI_API_KEY set as a Windows
// user environment variable. dotenv does NOT overwrite variables that already exist, so
// .env was silently ignored and every request failed with "429 You have no credits
// remaining" even though the key in .env was fine. `override: true` fixes it.
dotenv.config({ override: true });
const openai = new OpenAI();

const PROMPT =
  'Explain what "client-side AI" means to a first-year college student, ' +
  'then give one realistic example of when you should NOT use it. ' +
  'Keep the whole answer under 120 words.';

// Published per-million-token prices, used only to estimate relative cost.
const MODELS = [
  { id: 'gpt-4',        inPerM: 30.00, outPerM: 60.00 },
  { id: 'gpt-4o',       inPerM:  2.50, outPerM: 10.00 },
  { id: 'gpt-4o-mini',  inPerM:  0.15, outPerM:  0.60 },
  { id: 'gpt-4.1-mini', inPerM:  0.40, outPerM:  1.60 },
];

function estimateCost(usage, model) {
  const inCost = (usage.prompt_tokens / 1_000_000) * model.inPerM;
  const outCost = (usage.completion_tokens / 1_000_000) * model.outPerM;
  return inCost + outCost;
}

async function askModel(model) {
  const started = Date.now();
  try {
    const completion = await openai.chat.completions.create({
      model: model.id,
      messages: [{ role: 'user', content: PROMPT }],
      temperature: 0.7,
    });

    const usage = completion.usage;
    return {
      model: model.id,
      ok: true,
      ms: Date.now() - started,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      costUsd: estimateCost(usage, model),
      text: completion.choices[0]?.message?.content ?? '',
    };
  } catch (error) {
    return { model: model.id, ok: false, ms: Date.now() - started, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(78));
  console.log('MULTI-MODEL COMPARISON - Lab 5, Task 2');
  console.log('='.repeat(78));
  console.log(`Prompt (identical for every model):\n  "${PROMPT}"\n`);

  // Fire all the requests at once so slow models do not block fast ones.
  const results = await Promise.all(MODELS.map(askModel));

  console.log('-'.repeat(78));
  console.log(
    'MODEL'.padEnd(16) +
    'LATENCY'.padStart(10) +
    'IN TOK'.padStart(9) +
    'OUT TOK'.padStart(9) +
    'EST. COST'.padStart(12)
  );
  console.log('-'.repeat(78));

  for (const r of results) {
    if (!r.ok) {
      console.log(r.model.padEnd(16) + 'ERROR'.padStart(10) + `  ${r.error}`);
      continue;
    }
    console.log(
      r.model.padEnd(16) +
      `${r.ms} ms`.padStart(10) +
      String(r.promptTokens).padStart(9) +
      String(r.completionTokens).padStart(9) +
      `$${r.costUsd.toFixed(6)}`.padStart(12)
    );
  }
  console.log('-'.repeat(78));

  for (const r of results) {
    console.log(`\n${'='.repeat(78)}`);
    console.log(`ANSWER FROM: ${r.model}`);
    console.log('='.repeat(78));
    console.log(r.ok ? r.text : `Request failed: ${r.error}`);
  }

  const successes = results.filter((r) => r.ok);
  if (successes.length > 1) {
    const fastest = successes.reduce((a, b) => (a.ms < b.ms ? a : b));
    const cheapest = successes.reduce((a, b) => (a.costUsd < b.costUsd ? a : b));
    const longest = successes.reduce((a, b) => (a.completionTokens > b.completionTokens ? a : b));

    console.log(`\n${'='.repeat(78)}`);
    console.log('SUMMARY');
    console.log('='.repeat(78));
    console.log(`Fastest response : ${fastest.model} (${fastest.ms} ms)`);
    console.log(`Cheapest call    : ${cheapest.model} ($${cheapest.costUsd.toFixed(6)})`);
    console.log(`Most verbose     : ${longest.model} (${longest.completionTokens} output tokens)`);
    console.log(
      `Cost spread      : ${(
        Math.max(...successes.map((r) => r.costUsd)) /
        Math.min(...successes.map((r) => r.costUsd))
      ).toFixed(1)}x between the most and least expensive model`
    );
  }
}

main().catch((error) => {
  console.error('Comparison failed:', error.message);
  process.exit(1);
});
