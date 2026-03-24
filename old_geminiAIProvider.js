import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";

const quizSchema = {
  type: SchemaType.OBJECT,
  properties: {
    "quiz questions": {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questions: {
            type: SchemaType.STRING
          },
          options: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.STRING
            }
          },
          correctAnswer: {
            type: SchemaType.NUMBER
          }
        },
        propertyOrdering: [
          "questions",
          "options",
          "correctAnswer"
        ]
      }
    }
  },
  propertyOrdering: [
    "quiz questions"
  ]
};

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function sanitizeQuestion(item) {
  if (!item || typeof item !== "object") return null;

  const question = typeof item.questions === "string" ? item.questions.trim() : "";
  const options = Array.isArray(item.options)
    ? item.options.filter((o) => typeof o === "string").map((o) => o.trim()).slice(0, 4)
    : [];
  const correctAnswer = Number.isInteger(item.correctAnswer) ? item.correctAnswer : -1;

  if (!question) return null;
  if (options.length !== 4) return null;
  if (correctAnswer < 0 || correctAnswer > 3) return null;

  return { question, options, correctAnswer };
}

function buildQuizPrompt({ subject, questionCount, instructions = "" }) {
  return [
    `Generate exactly ${questionCount} multiple-choice questions for subject: ${subject}.`,
    "Strictly follow the JSON schema.",
    instructions ? `Additional instructions: ${instructions}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateQuizQuestions({ subject, questionCount, instructions = "" }) {
  const apiKey = getRequiredEnv("GEMINI_API_KEY");
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    },
  });

  const prompt = buildQuizPrompt({ subject, questionCount, instructions });
  console.log(prompt);
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.() || "{}";

  let rawData;
  try {
    rawData = JSON.parse(text);
  } catch (err) {
    throw new Error("AI response was not valid JSON.");
  }

  const rawArray = rawData["quiz questions"];
  if (!Array.isArray(rawArray)) {
    throw new Error("AI response did not contain the 'quiz questions' array.");
  }

  const sanitized = rawArray.map(sanitizeQuestion).filter(Boolean);

  if (sanitized.length < questionCount) {
    throw new Error(`AI returned insufficient valid questions (${sanitized.length}/${questionCount}).`);
  }

  return sanitized.slice(0, questionCount);
}

export async function generateChatResponse({ messages }) {
  const apiKey = getRequiredEnv("GEMINI_API_KEY");
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Create model with system instruction
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: "You are an AI Study Ally. Answer questions and be precise and to the point. Do not be overly chatty.",
  });

  // Map messages to Gemini format
  // frontend uses: { role: 'user' | 'ai', content: '...' }
  // gemini uses: { role: 'user' | 'model', parts: [{ text: '...' }] }
  const contents = messages.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const result = await model.generateContent({ contents });
  return result?.response?.text?.() || "";
}