const DEFAULT_URL = "http://localhost:1234/v1/chat/completions";
const DEFAULT_MODEL = "local-model";

const quizSchema = {
  type: "object",
  properties: {
    "quiz questions": {
      type: "array",
      items: {
        type: "object",
        properties: {
          questions: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" }
          },
          correctAnswer: { type: "number" }
        },
        required: ["questions", "options", "correctAnswer"],
        additionalProperties: false
      }
    }
  },
  required: ["quiz questions"],
  additionalProperties: false
};

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
  const apiUrl = process.env.LMSTUDIO_API_URL || DEFAULT_URL;
  const modelName = process.env.LMSTUDIO_MODEL || DEFAULT_MODEL;

  const prompt = buildQuizPrompt({ subject, questionCount, instructions });

  const payload = {
    model: modelName,
    messages: [
      { role: "system", content: "You are a helpful AI that generates quiz questions strictly according to the provided JSON schema." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "quiz_format",
        schema: quizSchema,
        strict: true
      }
    }
  };

  console.log("Sending request to LM Studio API...");
  
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
  }

  const resultData = await response.json();
  const content = resultData.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("LM Studio returned an empty response.");
  }

  let rawData;
  try {
    rawData = JSON.parse(content);
  } catch (err) {
    throw new Error("AI response was not valid JSON. Response was: " + content);
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
  const apiUrl = process.env.LMSTUDIO_API_URL || DEFAULT_URL;
  const modelName = process.env.LMSTUDIO_MODEL || DEFAULT_MODEL;

  // Map messages to OpenAI format
  // frontend uses: { role: 'user' | 'ai', content: '...' }
  // openai uses: { role: 'user' | 'assistant', content: '...' }
  const formattedMessages = messages.map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.content
  }));

  const payload = {
    model: modelName,
    messages: [
      { role: "system", content: "You are an AI Study Ally. Answer questions and be precise and to the point. Do not be overly chatty." },
      ...formattedMessages
    ],
    temperature: 0.7
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
  }

  const resultData = await response.json();
  const content = resultData.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("LM Studio returned an empty response.");
  }

  return content;
}
