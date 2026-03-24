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

const paperSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    instructions: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          questions: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["name", "questions"],
        additionalProperties: false
      }
    }
  },
  required: ["title", "instructions", "sections"],
  additionalProperties: false
};

const scheduleSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    instructions: { type: "string" },
    schedule: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "number" },
          focus: { type: "string" },
          tasks: { 
            type: "array",
            items: { type: "string" }
          },
          hours: { type: "string" }
        },
        required: ["day", "focus", "tasks", "hours"],
        additionalProperties: false
      }
    }
  },
  required: ["title", "instructions", "schedule"],
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

function buildPaperPrompt({ subject, degreeType, examType, semester, extraInstructions, hasFiles }) {
  let prompt = `You are an expert university professor. Generate a highly probable prediction exam paper for the following criteria:
    - Subject: ${subject}
    - Degree Type: ${degreeType}
    - Semester: ${semester}
    - Exam Type: ${examType}\n\n`;

  if (hasFiles) {
    prompt += `I have attached the syllabus and/or past year questions (PYQs) as reference files. STRONGLY base the generated questions on the topics and difficulty level found in these documents.\n\n`;
  }

  prompt += `Structure the paper realistically with appropriate sections (e.g., short answer, long answer/essay).
    ${extraInstructions ? `Additional Instructions: ${extraInstructions}` : ""}
    
    Strictly output the response matching the provided JSON schema.`;

  return prompt.trim();
}

function buildSchedulePrompt({ subject, days, degreeType, examType, semester, extraInstructions, hasFiles }) {
  let prompt = `You are an expert AI study planner. Generate a highly effective ${days}-day study schedule for the following criteria:
    - Subject: ${subject}
    - Days to Prepare: ${days}
    - Degree Type: ${degreeType}
    - Semester: ${semester}
    - Exam Type: ${examType}\n\n`;

  if (hasFiles) {
    prompt += `I have attached the syllabus and/or past year questions (PYQs) as reference files. Prioritize chapters and topics heavily weighted in these documents.\n\n`;
  }

  prompt += `Break the study plan into exactly ${days} daily schedules. Ensure the workload is progressive and includes revision days or mock test days if appropriate. Include realistic hours recommendations per day.
    ${extraInstructions ? `Additional Instructions: ${extraInstructions}` : ""}
    
    Strictly output the response matching the provided JSON schema.`;

  return prompt.trim();
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

export async function generatePredictionPaper(params) {
  const apiUrl = process.env.LMSTUDIO_API_URL || DEFAULT_URL;
  const modelName = process.env.LMSTUDIO_MODEL || DEFAULT_MODEL;

  const hasFiles = Boolean(params.files && params.files.length > 0);
  const prompt = buildPaperPrompt({ ...params, hasFiles });

  const payload = {
    model: modelName,
    messages: [
      { role: "system", content: "You are a helpful AI that generates prediction papers strictly according to the provided JSON schema. Note: Direct file uploads and processing are completely unsupported by this API. Assume user inputs accurately represent their context." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "paper_format",
        schema: paperSchema,
        strict: true
      }
    }
  };

  console.log("Sending request to LM Studio API for Prediction Paper...");

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
    throw new Error("AI response was not valid JSON for the prediction paper. Response was: " + content);
  }

  // Ensure sections array exists
  if (!Array.isArray(rawData.sections)) {
    throw new Error("AI response did not contain the 'sections' array.");
  }

  return rawData;
}

export async function generateStudySchedule(params) {
  const apiUrl = process.env.LMSTUDIO_API_URL || DEFAULT_URL;
  const modelName = process.env.LMSTUDIO_MODEL || DEFAULT_MODEL;

  const hasFiles = Boolean(params.files && params.files.length > 0);
  const prompt = buildSchedulePrompt({ ...params, hasFiles });

  const payload = {
    model: modelName,
    messages: [
      { role: "system", content: "You are a helpful AI that generates study schedules strictly according to the provided JSON schema. Note: Direct file uploads and processing are completely unsupported by this API. Assume user inputs accurately represent their context." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "schedule_format",
        schema: scheduleSchema,
        strict: true
      }
    }
  };

  console.log(`Sending request to LM Studio API for ${params.days}-Day Schedule...`);

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
    throw new Error("AI response was not valid JSON for the study schedule. Response was: " + content);
  }

  if (!Array.isArray(rawData.schedule)) {
    throw new Error("AI response did not contain the 'schedule' array.");
  }

  return rawData;
}
