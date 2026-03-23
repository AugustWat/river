import { generatePredictionPaper } from "../_lib/aiProvider.js";
import formidable from "formidable";

// Required to allow formidable to parse multipart form data instead of Next.js/Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    // 1. Parse the incoming Multipart Form Data (Text + Files)
    const form = formidable({ multiples: true, keepExtensions: true });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const subject = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
    if (!subject) {
      return sendJson(res, 400, { error: "`subject` is required." });
    }

    // 2. Collect uploaded physical files into an array
    const uploadedFiles = [];
    if (files.syllabus) uploadedFiles.push(Array.isArray(files.syllabus) ? files.syllabus[0] : files.syllabus);
    if (files.pyq1) uploadedFiles.push(Array.isArray(files.pyq1) ? files.pyq1[0] : files.pyq1);
    if (files.pyq2) uploadedFiles.push(Array.isArray(files.pyq2) ? files.pyq2[0] : files.pyq2);

    // 3. Send text data and file paths to Gemini
    const paperContent = await generatePredictionPaper({
      subject: subject,
      degreeType: (Array.isArray(fields.degreeType) ? fields.degreeType[0] : fields.degreeType) || "B.Tech",
      examType: (Array.isArray(fields.examType) ? fields.examType[0] : fields.examType) || "Mid Sem",
      semester: (Array.isArray(fields.semester) ? fields.semester[0] : fields.semester) || "1",
      extraInstructions: (Array.isArray(fields.extraInstructions) ? fields.extraInstructions[0] : fields.extraInstructions) || "",
      files: uploadedFiles // <-- Passing the files to our AI Provider!
    });

    return sendJson(res, 200, { paper: paperContent });
  } catch (error) {
    console.error("Paper Gen Error:", error);
    return sendJson(res, 500, { error: error.message || "Unexpected server error" });
  }
}