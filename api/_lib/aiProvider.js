import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function sanitizeQuestion(item) {
  if (!item || typeof item !== "object") return null;

  const question = typeof item.question === "string" ? item.question.trim() : "";
  const options = Array.isArray(item.options)
    ? item.options.filter((o) => typeof o === "string").map((o) => o.trim()).slice(0, 4)
    : [];
  const correctAnswer = Number.isInteger(item.correctAnswer) ? item.correctAnswer : -1;

  if (!question) return null;
  if (options.length !== 4) return null;
  if (correctAnswer < 0 || correctAnswer > 3) return null;

  return { question, options, correctAnswer };
}

function extractJsonArray(text) {
  if (typeof text !== "string") return null;

  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // continue and try bracket extraction
  }

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;

  const slice = cleaned.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function buildQuizPrompt({ subject, questionCount, instructions = "" }) {
  return [
    `Generate exactly ${questionCount} multiple-choice questions for subject: ${subject}.`,
    "Output strictly as a JSON array.",
    "Each item must be: { question: string, options: [string, string, string, string], correctAnswer: 0|1|2|3 }.",
    "No markdown fences. No extra keys. No prose.",
    instructions ? `Additional instructions: ${instructions}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateQuizQuestions({ subject, questionCount, instructions = "" }) {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (provider !== "gemini") {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }

  const apiKey = getRequiredEnv("GEMINI_API_KEY");
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = buildQuizPrompt({ subject, questionCount, instructions });
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.() || "";

  const rawArray = extractJsonArray(text);
  if (!rawArray) {
    throw new Error("AI response was not valid JSON array.");
  }

  const sanitized = rawArray.map(sanitizeQuestion).filter(Boolean);

  if (sanitized.length < questionCount) {
    throw new Error(`AI returned insufficient valid questions (${sanitized.length}/${questionCount}).`);
  }

  return sanitized.slice(0, questionCount);
}
