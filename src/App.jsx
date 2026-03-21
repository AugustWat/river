import React, { useState } from "react";
import PracticeQuiz from "./PracticeQuiz";
import MagicCard from "./MagicCard";

const QuestionPaperGenerator = () => {
  const [appState, setAppState] = useState("input");

  const [formData, setFormData] = useState({
    syllabus: null,
    pyq1: null,
    pyq2: null,
    examType: "Mid Sem",
    semester: "1",
    subject: "",
    degreeType: "B.Tech",
    extraInstructions: "",
  });

  const [generationType, setGenerationType] = useState("paper");
  // Changed from generatedPaper to generatedContent to handle both formats
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleGenerate = (e, type) => {
    e.preventDefault();
    setGenerationType(type);
    setAppState("processing");

    // Simulated API call to backend Node server
    setTimeout(() => {
      if (type === "quiz") {
        // If it's a quiz, we return an array of question objects to pass to PracticeQuiz.jsx
        setGeneratedContent([
          {
            question:
              "Based on the uploaded syllabus, which data structure is best for LIFO operations?",
            options: ["Queue", "Linked List", "Stack", "Tree"],
            correctAnswer: 2,
          },
          {
            question:
              "According to the PYQs, what concept is tested most frequently in Section B?",
            options: [
              "Binary Search",
              "Dynamic Programming",
              "Graph Traversals",
              "Sorting Arrays",
            ],
            correctAnswer: 1,
          },
          {
            question:
              "What is the time complexity of searching in a perfectly balanced Binary Search Tree?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            correctAnswer: 2,
          },
        ]);
      } else {
        // If it's a paper, summary, or bullets, we return the standard document object
        setGeneratedContent({
          title: `${formData.subject} - ${formData.examType} ${type.toUpperCase()}`,
          instructions: "Read the generated content carefully.",
          sections: [
            {
              name: "Generated Content Output",
              questions: [
                "This is a placeholder.",
                `You clicked the '${type}' button.`,
                "Once the backend is hooked up, this will display your prediction papers, summaries, or bullet points!",
              ],
            },
          ],
        });
      }

      setAppState("output");
    }, 3500);
  };

  const handleDownload = () => {
    alert("Downloading PDF...");
  };

  const handleRegenerate = () => {
    setAppState("processing");
    setTimeout(() => setAppState("output"), 3000);
  };

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-200"
      style={{
        backgroundColor: "#000000",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(50, 0, 0, 0.2) 0%, transparent 60%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* We hide this main wrapper if the user is actively taking a quiz */}
      {!(appState === "output" && generationType === "quiz") && (
        <MagicCard className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-red-950 via-red-900 to-black px-6 py-4 border-b border-red-800/50">
            <h1 className="text-2xl font-bold text-white text-center tracking-wide">
              CollegeStudyBuddy
            </h1>
          </div>

          <div className="p-8">
            {/* --- INPUT LAYER --- */}
            {appState === "input" && (
              <form className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload Syllabus (PDF/TXT)
                      </label>
                      <input
                        type="file"
                        name="syllabus"
                        onChange={handleInputChange}
                        className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400"
                        required
                      />
                    </div>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        PYQ Paper 1 (PDF/TXT)
                      </label>
                      <input
                        type="file"
                        name="pyq1"
                        onChange={handleInputChange}
                        className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400"
                        required
                      />
                    </div>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        PYQ Paper 2 (PDF/TXT)
                      </label>
                      <input
                        type="file"
                        name="pyq2"
                        onChange={handleInputChange}
                        className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <hr className="border-gray-800" />

                  <h3 className="text-lg font-semibold text-gray-100">
                    Exam Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Subject Name
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border placeholder-gray-600 transition"
                        placeholder="e.g., Data Structures"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Degree Type
                      </label>
                      <select
                        name="degreeType"
                        value={formData.degreeType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border transition [&>option]:bg-gray-900"
                      >
                        <option>B.Tech</option>
                        <option>B.Sc</option>
                        <option>BCA</option>
                        <option>BA</option>
                        <option>B.Com</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Exam Type
                      </label>
                      <select
                        name="examType"
                        value={formData.examType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border transition [&>option]:bg-gray-900"
                      >
                        <option>Mid Sem</option>
                        <option>End Sem</option>
                        <option>Class Test</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Semester
                      </label>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border transition [&>option]:bg-gray-900"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            Semester {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Extra Instructions (Format changes, focus areas, etc.)
                    </label>
                    <textarea
                      name="extraInstructions"
                      value={formData.extraInstructions}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border placeholder-gray-600 transition"
                      placeholder="e.g., Make sure to include more numericals this year. Section C should have compulsory questions."
                    />
                  </div>
                </div>

                <div className="w-full lg:w-64 flex flex-col justify-center gap-4 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-800 lg:pl-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 lg:text-left text-center">
                    Generate
                  </h3>

                  <button
                    onClick={(e) => handleGenerate(e, "summary")}
                    className="w-full px-5 py-3 rounded-md font-semibold text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition duration-300"
                  >
                    3-Line Summary
                  </button>
                  <button
                    onClick={(e) => handleGenerate(e, "bullets")}
                    className="w-full px-5 py-3 rounded-md font-semibold text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition duration-300"
                  >
                    Bullet Points
                  </button>
                  <button
                    onClick={(e) => handleGenerate(e, "quiz")}
                    className="w-full px-5 py-3 rounded-md font-semibold text-sm border border-red-900/50 text-red-400 bg-red-950/20 hover:bg-red-900/40 hover:text-red-300 transition duration-300"
                  >
                    Practice Quiz
                  </button>
                  <button
                    onClick={(e) => handleGenerate(e, "paper")}
                    className="w-full mt-4 bg-red-600 text-white px-5 py-4 rounded-md font-bold tracking-wide hover:bg-red-700 transition duration-300 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]"
                  >
                    Prediction Paper
                  </button>
                </div>
              </form>
            )}

            {/* --- PROCESSING LAYER --- */}
            {appState === "processing" && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-6"></div>
                <h2 className="text-xl font-semibold text-gray-100 tracking-wide">
                  Generating your{" "}
                  {generationType === "paper"
                    ? "Prediction Paper"
                    : generationType}
                  ...
                </h2>
                <div className="text-red-400 mt-4 space-y-2 text-center text-sm font-mono bg-red-950/30 p-4 rounded-md border border-red-900/30">
                  <p className="animate-pulse">
                     Extracting & Cleaning Content...
                  </p>
                  <p className="animate-pulse delay-75">
                     Analyzing Context via AI...
                  </p>
                  <p className="animate-pulse delay-150">
                     Formatting Output...
                  </p>
                </div>
              </div>
            )}

            {/* --- NON-QUIZ OUTPUT LAYER --- */}
            {appState === "output" &&
              generationType !== "quiz" &&
              generatedContent && (
                <div className="space-y-6">
                  <div className="bg-black/40 border border-gray-700 rounded-lg p-8 shadow-inner print:shadow-none print:border-none print:bg-white print:text-black">
                    <div className="text-center mb-8 border-b border-gray-700 pb-4">
                      <h2 className="text-2xl font-bold uppercase text-gray-100">
                        {generatedContent.title}
                      </h2>
                      <p className="text-red-400 mt-2 italic font-mono text-sm">
                        Instructions: {generatedContent.instructions}
                      </p>
                    </div>

                    {generatedContent.sections.map((section, idx) => (
                      <div key={idx} className="mb-8">
                        <h3 className="text-lg font-bold text-red-100 mb-4 bg-red-950/50 border border-red-900/50 px-4 py-2 rounded-md">
                          {section.name}
                        </h3>
                        {/* If it's bullets, show dots (list-disc). Otherwise, show numbers (list-decimal) */}
                        <ul
                          className={`${generationType === "bullets" ? "list-disc" : "list-decimal"} pl-6 space-y-4 text-gray-300`}
                        >
                          {section.questions.map((q, qIdx) => (
                            <li key={qIdx} className="pl-2 leading-relaxed">
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center border-t border-gray-800 pt-6">
                    <button
                      onClick={() => setAppState("input")}
                      className="px-6 py-2 border border-gray-600 bg-gray-900 rounded-md text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition"
                    >
                      ← Back to Menu
                    </button>
                    <button
                      onClick={(e) => handleGenerate(e, generationType)}
                      className="px-6 py-2 border border-red-600 text-red-500 bg-red-950/20 rounded-md font-medium hover:bg-red-950/50 hover:text-red-400 transition"
                    >
                       Regenerate
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 transition shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                    >
                       Download PDF
                    </button>
                  </div>
                </div>
              )}
          </div>
        </MagicCard>
      )}

      {/* --- QUIZ OUTPUT LAYER --- */}
      {/* If it's a quiz, we render the PracticeQuiz component outside the main wrapper so styles don't conflict */}
      {appState === "output" && generationType === "quiz" && (
        <PracticeQuiz
          questions={generatedContent}
          onBackToMenu={() => setAppState("input")}
        />
      )}
    </div>
  );
};

export default QuestionPaperGenerator;
