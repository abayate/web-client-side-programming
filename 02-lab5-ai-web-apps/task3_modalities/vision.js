// Lab 5 - Task 3: vision (image input) modality.
// This is the interesting comparison for this lab: in Task 1, MobileNet running in the
// browser labelled my photo "Labrador retriever, 64.63%" - a single ImageNet class and
// nothing else. Here the SAME photo goes to a multimodal LLM, which can actually describe
// the scene and answer follow-up questions about it. Same input, very different capability.

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';

dotenv.config({ override: true });

const openai = new OpenAI();

// The exact image Task 1 classified with MobileNet.
const IMAGE_PATH = '../task1_tensorflowjs/img/labrador.jpg';

async function main() {
  console.log('--- Vision / Image Understanding (gpt-4o) ---');
  console.log(`Image: ${IMAGE_PATH}`);
  console.log('MobileNet (Task 1, in-browser) said: "Labrador retriever" at 64.63% confidence.\n');

  const imageBuffer = await fs.readFile(IMAGE_PATH);
  const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'A MobileNet model running in a browser labelled this image "Labrador retriever" ' +
              'with 64.63% confidence. Do you agree with that label? Then describe everything ' +
              'else that is happening in this picture that a single-label classifier would ' +
              'completely miss. Answer in under 150 words.',
          },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
        ],
      },
    ],
  });

  console.log('GPT-4o response:');
  console.log(completion.choices[0]?.message?.content);
  console.log(`\nTokens used: ${JSON.stringify(completion.usage)}`);
}

main().catch((error) => {
  console.error('Vision request failed:', error.message);
  process.exit(1);
});
