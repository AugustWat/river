# StudyAlly (Exabyte) Developer Guide

## Architecture & Conventions
- **Unified Deployment Model:** This is a monolithic repository deploying both a React/Vite frontend (`src/`) and Serverless backend (`api/`) as a single Vercel application.
- **API Routing:** Backend logic lives in the `api/` directory using Node.js serverless functions. Route handlers are responsible for parsing parameters and catching errors, but delegate heavy lifting (e.g., `api/quiz/generate.js`). Avoid creating standalone Express servers.

## AI Provider Pattern & Workflows
- **Provider Routing:** Never hardcode AI SDKs directly in the API route handlers. All LLM business logic is funneled through the router at `api/_lib/aiProvider.js`. 
- **Pluggable Implementations:** Specific integration logic lives in corresponding files (e.g., `geminiAIProvider.js`, `lmstudioAIProvider.js`). When creating a new AI feature, implement the capability in *each* provider file, and explicitly add it to the `export const` block in `aiProvider.js`.
- **Constrained Decoding (Crucial):** Always enforce structured JSON outputs natively at the AI SDK layer. Use enforced schema configurations like `responseSchema` in generationConfig or `response_format: { type: "json_schema", strict: true }`. We *do not* rely on prompt-level fuzzy string extraction ("Output as JSON").
- **State Normalization:** Data sanitization and mapping from the AI's strict JSON schema to the frontend's expected state (e.g., extracting `"quiz questions"` arrays to generic arrays, mapping `questions` -> `question`) occurs completely inside the AI Provider functions.

## Dev Workflows & Tooling
- **Local Application Server:** Do *not* rely purely on `npm run dev`. To successfully emulate the routing environment where the Vite frontend and API endpoints share the host, always spin up your dev environment using:
  ```bash
  npx vercel dev
  ```
- **Logging context:** Context logs on the frontend (React component lifecycles) are in the browser DevTools. For anything running inside `api/`, check the CLI terminal window running `vercel dev`.

- **Environment Variables:** All secrets and provider-specific configs (e.g., `GEMINI_API_KEY`, `GEMINI_MODEL`) are stored in `.env` and accessed via `process.env`. Never hardcode these values in the codebase.
