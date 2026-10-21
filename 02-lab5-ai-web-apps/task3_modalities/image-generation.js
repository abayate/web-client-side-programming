// Lab 5 - Task 3: image generation modality.
// Based on the "image generation" samples in https://github.com/openai/openai-node/tree/master/examples
// The API returns base64 PNG data, so we decode it and write it to disk ourselves.

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';

// override: true so a stale machine-level OPENAI_API_KEY cannot shadow our .env file.
dotenv.config({ override: true });

const openai = new OpenAI();

const OUTPUT_DIR = 'output';
const PROMPT =
  'A clean, flat vector illustration of a laptop on a desk. The laptop screen shows a ' +
  'simple neural network diagram made of glowing nodes and connecting lines. ' +
  'Soft indigo and violet color palette, plenty of white space, no text anywhere in the image.';

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log('--- Image Generation (gpt-image-1-mini) ---');
  console.log(`Prompt: ${PROMPT}\n`);
  console.log('Generating... (this usually takes 10-30 seconds)');

  const started = Date.now();
  const response = await openai.images.generate({
    model: 'gpt-image-1-mini',
    prompt: PROMPT,
    size: '1024x1024',
    n: 1,
  });

  const b64 = response.data[0].b64_json;
  if (!b64) throw new Error('The API did not return base64 image data.');

  const outPath = path.join(OUTPUT_DIR, 'generated-image.png');
  await fs.writeFile(outPath, Buffer.from(b64, 'base64'));

  const bytes = Buffer.byteLength(b64, 'base64');
  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(`Saved: ${outPath} (${(bytes / 1024).toFixed(1)} KB)`);
  if (response.usage) {
    console.log(`Tokens: ${JSON.stringify(response.usage)}`);
  }
}

main().catch((error) => {
  console.error('Image generation failed:', error.message);
  process.exit(1);
});
