import * as geminiProvider from "./geminiAIProvider.js";
import * as lmstudioProvider from "./lmstudioAIProvider.js";

const providerName = (process.env.AI_PROVIDER || "gemini").toLowerCase();

let activeProvider;
if (providerName === "gemini") {
  activeProvider = geminiProvider;
} else if (providerName === "lmstudio") {
  activeProvider = lmstudioProvider;
} else {
  throw new Error(`Unsupported AI_PROVIDER: ${providerName}`);
}

export const {
  generateQuizQuestions,
  generateChatResponse,
  // Add more AI functions here in the future (e.g., evaluateQuiz, etc)
} = activeProvider;
