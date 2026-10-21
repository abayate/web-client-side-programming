# Web Client-Side Programming (TECH 3500), Fall 2026

Coursework by **Anthony Bayate**, Kean University. Every lab, assignment and project I built for the class is collected here, in the order I did them.

## Featured: Project #1, StudyPilot

**[StudyPilot](project-1-studypilot/)** is an AI study-planning agent. You give it a syllabus (paste it or upload a PDF) and the agent pulls out every deadline, builds a day-by-day study plan, quizzes you, and re-plans when a quiz shows a weak topic. It runs on Node.js/Express with Google Gemini tool calling.

- Live app: _coming soon (Render)_
- Write-up: [`project-1-studypilot/report/`](project-1-studypilot/report/)

## All projects

| # | Project | What it is | Stack |
|---|---|---|---|
| 01 | [Personal website](01-personal-website/) | My first personal site and the software-install page from week 1 | HTML, CSS, JS |
| 02 | [Lab 5: AI web apps](02-lab5-ai-web-apps/) | Seven tasks: TensorFlow.js image classifier, OpenAI chat, vision, image generation and TTS, a LangChain guardian, RAG over a résumé PDF, a chatbot UI and the OpenAI Agents SDK | TF.js, Node, OpenAI, LangChain |
| 03 | [CSS frameworks](03-css-frameworks/) | The same kind of page built with Bootstrap, Bulma, Foundation, Materialize and Tailwind | CSS frameworks |
| 04 | [Cert Tracker](04-cert-tracker-react/) | A React app for tracking certifications | React, Vite |
| 05 | [Week 3 class activity](05-week3-class-activity/) | Class activity and reflection | Write-up |
| 06 | [JavaScript fundamentals](06-javascript-fundamentals/) | Functions, closures, promises, async/await, the event loop, fetch, error handling, plus a first Express server | Node.js, Express |
| 07 | [Express website](07-express-website/) | Multi-page Express site with static views | Express |
| 08 | [JavaScript games](08-javascript-games/) | Six browser games, including Battleship against an AI admiral and a tower-defense game ([play them](https://ab-js-game-arcade.vercel.app/)) | Canvas, JS |
| 09 | [OpenAI Joke Bot](09-openai-joke-bot/) | A joke bot built on OpenAI's Next.js quickstart, with streaming | Next.js, OpenAI |
| 10 | [Agentic app research and proposal](10-agentic-proposal/) | LaTeX report on five agentic apps and the StudyPilot proposal, plus the agent-hijacking video reflection | LaTeX |
| 11 | [Lab 7: SPA frameworks](11-lab7-spa-frameworks/) | One app built seven ways: vanilla, Vue, Svelte, Solid, Preact, Lit and Qwik | Vite |
| 12 | [Python + OpenAI notebook](12-python-openai-notebook/) | Jupyter notebook working with the OpenAI API from Python (text, images and audio) | Python, OpenAI |
| 13 | [Lab 8: ADK blogger agent](13-lab8-adk-blogger-agent/) | A multi-agent blogger (planner and writer loop agents with validators) | Python, Google ADK |
| 14 | [Kaggle AI Agents course](14-kaggle-ai-agents-course/) | Setup and progress for Google's 5-Day AI Agents Intensive | Antigravity, AI Studio |
| P1 | [**StudyPilot**](project-1-studypilot/) | AI study-planning agent (see above) | Express, Gemini |

## Running things

Each folder is self-contained. Node projects run with `npm install` then `npm start`, and Python projects have a `requirements.txt`. Projects that call an AI model need a key in a local `.env` file. Copy `.env.example` to `.env` where there is one.

> **No API keys are committed.** `.env` files are gitignored, and keys that appeared in notebook output were replaced with `REDACTED_API_KEY`.

Code in 09 builds on [openai/openai-quickstart-node](https://github.com/openai/openai-quickstart-node) (MIT). Lab handouts and course slides belong to the instructor and are not included.
