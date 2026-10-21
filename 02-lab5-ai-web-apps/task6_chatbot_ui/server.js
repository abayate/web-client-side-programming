// Lab 5 - Task 6: Express backend for the resume-analyzer chatbot UI.
// Anthony Bayate - TECH*3500*01
//
// Task 6 asks for the Task 5 RAG code with a front end on top: the PDF is uploaded from
// the GUI and analyzed by the backend. The split is:
//   public/     - the browser UI (no API key ever reaches the client)
//   rag.js      - the LangChain pipeline from Task 5
//   server.js   - this file: upload endpoint, analysis endpoint, chat endpoint

import express from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import { buildResumeIndex, analyzeResume, askFollowUp } from "./rag.js";

// override: true so a stale machine-level OPENAI_API_KEY cannot shadow .env
dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Sessions live in memory only: uploaded resumes are never written to disk.
// Each entry is { retriever, history, ... } plus a createdAt for expiry.
const sessions = new Map();
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

function pruneSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, session] of sessions) {
    if (session.createdAt < cutoff) sessions.delete(id);
  }
}
setInterval(pruneSessions, 10 * 60 * 1000).unref();

// Keep the PDF in memory rather than writing it to an uploads/ folder.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF files are accepted."));
  },
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// --- POST /api/analyze --------------------------------------------------------
// Receives the PDF, builds the vector index, runs the four-chain analysis, and
// returns a session id the client uses for follow-up chat.
app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  const startedAt = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    const role = (req.body.role || "a mid-level front-end engineer").slice(0, 120);

    console.log(`[analyze] ${req.file.originalname} (${(req.file.size / 1024).toFixed(0)} KB), role="${role}"`);

    const session = await buildResumeIndex(req.file.buffer);
    session.createdAt = Date.now();
    session.filename = req.file.originalname;

    const analysis = await analyzeResume(session, role);

    const sessionId = randomUUID();
    sessions.set(sessionId, session);

    const elapsedMs = Date.now() - startedAt;
    console.log(`[analyze] done in ${(elapsedMs / 1000).toFixed(1)}s -> session ${sessionId}`);

    res.json({
      sessionId,
      meta: {
        filename: session.filename,
        pageCount: session.pageCount,
        chunkCount: session.chunkCount,
        charCount: session.charCount,
        k: session.k,
        elapsedMs,
        role,
      },
      ...analysis,
    });
  } catch (error) {
    console.error("[analyze] failed:", error.message);
    res.status(500).json({ error: error.message || "Analysis failed." });
  }
});

// --- POST /api/chat -----------------------------------------------------------
// A follow-up question about a resume that was already uploaded.
app.post("/api/chat", async (req, res) => {
  try {
    const { sessionId, question } = req.body || {};

    if (!sessionId || !sessions.has(sessionId)) {
      return res
        .status(404)
        .json({ error: "That resume session expired. Please upload the PDF again." });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question cannot be empty." });
    }

    const session = sessions.get(sessionId);
    const answer = await askFollowUp(session, question.trim().slice(0, 1000));
    res.json({ answer });
  } catch (error) {
    console.error("[chat] failed:", error.message);
    res.status(500).json({ error: error.message || "Chat request failed." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, activeSessions: sessions.size });
});

// Multer and other middleware errors arrive here (e.g. file too large, wrong type).
app.use((error, req, res, next) => {
  console.error("[error]", error.message);
  const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
  res.status(status).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Resume Analyzer running at http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("WARNING: OPENAI_API_KEY is not set. Put it in a .env file next to server.js.");
  }
});
