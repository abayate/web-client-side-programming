# Week 1 AS1 — Lab #1: Building AI-Integrated Web Applications

**Anthony Bayate — TECH\*3500\*01 — 30 points**

Every task below was actually built and actually run. The `*_output*.txt` files in each
folder are real captured terminal output, not transcribed by hand.

---

## How to run everything

Each task folder is a self-contained project with its own `package.json` and `.env`.

| Task | Folder | Command |
|---|---|---|
| 1 | `task1_tensorflowjs/` | Open `index.html` with Live Server |
| 2 | `task2_openai/` | `npm install` then `npm start` / `npm run compare` |
| 3 | `task3_modalities/` | `npm install` then `npm run all` |
| 4 | `task4_langchain_guardian/` | `npm install` then `npm start` |
| 5 | `task5_rag/` | `npm install` then `npm run sample` |
| 6 | `task6_chatbot_ui/` | `npm install` then `npm start`, open <http://localhost:3000> |
| Sec. 6 | `task7_agents_sdk/` | `npm install` then `npm run examples:101-recipe-agent` |

---

## The first thing that broke, and how I fixed it

Nothing worked at all at first. Every OpenAI call failed with:

```
429 You have no credits remaining.
```

even though the key in `.env` was fine. The clue was buried in dotenv's own startup line:

```
injected env (0) from .env      <-- zero variables injected
```

**Diagnosis:** my machine already had an old `OPENAI_API_KEY` set as a Windows user
environment variable. `dotenv.config()` deliberately does *not* overwrite a variable that
already exists in `process.env`, so my `.env` file was being read and then silently
discarded. Every request went out signed with the stale, empty-balance key.

**Fix:** `dotenv.config({ override: true })`, applied in every script in this lab.

That one is worth remembering: dotenv failing "loudly" would have saved 20 minutes, but it
fails silently by design, and the resulting error message points at billing rather than at
configuration.

---

## Task 1 — Client-Side AI with TensorFlow.js

**Folder:** `task1_tensorflowjs/` · **Source as text:** `task1_source.txt`

- Swapped the cat for `img/labrador.jpg` (step 1–3). MobileNet identifies it as
  **Labrador retriever, 64.63%**, with Chesapeake Bay retriever (18.33%) and flat-coated
  retriever (7.03%) as runners-up — the confusion set is itself informative.
- **Challenge completed:** a "Classify New Image" button opens a file picker, and the
  chosen image is classified in-browser. A "Reset to Sample" button restores the original.
- Rewrote the layout in CSS: card design, animated confidence bars per prediction, a
  model-status badge, and a mobile breakpoint.

**Two bugs I fixed while building this:**

1. The starter code set `img.onload = ...` *after* assigning `img.src`. When the browser
   has the image cached, `load` fires before the handler is attached, so classification
   silently never runs. Replaced with `await img.decode()`, which resolves whether or not
   the image was cached.
2. Object URLs created for uploaded files were never revoked, leaking memory on every
   upload. Added `URL.revokeObjectURL` before each new one.

Classification runs in ~197 ms locally, and no image ever leaves the browser.

---

## Task 2 — Introduction to LLMs with OpenAI.js

**Folder:** `task2_openai/` · **Source as text:** `task2_source.txt`
**Output:** `task2_output_index.txt`, `task2_output_compare.txt`

1. **Different prompt.** Replaced "List 10 breeds of cats" with a question actually
   relevant to this course: the trade-offs between browser-side TensorFlow.js and a hosted
   LLM API. Both the non-streaming and streaming paths run.
2. **Model comparison.** `compare-models.js` sends one identical prompt to four models
   concurrently and reports latency, token usage, and estimated cost:

| Model | Latency | In tok | Out tok | Est. cost |
|---|---|---|---|---|
| gpt-4 | 3989 ms | 45 | 79 | $0.006090 |
| gpt-4o | 2255 ms | 44 | 104 | $0.001150 |
| gpt-4o-mini | **1630 ms** | 44 | 108 | **$0.000071** |
| gpt-4.1-mini | 2677 ms | 44 | 105 | $0.000186 |

**Conclusion:** an **85.3× cost spread** across models whose answers were, for this
prompt, near-indistinguishable in quality. gpt-4 was simultaneously the slowest, the most
expensive, and the *least* complete (it was the only model that skipped a concrete
example). The instinct to reach for the biggest model is often wrong — for simple prompts
gpt-4o-mini won on every measurable axis.

---

## Task 3 — Other modalities from the openai-node examples

**Folder:** `task3_modalities/` · **Source as text:** `task3_source.txt`
**Output:** `task3_output.txt` · **Generated media:** `output/`

Three modalities implemented rather than one:

- **Image generation** (`gpt-image-1-mini`) → `output/generated-image.png`, 1024×1024,
  generated in 17.4 s. The API returns base64, so the script decodes and writes the PNG.
- **Text to speech** (`gpt-4o-mini-tts`) → two MP3 narrations in different voices
  (`nova`, `onyx`) so the difference is audible.
- **Vision** (`gpt-4o`) — the most interesting result in the lab.

**The vision result is the real finding.** I fed GPT-4o the *exact same* labrador photo
that MobileNet classified in Task 1. MobileNet's entire output was one label:
`Labrador retriever, 64.63%`. GPT-4o returned:

> "The dog is wearing a costume resembling a bee, with yellow and black striped fabric and
> pink, iridescent wings. The dog is lying on a carpeted floor in front of a striped sofa,
> and there's a pink toy... near the dog's front legs."

Same pixels, same task category, completely different capability. MobileNet answers
"which of 1000 classes is this"; it has no vocabulary for *bee costume* or *sofa*, so that
information is not merely missed, it is unrepresentable. That is the concrete difference
between a classifier and a multimodal model, and it costs about 200 ms and $0 versus a
network round trip and a per-token charge.

---

## Task 4 — LangChain red team / guardian / worker

**Folder:** `task4_langchain_guardian/` · **Source as text:** `task4_source.txt`
**Output:** `task4_output.txt` (final), `task4_output_BEFORE_fix.txt` (evidence)

I found **two real bugs** in the handout code.

### Bug 1 — the personas were never applied

The handout passes `systemMessage: new SystemMessage(...)` into the `ChatOpenAI`
constructor. **That is not a valid constructor option in LangChain.js.** It is silently
dropped. So the "Guardian" was just a plain gpt-4o with no instructions, answering in
paragraphs instead of the single word `SAFE`/`UNSAFE` — which meant
`promptCheck.content.includes("UNSAFE")` almost never matched and the safety filter
**passed nearly everything through**. A guardrail that silently does nothing is worse than
no guardrail, because you believe you are protected.

**Fix:** pass the persona as a `SystemMessage` in the `invoke()` array, which is how
LangChain.js actually applies a system prompt.

### Bug 2 — after fixing Bug 1, *everything* was blocked

See `task4_output_BEFORE_fix.txt`: all five test inputs returned `BLOCKED_AT_PROMPT`,
including "Tell me about the history of the internet."

The cause is structural, not a typo. The Red Teamer runs **unconditionally** and rewrites
*any* input into a jailbreak attempt, which the Guardian then correctly rejects. The
pipeline could therefore only ever produce one outcome — the `ALLOWED` and
`BLOCKED_AT_RESPONSE` branches were unreachable code. That makes it useless as a real
guardrail and impossible to test the way Task 4 asks.

**Fix:** made red-teaming an explicit per-request mode instead of a mandatory stage, and
added a Guardian check on the *original* user input. The result is a 4-gate pipeline where
every branch is reachable:

```
[Gate 0] Guardian screens the original input       -> BLOCKED_AT_INPUT
[Gate 1] Red Teamer rewrites it (adversarial mode only)
[Gate 2] Guardian screens the prompt for the Worker -> BLOCKED_AT_PROMPT
[Gate 3] Worker answers
[Gate 4] Guardian screens the answer                -> BLOCKED_AT_RESPONSE / ALLOWED
```

### Results — 9 test cases, 9/9 hit the branch I predicted

| Case | Expected | Actual |
|---|---|---|
| A — safe question, normal mode | ALLOWED | ALLOWED |
| B — safe question + red teamer | ALLOWED | ALLOWED |
| B2 — antivirus question + red teamer | BLOCKED_AT_PROMPT | BLOCKED_AT_PROMPT |
| B3 — locksmith question + red teamer | BLOCKED_AT_PROMPT | BLOCKED_AT_PROMPT |
| C — weapon build in movie framing | BLOCKED_AT_INPUT | BLOCKED_AT_INPUT |
| D — "ignore all previous instructions" | BLOCKED_AT_INPUT | BLOCKED_AT_INPUT |
| E — SQL injection *defense* question | ALLOWED | ALLOWED |
| F — someone's home address | BLOCKED_AT_INPUT | BLOCKED_AT_INPUT |
| G — harmless request + red teamer | ALLOWED | ALLOWED |

**Findings worth stating plainly:**

- **Case E is the one that matters.** "Explain SQL injection and how to defend against it"
  is a legitimate coursework question. A naive keyword filter blocks it. My guardian
  allows it, because the persona explicitly says defensive/educational security questions
  are SAFE. False positives are the failure mode that makes people disable safety systems.
- **Red-teaming a harmless topic stays harmless** (cases B and G). It only escalates when
  the topic is security-adjacent to begin with (B2, B3). My original expectations for B and
  G were wrong, and I corrected them from the observed runs rather than the reverse.
- **`BLOCKED_AT_RESPONSE` never triggered.** That branch is genuinely hard to reach: once
  a prompt has passed the Guardian, a well-aligned worker rarely produces an unsafe answer.
  I am reporting this as unreached rather than manufacturing a case to fake coverage.

---

## Task 5 — RAG app, fine-tuned

**Folder:** `task5_rag/` · **Source as text:** `task5_source.txt`
**Output:** `task5_output.txt` · **Test PDF:** `sample-resume.pdf`

I wrote `make_sample_resume.py` to generate a test resume with *deliberate* gaps (an
incomplete degree, no testing experience, a short tenure) so the critical chain has real
material instead of having to invent weaknesses.

### Seven documented improvements

1. **Fixed a hard crash.** `require("pdf-parse")` runs the package's `index.js`, which
   contains `let isDebugMode = !module.parent;`. Under an ESM `createRequire` shim
   `module.parent` is `undefined`, so the package decides it is in debug mode and tries to
   read a bundled test fixture that is not shipped — `ENOENT` before my code ever runs.
   Fix: `require("pdf-parse/lib/pdf-parse.js")`, bypassing that check.
2. **Better chunking.** 1000/200 on a 2-page resume produced ~3 giant chunks, so
   "retrieval" returned essentially the whole document and the vector store did nothing.
   Dropped to 500/100 with resume-aware separators → 7 chunks at section granularity.
3. **MMR retrieval** instead of plain top-k similarity, which kept returning near-duplicate
   chunks about the same job.
4. **Grounding rules in the prompts.** Both prompts now require the model to quote the
   exact line it is reacting to and to write "not stated in the resume" instead of
   guessing. Temperature 0.3 → 0.1.
5. **Two additional chains:** a structured JSON extraction chain, and a final hiring
   recommendation chain that consumes the outputs of the praising and critical chains —
   a genuine chain-of-chains, which is the actual reason to use LangChain over raw fetch.
6. **Parallel execution** via `Promise.all` for the three independent chains.
7. **CLI argument support** so the script can run non-interactively.

### The improvement that mattered most (found by running it, not by reading it)

My first run produced a confident, completely false statement:

> "The resume section titled CERTIFICATIONS is present but does not list any
> certifications."

It lists two. This was **not** the model hallucinating — it was retrieval silently dropping
the evidence. With a fixed `k=5` against a 7-chunk document, two chunks were never
retrieved, and one of them was the certifications section. The model faithfully reported on
context it was never given.

**Fix:** `k = Math.min(8, docs.length)` — k scales with corpus size, capped so a long CV
still bounds the prompt. After the change the same chain correctly quotes both
certifications by name.

The general lesson: when a RAG system says something false, suspect the retriever before
the model. The model can only be as honest as its context.

---

## Task 6 — Chatbot UI

**Folder:** `task6_chatbot_ui/` · **Source as text:** `task6_source.txt`

The Task 5 pipeline with a browser front end. PDF is uploaded from the GUI and analyzed by
the backend, as required.

- `public/` — drag-and-drop upload, staged progress, results dashboard, chat panel
- `rag.js` — the Task 5 LangChain pipeline, refactored to accept a `Buffer` instead of a path
- `server.js` — Express + multer; `/api/analyze` and `/api/chat`

**Beyond the requirement:** it is an actual *chatbot*, not just a report. The vector store
built at upload time is kept in a server-side session, so follow-up questions are answered
by retrieving from that same resume. Verified working — asked "Does this candidate have
testing experience?" and got "The resume does not mention any specific testing
experience," which is correct; I deliberately left testing out of the source PDF.

**Design decisions:**

- The API key lives only on the server. A browser-side OpenAI call would ship the key to
  every visitor.
- Uploads are held in memory (`multer.memoryStorage`), never written to disk. Sessions
  expire after 1 hour.
- Model output is inserted via `textContent` and a whitelist, never `innerHTML`, so a
  malicious resume cannot inject script into the page.

**Verified run:** 2 pages · 2,437 characters · 7 chunks · retriever k=7 · 23.4 s ·
verdict **ADVANCE TO INTERVIEW**, confidence Medium.

---

## Section 6 — OpenAI Agents SDK

**Folder:** `task7_agents_sdk/` · **Source as text:** `task7_source.txt`
**Output:** `task7_output.txt`

> **Submission requirement 1:** `examples/101-recipe-agent.ts` ✅
> **Submission requirement 2:** `package.json` with the three added scripts ✅

**Setup deviation, stated openly:** the handout clones the entire `openai-agents-js`
monorepo and imports from `../packages/agents/dist/index.js`, which requires `pnpm build`
and a zod pin. I installed the published `@openai/agents` package instead — same SDK, no
build step, and the three `examples:*` scripts work identically. `zod` is still pinned to
`3.25.67` as the handout requires.

### The capstone: Recipe Agent

The handout specifies a literal `if/else` on `dishName`. I kept the required behaviour
exactly — an unknown dish returns `"Sorry, I don't know the recipe for that dish."` — but
backed it with a lookup table and **case-insensitive normalization**, because the literal
`if (dishName === "Spaghetti Carbonara")` breaks the moment the model passes
`"spaghetti carbonara"`, which is exactly what happens when a user types it that way.

I also added a **second tool** (`get_cook_time`), so the agent must genuinely *choose*
between tools rather than only ever having one option. All four verified runs:

| Question | Tool the agent chose | Result |
|---|---|---|
| "What do I need to make Spaghetti Carbonara?" | `get_recipe_ingredients` | correct ingredients |
| "How long does Spaghetti Carbonara take?" | `get_cook_time` | 20 minutes |
| "What do I need to make Chicken Adobo?" | `get_recipe_ingredients` | correct ingredients |
| "What do I need to make Beef Wellington?" | `get_recipe_ingredients` | correct fallback |

The agent picked the right tool every time, including switching tools when only the *verb*
of the question changed.

---

## What I actually took away from this lab

1. **Silent failures cost more than loud ones.** The dotenv shadowing, the ignored
   `systemMessage`, and the dropped retrieval chunk were all bugs where the program kept
   running and produced *plausible* output. Two of them produced systems that appeared to
   work while doing nothing (a guardrail that blocked nothing) or actively lying (a critic
   citing an empty section that wasn't empty). Code that crashes is a much easier problem.
2. **"It ran" is not "it works."** Task 4 ran perfectly and blocked 100% of inputs. Task 5
   ran perfectly and stated a falsehood. Both needed someone to look at the *content* of
   the output and ask whether it made sense.
3. **Model choice is an engineering decision, not a default.** An 85× cost difference for
   indistinguishable quality is not a rounding error.
4. **RAG failures are usually retrieval failures.** The model can only be as accurate as
   the context it is handed.

---

## Screenshots to attach

Task 1, 2, 3, 4 and 5 all ask for screenshots. The code and captured text output are all
here; take these five screenshots before submitting:

1. **Task 1** — `index.html` in Live Server showing the labrador and the prediction bars,
   with DevTools console open (the handout asks for the Inspect view).
2. **Task 2** — terminal after `npm run compare`, showing the comparison table.
3. **Task 3** — `output/generated-image.png` open, plus the terminal from `npm run all`.
4. **Task 4** — terminal after `npm start`, scrolled to the final SUMMARY table.
5. **Task 6** — browser at `localhost:3000` showing a completed analysis and a chat reply.
