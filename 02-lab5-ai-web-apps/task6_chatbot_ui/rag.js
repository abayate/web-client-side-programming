// Lab 5 - Task 6: the RAG engine, extracted from Task 5 so the web server can reuse it.
// Anthony Bayate - TECH*3500*01
//
// Task 5 was a terminal script that read a path from readline. For Task 6 the PDF
// arrives from the browser as an in-memory Buffer, so the only real change here is that
// every function takes a Buffer instead of a file path. All the tuning from Task 5
// (500/100 chunks, adaptive-k MMR retrieval, grounded prompts, chain-of-chains) is kept.

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Requiring "pdf-parse" directly triggers its debug mode under ESM and crashes with
// ENOENT on a test fixture that is not shipped. Requiring the lib file skips that.
const pdf = require("pdf-parse/lib/pdf-parse.js");

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

const recommendationTemplate = `You are the hiring committee chair. Two of your colleagues reviewed the same candidate.

The advocate wrote:
{praise}

The skeptic wrote:
{critique}

Weigh both views against each other and produce a final decision for the role: {role}.
Respond in exactly this format:

VERDICT: <ADVANCE TO INTERVIEW | ADVANCE WITH RESERVATIONS | DO NOT ADVANCE>
CONFIDENCE: <High | Medium | Low>
REASONING: <2-3 sentences that explicitly weigh the strongest point from each reviewer>
QUESTIONS TO ASK: <exactly 3 numbered interview questions targeting the skeptic's concerns>`;

// The follow-up chat prompt. This is what makes Task 6 a chatbot rather than a
// one-shot report: the user keeps asking questions and each one is answered by
// retrieving from the same vector store built at upload time.
const chatTemplate = `You are a recruiting assistant answering questions about ONE specific resume.

Resume context retrieved for this question:
{context}

Conversation so far:
{history}

Answer the recruiter's question using ONLY the resume context above.
If the resume does not contain the answer, say so plainly - do not speculate.
Keep the answer under 120 words unless the question requires a list.

Recruiter's question: {question}

Answer:`;

/**
 * Parse a PDF buffer, chunk it, embed it, and return a reusable session object.
 * The vector store is built once per upload and then reused by both the initial
 * analysis and every follow-up chat message.
 */
export async function buildResumeIndex(pdfBuffer) {
  const pdfData = await pdf(pdfBuffer);
  const resumeText = pdfData.text;

  if (!resumeText || !resumeText.trim()) {
    throw new Error(
      "Could not extract text from this PDF. It may be a scanned/image-only document."
    );
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });
  const docs = await textSplitter.createDocuments([resumeText]);

  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  // k scales with the document so a short resume never loses a whole section.
  const k = Math.min(8, docs.length);
  const retriever = vectorStore.asRetriever({
    k,
    searchType: "mmr",
    searchKwargs: { fetchK: Math.min(20, docs.length * 2), lambda: 0.6 },
  });

  return {
    retriever,
    chunkCount: docs.length,
    pageCount: pdfData.numpages,
    charCount: resumeText.length,
    k,
    history: [], // follow-up chat turns, appended as { role, content }
  };
}

function createRagChain(retriever, template, llm) {
  return RunnableSequence.from([
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
}

/** Run the four-chain analysis over an already-built session. */
export async function analyzeResume(session, role = "a mid-level front-end engineer") {
  const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0.1 });

  const praisingChain = createRagChain(session.retriever, praisingTemplate, llm);
  const criticalChain = createRagChain(session.retriever, criticalTemplate, llm);
  const extractionChain = createRagChain(session.retriever, extractionTemplate, llm);

  // Independent chains, so run them concurrently.
  const [praise, critique, extractionRaw] = await Promise.all([
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

  // Chain-of-chains: this call consumes the output of the two above.
  const recommendationChain = RunnableSequence.from([
    PromptTemplate.fromTemplate(recommendationTemplate),
    new ChatOpenAI({ model: "gpt-4o", temperature: 0 }),
    new StringOutputParser(),
  ]);
  const recommendation = await recommendationChain.invoke({ praise, critique, role });

  let facts = null;
  try {
    facts = JSON.parse(extractionRaw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
  } catch {
    facts = null; // the UI falls back to hiding the facts panel
  }

  return { praise, critique, facts, recommendation };
}

/** Answer one follow-up question against the uploaded resume. */
export async function askFollowUp(session, question) {
  const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2 });

  // Only the last few turns are sent back, to keep the prompt small.
  const history =
    session.history
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Recruiter" : "Assistant"}: ${m.content}`)
      .join("\n") || "(this is the first question)";

  const chain = RunnableSequence.from([
    {
      context: RunnableSequence.from([
        (input) => input.question,
        session.retriever,
        formatDocumentsAsString,
      ]),
      question: (input) => input.question,
      history: (input) => input.history,
    },
    PromptTemplate.fromTemplate(chatTemplate),
    llm,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke({ question, history });

  session.history.push({ role: "user", content: question });
  session.history.push({ role: "assistant", content: answer });

  return answer;
}
