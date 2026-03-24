import { generateQuizQuestions } from "../_lib/aiProvider.js";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }

    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function validateInput(body) {
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const questionCount = Number.parseInt(body.questionCount, 10);
  const instructions = typeof body.instructions === "string" ? body.instructions.trim() : "";

  if (!subject) return { error: "`subject` is required." };
  if (!Number.isFinite(questionCount) || questionCount < 1 || questionCount > 50) {
    return { error: "`questionCount` must be an integer between 1 and 50." };
  }

  return { subject, questionCount, instructions };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await parseBody(req);
    console.log('=> Received backend request to /api/quiz/generate', { path: req.url, method: req.method, body });
    const validated = validateInput(body);

    if (validated.error) {
      return sendJson(res, 400, { error: validated.error });
    }

    const questions = await generateQuizQuestions(validated);

    return sendJson(res, 200, { questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return sendJson(res, 500, { error: message });
  }
}
