import { generatePredictionPaper } from "../_lib/aiProvider.js";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => resolve(data ? JSON.parse(data) : {}));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await parseBody(req);
    
    if (!body.subject) {
      return sendJson(res, 400, { error: "`subject` is required." });
    }

    const paperContent = await generatePredictionPaper({
      subject: body.subject,
      degreeType: body.degreeType || "B.Tech",
      examType: body.examType || "Mid Sem",
      semester: body.semester || "1",
      extraInstructions: body.extraInstructions || ""
    });

    return sendJson(res, 200, { paper: paperContent });
  } catch (error) {
    console.error("Paper Gen Error:", error);
    return sendJson(res, 500, { error: error.message || "Unexpected server error" });
  }
}
