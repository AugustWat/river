import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const DEFAULT_MODEL = "gemini-2.5-flash"; // Switched to 2.5-flash as it supports PDFs and multimodal inputs

// ==========================================
// SCHEMAS
// ==========================================

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

const paperSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "The title of the exam paper, e.g., 'Mid-Semester Examination: Data Structures'"
    },
    instructions: {
      type: SchemaType.STRING,
      description: "General instructions for the exam, e.g., 'Answer all questions. Time allotted: 2 Hours.'"
    },
    sections: {
      type: SchemaType.ARRAY,
      description: "The sections of the exam paper (e.g., Section A, Section B)",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: {
            type: SchemaType.STRING,
            description: "Name of the section, e.g., 'Section A: Short Answer Questions (2 Marks each)'"
          },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.STRING,
              description: "The actual question text"
            }
          }
        },
        propertyOrdering: ["name", "questions"]
      }
    }
  },
  propertyOrdering: ["title", "instructions", "sections"]
};


// ==========================================
// UTILITY FUNCTIONS
// ==========================================

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

// Helper function to upload files to Google
async function uploadToGoogle(fileManager, filePath, mimeType) {
  try {
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: "User Uploaded Document",
    });
    return uploadResult.file;
  } catch (error) {
    console.error("Failed to upload file to Google AI:", error);
    return null;
  }
}

// ==========================================
// EXPORTED GENERATION FUNCTIONS
// ==========================================

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
  console.log("Generating Quiz for:", subject);
  
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

export async function generatePredictionPaper(params) {
  const apiKey = getRequiredEnv("GEMINI_API_KEY");
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL; 

  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: paperSchema,
    },
  });

  // 1. Process uploaded files
  const fileParts = [];
  if (params.files && params.files.length > 0) {
    console.log(`Uploading ${params.files.length} files to Gemini...`);
    for (const file of params.files) {
      // formidable creates a temporary file on the server, accessible via file.filepath
      const gFile = await uploadToGoogle(fileManager, file.filepath, file.mimetype || "application/pdf");
      if (gFile) {
        fileParts.push({
          fileData: {
            mimeType: gFile.mimeType,
            fileUri: gFile.uri
          }
        });
      }
    }
  }

  // 2. Build the text prompt
  const hasFiles = fileParts.length > 0;
  const promptText = buildPaperPrompt({ ...params, hasFiles });
  
  // 3. Combine files and text for the AI (multimodal array)
  const aiPayload = [...fileParts, promptText];

  console.log("Generating Paper for:", params.subject, "with", fileParts.length, "files.");
  
  const result = await model.generateContent(aiPayload);
  const text = result?.response?.text?.() || "{}";

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("AI response was not valid JSON for the prediction paper.");
  }
}