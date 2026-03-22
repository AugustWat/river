# StudyAlly (Vite + React + In-App API)

This app serves both UI and API from the same deployment.

- UI example: `/`
- API example: `/api/quiz/generate`

## Implemented API

### `POST /api/quiz/generate`

Request body (JSON):

```json
{
	"subject": "Data Structures",
	"questionCount": 10,
	"instructions": "Focus on stack and queue problems"
}
```

Response body:

```json
{
	"questions": [
		{
			"question": "...",
			"options": ["...", "...", "...", "..."],
			"correctAnswer": 2
		}
	]
}
```

## Environment variables

Set these in `.env`:

```dotenv
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
# Optional
GEMINI_MODEL=gemini-1.5-flash
VITE_API_BASE_URL=/api/quiz
```

## Local development

For frontend-only dev:

```bash
npm run dev
```

For unified UI + `/api/*` behavior locally (same host semantics), run with Vercel CLI:

```bash
npx vercel dev
```
