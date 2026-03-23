import { generateChatResponse } from "../_lib/aiProvider.js";

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
      if (data.length > 2_000_000) {
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
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (messages.length === 0) {
    return { error: "`messages` array is required and cannot be empty." };
  }

  // Basic validation that each message has a role and content
  for (const msg of messages) {
    if (typeof msg !== 'object' || !msg.role || !msg.content) {
      return { error: "Each message must be an object with 'role' and 'content' string properties." };
    }
    if (msg.role !== 'user' && msg.role !== 'ai') {
      return { error: "Message roles must be either 'user' or 'ai'." };
    }
  }

  return { messages };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await parseBody(req);
    console.log('=> Received backend request to /api/chat/send', { path: req.url, method: req.method, messagesCount: body.messages?.length });
    
    const validated = validateInput(body);

    if (validated.error) {
      return sendJson(res, 400, { error: validated.error });
    }

    const reply = await generateChatResponse(validated);

    return sendJson(res, 200, { reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Chat API Error:", error);
    return sendJson(res, 500, { error: message });
  }
}
