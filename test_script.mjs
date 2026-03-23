import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCGBruhS740SP8hkihL2Bvo3M9EH9R842U");

// 1. Define your schema structure
const schema = {
  description: "List of recommended travel destinations",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      destination: {
        type: SchemaType.STRING,
        description: "Name of the city and country",
        nullable: false,
      },
      best_time_to_visit: {
        type: SchemaType.STRING,
        description: "The ideal month or season",
        nullable: false,
      },
      estimated_budget: {
        type: SchemaType.NUMBER,
        description: "Estimated daily cost in USD",
        nullable: false,
      },
    },
    required: ["destination", "best_time_to_visit", "estimated_budget"],
  },
};

async function getStructuredData() {
  // 2. Pass the schema in generationConfig
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = "Suggest 3 budget-friendly travel spots in Europe.";
  const result = await model.generateContent(prompt);
  
  // 3. Parse the response (it will be a valid JSON string)
  const output = JSON.parse(result.response.text());
  console.log(output);
}

getStructuredData();
