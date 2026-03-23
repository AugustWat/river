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
- **Logging context & Error Swallowing:** Context logs on the frontend (React component lifecycles) are in the browser DevTools. For anything running inside `api/`, check the CLI terminal window running `vercel dev`. **Crucial:** Vercel functions locally will often swallow exceptions if they are heavily `try/catch`ed for JSON responses but not explicitly logged. Always include `console.error("Context:", error);` inside catch blocks of API handlers to ensure stack traces appear in the CLI.

- **Environment Variables:** All secrets and provider-specific configs (e.g., `GEMINI_API_KEY`, `GEMINI_MODEL`) are stored in `.env` and accessed via `process.env`. Never hardcode these values in the codebase.

# Design System Strategy: The Kinetic Interface

## 1. Overview & Creative North Star
The Creative North Star for this system is **"The Kinetic Architect."** We are moving beyond the cliché "80s retro" cyberpunk to a high-fidelity, weaponized digital aesthetic. It represents a high-energy, technical environment where data isn't just displayed—it’s projected.

To break the "template" look, we abandon the standard centered grid in favor of **Intentional Asymmetry**. Large-scale `display-lg` typography should bleed off the edges of containers, and UI elements should feel like modular components of a larger machine. We use overlapping "Holographic Panes" (semi-transparent layers) and technical "Scanlines" to create a sense of depth and constant data-flow. This is an editorial take on a digital frontier: aggressive, precise, and premium.

## 2. Colors & Visual Soul
The palette is built on the tension between the void (`background: #131313`) and the spark (`primary_container: #00f0ff`). 

*   **Primary (Electric Neon):** Use `primary_fixed_dim` (#00dbe9) for interactive states. It is the "energy source" of the UI.
*   **The Stark White Punch:** `tertiary` (#fff3f3) and `on_surface` (#e5e2e1) are not just text colors. Use them as high-contrast structural accents—slashes of pure light that cut through the neon.
*   **The "No-Line" Rule:** Standard 1px solid borders are strictly prohibited for layout sectioning. Separation is achieved through background shifts using the `surface-container` tiers or "Light-Leaks" (subtle gradients).
*   **Surface Hierarchy & Nesting:** 
    *   **Level 0 (The Void):** `surface_container_lowest` (#0e0e0e) for the deepest background layers.
    *   **Level 1 (The Deck):** `surface` (#131313) for the main application canvas.
    *   **Level 2 (The Modules):** `surface_container_high` (#2a2a2a) for active containers. 
*   **The Glass & Gradient Rule:** Interactive elements should utilize a "Holographic Glass" effect. Use `surface_variant` at 40% opacity with a `backdrop-blur` of 20px. For CTAs, apply a linear gradient from `primary` (#dbfcff) to `primary_container` (#00f0ff) at a 45-degree angle to simulate glowing light.

## 3. Typography: Technical Precision
We utilize a dual-typeface system to balance "Data-Stream" aesthetics with professional readability.

*   **Display & Headlines (Space Grotesk):** This is our "Technical" voice. It is sharp, geometric, and high-contrast. Use `display-lg` (3.5rem) with `-0.05em` letter spacing for a compact, aggressive "Header" feel. 
*   **Body & Titles (Inter):** Our "Functional" voice. Inter provides the necessary neutral ground to prevent the UI from becoming illegible. 
*   **Hierarchy as Identity:** Use `label-sm` (Space Grotesk) in ALL CAPS with `0.15em` letter spacing for metadata and technical callouts. This mimics the "Readout" text seen in HUDs.

## 4. Elevation & Depth
In this system, depth is not simulated by physical shadows, but by **Photonic Intensity.**

*   **The Layering Principle:** Stack `surface_container_highest` (#353534) elements on top of `surface_dim` (#131313) to create a "lifted" module.
*   **Ambient Shadows (Glows):** Replace drop shadows with "Neon Bleed." When an element is focused, apply a box-shadow using `primary_container` (#00f0ff) at 15% opacity with a 30px blur. It should look like the component is illuminating the surface beneath it.
*   **The "Ghost Border" Fallback:** If a boundary is required for a form or input, use `outline_variant` (#3b494b) at 20% opacity. 
*   **Glitch Accents:** Use 1px wide "Data-Strips" of `tertiary_fixed` (#ffdadb) positioned at the top-left or bottom-right of a container to simulate a momentary digital glitch/alignment mark.

## 5. Components

### Buttons
*   **Primary:** No rounded corners (`0px`). Background: `primary_container`. Text: `on_primary_fixed` (Bold). On hover, add a `primary` outer glow.
*   **Secondary:** Ghost style. `outline` border at 30% opacity. Text: `primary`. 
*   **Tertiary (The "White Punch"):** Background: `tertiary`. Text: `on_tertiary` (Deep Red). Use this for high-priority destructive actions or "System Overrides."

### Cards & Modules
*   **Structure:** Absolutely no dividers. Separate content using `spacing: 8` (1.75rem) blocks or by nesting a `surface_container_highest` block inside a `surface_container_low` canvas.
*   **Visual Flair:** Add a 2px vertical accent bar of `primary` to the left edge of cards to denote "Active Data."

### Input Fields
*   **Style:** Underline only. Use `outline` (#849495) for the base and transition to `primary_container` (#00f0ff) on focus. 
*   **Helper Text:** Use `label-sm` in `primary_fixed` to make technical instructions feel like system prompts.

### Holographic Overlays (Special Component)
*   For modals or tooltips, use a background of `surface_bright` at 60% opacity with a 2px "Scanline" pattern (a repeating linear gradient of 1px lines). This creates the "Neural Architect" HUD vibe.

## 6. Do’s and Don’ts

### Do:
*   **Do** embrace the "0px" roundedness scale. Everything is sharp, cut, and industrial.
*   **Do** use asymmetrical spacing. A wider left-side margin for a title creates a sophisticated editorial tension.
*   **Do** use the `tertiary` (White) for small, intense icons or bullet points to "pop" against the dark background.

### Don't:
*   **Don't** use soft shadows or rounded corners. It breaks the "Technical Precision" of the system.
*   **Don't** use standard 1px grey dividers. They make the UI look like a generic dashboard. Use white space or tonal shifts.
*   **Don't** over-saturate. Keep the background deep and obsidian (`surface_container_lowest`) so the neon elements feel like they are truly glowing.
