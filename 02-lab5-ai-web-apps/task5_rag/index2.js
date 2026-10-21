import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import * as readline from "readline";
import dotenv from "dotenv";

// Use createRequire to reliably import the CommonJS pdf-parse module.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// See change #1 above - importing "pdf-parse" directly crashes under ESM.
const pdf = require("pdf-parse/lib/pdf-parse.js");

// override: true so a stale machine-level OPENAI_API_KEY cannot shadow .env
dotenv.config({ override: true });

// --- PROMPTS -----------------------------------------------------------------

const GROUNDING_RULES = `
Rules you must follow:
- Use ONLY the resume context below. Do not use outside knowledge about the company or person.
- Every claim you make must be traceable to the context. Quote the exact phrase you are relying on in "quotes".
- If the context does not cover something, write "not stated in the resume" instead of guessing.
`;

const praisingTemplate = `You are an enthusiastic hiring manager trying to convince your team to hire a candidate.
Based ONLY on the following resume context, write a compelling summary praising the candidate.
Focus on their strengths, achievements, and skills. Prefer concrete, measurable results over adjectives.
Do not mention any weaknesses or gaps.
${GROUNDING_RULES}
Context:
{context}

Question:
{question}

Praising Summary:`;

const criticalTemplate = `You are a cautious and objective technical recruiter.
Based ONLY on the following resume context, identify potential weaknesses, gaps, or areas that need clarification.
Be fair and objective. Do not invent information. If there are no clear weaknesses, state that the resume looks strong.
For each point, say explicitly whether it is a real gap in the resume or simply something the resume does not mention.
${GROUNDING_RULES}
Context:
{context}

Question:
{question}

Critical Analysis:`;

const extractionTemplate = `You are a resume parser. Extract structured facts from the resume context below.
Respond with ONLY a valid JSON object and no markdown fences, using exactly this shape:
{{
  "name": string | null,
  "years_of_experience": number | null,
  "current_title": string | null,
  "top_skills": string[],
  "employers": string[],
  "education_status": string | null,
  "quantified_achievements": string[]
}}
Use null or an empty array for anything the resume does not state. Do not invent values.

Context:
{context}

Question:
{question}

JSON:`;

// This chain does NOT retrieve - it consumes the output of the two chains above.
const recommendationTemplate = `You are the hiring committee chair. Two of your colleagues reviewed the same candidate.

The advocate wrote:
{praise}

The skeptic wrote:
{critique}

Weigh both views against each other and produce a final decision for a MID-LEVEL FRONT-END ENGINEER role.
Respond in exactly this format:

VERDICT: <ADVANCE TO INTERVIEW | ADVANCE WITH RESERVATIONS | DO NOT ADVANCE>
CONFIDENCE: <High | Medium | Low>
REASONING: <2-3 sentences that explicitly weigh the strongest point from each reviewer>
QUESTIONS TO ASK: <exactly 3 numbered interview questions targeting the skeptic's concerns>`;

// --- MAIN ANALYSIS FUNCTION --------------------------------------------------

async function analyzeResume(filePath) {
  const startedAt = Date.now();

  try {
    // --- Step 1: read and parse the PDF ---
    console.log(`Reading PDF file from: ${filePath}...`);
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || !resumeText.trim()) {
      throw new Error(
        "Could not extract text from the PDF. The file might be empty or image-based."
      );
    }
    console.log(
      `Successfully extracted text from PDF (${pdfData.numpages} page(s), ${resumeText.length} characters).`
    );

    // --- Step 2: build the vector store ---
    const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0.1 });
    const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

    // Change #2: smaller chunks with resume-aware separators.
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });
    const docs = await textSplitter.createDocuments([resumeText]);
    console.log(`Split the resume into ${docs.length} chunks.`);

    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Change #3: MMR retrieval for diversity instead of plain top-k similarity.
    //
    // Change #3b (added after my first run): k must scale with the corpus size.
    // With a fixed k=5 against a 7-chunk resume, two chunks were never retrieved,
    // and the critical chain confidently reported "the CERTIFICATIONS section does
    // not list any certifications" - it lists two. That is not the model
    // hallucinating, it is retrieval silently dropping the evidence. A one-page
    // resume is small enough that the right answer is to retrieve nearly all of
    // it; the ceiling of 8 keeps the prompt bounded for a long CV.
    const k = Math.min(8, docs.length);
    console.log(`Retriever k = ${k} (of ${docs.length} chunks).`);
    const retriever = vectorStore.asRetriever({
      k,
      searchType: "mmr",
      searchKwargs: { fetchK: Math.min(20, docs.length * 2), lambda: 0.6 },
    });

    // --- Step 3: build the RAG chains ---
    // The context is produced by its own sub-chain:
    //   1. take the input object and extract the 'question' string
    //   2. pass that string to the retriever
    //   3. format the retrieved documents into a single string
    const createRagChain = (template) =>
      RunnableSequence.from([
        {
          context: RunnableSequence.from([
            (input) => input.question,
            retriever,
            formatDocumentsAsString,
          ]),
          question: (input) => input.question,
        },
        PromptTemplate.fromTemplate(template),
        llm,
        new StringOutputParser(),
      ]);

    const praisingChain = createRagChain(praisingTemplate);
    const criticalChain = createRagChain(criticalTemplate);
    const extractionChain = createRagChain(extractionTemplate);

    // Change #6: these three are independent, so run them concurrently.
    console.log("Running the praising, critical, and extraction chains in parallel...");
    const [praisingResult, criticalResult, extractionResult] = await Promise.all([
      praisingChain.invoke({
        question:
          "What are this candidate's strongest achievements, measurable results, and technical skills?",
      }),
      criticalChain.invoke({
        question:
          "What gaps, missing skills, short tenures, or unclear claims should a recruiter ask about?",
      }),
      extractionChain.invoke({
        question: "Extract the candidate's name, experience, skills, employers, and education.",
      }),
    ]);

    // Change #5: a fourth chain that consumes the output of the previous two.
    console.log("Running the final recommendation chain (chain-of-chains)...");
    const recommendationChain = RunnableSequence.from([
      PromptTemplate.fromTemplate(recommendationTemplate),
      new ChatOpenAI({ model: "gpt-4o", temperature: 0 }),
      new StringOutputParser(),
    ]);
    const recommendation = await recommendationChain.invoke({
      praise: praisingResult,
      critique: criticalResult,
    });

    // --- Step 4: report ---
    const line = "=".repeat(72);

    console.log(`\n${line}`);
    console.log("   The Hiring Manager's Perspective (Pros)");
    console.log(line);
    console.log(praisingResult);

    console.log(`\n${line}`);
    console.log("   The Critical Review (Cons & Gaps)");
    console.log(line);
    console.log(criticalResult);

    console.log(`\n${line}`);
    console.log("   Structured Extraction (machine-readable)");
    console.log(line);
    try {
      // Strip markdown fences if the model added them anyway.
      const cleaned = extractionResult.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      console.log(JSON.stringify(JSON.parse(cleaned), null, 2));
    } catch {
      console.log("(Model did not return valid JSON, printing raw output)");
      console.log(extractionResult);
    }

    console.log(`\n${line}`);
    console.log("   Final Hiring Recommendation (synthesis of both reviews)");
    console.log(line);
    console.log(recommendation);

    console.log(`\n${line}`);
    console.log(`Completed in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
    console.log(line);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`\nError: File not found at path: "${filePath}"`);
      console.error("Please make sure the path is correct and the file exists.");
    } else {
      console.error("\nAn error occurred during analysis:", error);
    }
    process.exitCode = 1;
  }
}

// --- RUN ---------------------------------------------------------------------
// Change #7: accept the path as an argument; only prompt interactively if absent.

const cleanPath = (p) => p.trim().replace(/^"|"$/g, "");
const argPath = process.argv[2];

if (argPath) {
  analyzeResume(cleanPath(argPath));
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Please enter the full path to the PDF resume file: ", (filePath) => {
    rl.close();
    analyzeResume(cleanPath(filePath));
  });
}
