import React, { useState, useRef, useEffect } from "react";
import PracticeQuiz from "./PracticeQuiz";
import MagicCard from "./MagicCard";
import { AuroraText } from "./AuroraText";
import Footer from "./Footer";

// 🟢 BACKEND SENIORS: Set your API base URL here

const Home = () => {
  const [appState, setAppState] = useState("input");
  const [error, setError] = useState(null); 

  const [formData, setFormData] = useState({
    syllabus: null,
    pyq1: null,
    pyq2: null,
    examType: "Mid Sem",
    semester: "1",
    subject: "",
    degreeType: "B.Tech",
    extraInstructions: "",
    daysToPrepare: 7,
  });

  const [generationType, setGenerationType] = useState("paper");
  const [generatedContent, setGeneratedContent] = useState(null);

  // --- CHAT STATES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", content: "Hi! I'm your AI Study Ally. Ask me any quick questions about your syllabus or topics." }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatScrollRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatTyping]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleScheduleClick = (e) => {
    e.preventDefault();
    setGenerationType("schedule");
    setAppState("ask_days");
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    const updatedMessages = [...chatMessages, userMessage];
    
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatTyping(true);

    try {
      // --- TEMP MOCK (Delete when API is ready) ---
      await new Promise(resolve => setTimeout(resolve, 1500));
      setChatMessages(prev => [...prev, { role: "ai", content: `(Mock API) You asked about ${formData.subject}. Once hooked up, Gemini will answer this!` }]);
      // --------------------------------------------

    } catch (err) {
      console.error("Chat API Error:", err);
      setChatMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting to the server right now." }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const handleGenerate = async (e, type) => {
    e.preventDefault();
    setGenerationType(type);
    setAppState("processing");
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("generationType", type);
      submitData.append("subject", formData.subject);
      submitData.append("degreeType", formData.degreeType);
      submitData.append("examType", formData.examType);
      submitData.append("semester", formData.semester);
      submitData.append("extraInstructions", formData.extraInstructions);
      if (type === "schedule") submitData.append("daysToPrepare", formData.daysToPrepare);

      if (formData.syllabus) submitData.append("syllabus", formData.syllabus);
      if (formData.pyq1) submitData.append("pyq1", formData.pyq1);
      if (formData.pyq2) submitData.append("pyq2", formData.pyq2);

      // --- TEMP MOCK DATA (Delete when API is ready) ---
      await new Promise(resolve => setTimeout(resolve, 2500)); 
      
      if (type === "quiz") {
        setGeneratedContent([
          { question: "Based on the uploaded syllabus, which data structure is best for LIFO?", options: ["Queue", "Linked List", "Stack", "Tree"], correctAnswer: 2 },
          { question: "What concept is tested most frequently in Section B?", options: ["Binary Search", "Dynamic Programming", "Graph Traversals", "Sorting Arrays"], correctAnswer: 1 },
        ]);
      } else if (type === "schedule") {
        const days = parseInt(formData.daysToPrepare, 10);
        setGeneratedContent({
          title: `${formData.subject || 'Subject'} - ${days}-Day AI Study Plan`,
          instructions: "Follow this tailored timeline to maximize your retention.",
          schedule: Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            focus: `Module ${i + 1} Core Concepts`,
            tasks: ["Read textbook chapters", "Watch recommended lectures", "Solve practice numericals"],
            hours: "2-3 hours"
          }))
        });
      } else {
        setGeneratedContent({
          title: `${formData.subject} - ${formData.examType} ${type.toUpperCase()}`,
          instructions: "Read the generated content carefully.",
          sections: [{ name: "Generated Content Output", questions: ["Backend API not connected yet.", "This will show the AI payload once hooked up!"] }],
        });
      }
      // ------------------------------------------------

      setAppState("output");

    } catch (err) {
      console.error("Generation API Error:", err);
      setError(err.message || "An unexpected error occurred during generation.");
      setAppState("input"); 
    }
  };

  const handleDownload = () => alert("Downloading PDF... (Hook up PDF generation library here)");

  const handleRegenerate = () => {
    if (generationType === "schedule") setAppState("ask_days");
    else handleGenerate({ preventDefault: () => {} }, generationType); 
  };

  return (
    <div
      // CHANGED: Removed padding from the outer wrapper so the footer can expand fully
      className="kinetic-theme kinetic-canvas min-h-screen flex flex-col text-gray-200 overflow-x-hidden"
      style={{
        backgroundColor: "#000000",
        backgroundImage: `
          radial-gradient(circle at 15% -10%, rgba(0, 229, 255, 0.18) 0%, transparent 38%),
          radial-gradient(circle at 90% 110%, rgba(255, 81, 250, 0.1) 0%, transparent 44%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* CHANGED: Added a <main> tag to hold the padding and center your cards */}
      <main className="flex-1 flex flex-col items-center justify-start pt-12 pb-20 px-4 sm:px-6 lg:px-12 w-full relative">
        
        <div className="mb-8 text-center z-10 mt-8 lg:mt-0">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-2">
            <AuroraText colors={["#7cf7ff", "#00dbe9", "#ffffff", "#ff51fa"]}>
              StudyAlly
            </AuroraText>
          </h1>
          <p className="text-red-400/80 font-medium tracking-wide text-sm md:text-base">
            AI-Powered Exam Prep Companion
          </p>
        </div>

        <div className="w-[95vw] max-w-7xl mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="kinetic-orb" />
            <span className="neon-pill">System Core Online</span>
            <span className="neon-pill">Neural Mode Active</span>
          </div>
          <div className="neon-pill float-orb">UI Profile: KINETIC_INTERFACE</div>
        </div>

        {error && appState === "input" && (
          <div className="w-[95vw] max-w-7xl mb-4 bg-red-950/50 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span> {error}
            </span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold text-xl">&times;</button>
          </div>
        )}

        {!(appState === "output" && generationType === "quiz") && (
          <MagicCard className="w-[95vw] max-w-7xl min-h-[85vh] flex flex-col mx-auto rounded-3xl overflow-hidden border border-gray-800 bg-black/60 backdrop-blur-xl shadow-2xl shadow-red-900/20 hud-panel hud-grid neon-corner">
            <div className="px-6 md:px-12 py-4 border-b border-cyan-400/20 bg-black/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="kinetic-orb" />
                <span className="text-xs uppercase tracking-[0.2em] text-cyan-200 font-bold">Subject Mastery Interface</span>
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/90">Synchronized pipeline ready</div>
            </div>

            <div className="flex-1 w-full flex flex-col overflow-y-auto p-6 md:p-12 scrollbar-thin scrollbar-thumb-red-900/50 scrollbar-track-transparent scanline-overlay">
              
              {appState === "input" && (
                <form className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-10">
                  <div className="flex-[3] flex flex-col pr-0 lg:pr-6">
                    {/* File Uploads */}
                    <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/90">Data Intake</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Syllabus</label>
                        <input type="file" name="syllabus" onChange={handleInputChange} className="w-full file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400 text-sm" />
                      </div>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                        <label className="block text-sm font-medium text-gray-300 mb-2">PYQ Paper 1</label>
                        <input type="file" name="pyq1" onChange={handleInputChange} className="w-full file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400 text-sm" />
                      </div>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                        <label className="block text-sm font-medium text-gray-300 mb-2">PYQ Paper 2</label>
                        <input type="file" name="pyq2" onChange={handleInputChange} className="w-full file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400 text-sm" />
                      </div>
                    </div>

                    <hr className="border-gray-800 my-6" />

                    {/* Exam Details */}
                    <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-3">
                      <span className="inline-block h-px w-8 bg-cyan-300/70"></span>
                      Exam Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Subject Name</label>
                        <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 border text-sm placeholder-gray-600 transition" placeholder="e.g., Data Structures" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Degree Type</label>
                        <select name="degreeType" value={formData.degreeType} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 p-3 border text-sm transition [&>option]:bg-gray-900">
                          <option>B.Tech</option><option>B.Sc</option><option>BCA</option><option>BA</option><option>B.Com</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Exam Type</label>
                        <select name="examType" value={formData.examType} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 p-3 border text-sm transition [&>option]:bg-gray-900">
                          <option>Mid Sem</option><option>End Sem</option><option>Class Test</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Semester</label>
                        <select name="semester" value={formData.semester} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 p-3 border text-sm transition [&>option]:bg-gray-900">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (<option key={num} value={num}>Semester {num}</option>))}
                        </select>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col mt-6">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Extra Instructions (Format changes, focus areas, etc.)</label>
                      <textarea name="extraInstructions" value={formData.extraInstructions} onChange={handleInputChange} className="flex-1 resize-none block w-full min-h-[120px] rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 border text-sm placeholder-gray-600 transition" placeholder="e.g., Make sure to include more numericals this year. Section C should have compulsory questions." />
                    </div>
                  </div>

                  {/* Right Column / Generation Buttons */}
                  <div className="flex-[1] relative flex flex-col justify-center gap-4 pt-16 lg:pt-0 border-t lg:border-t-0 lg:border-l border-cyan-500/20 lg:pl-10">
                    
                    {/* Floating Chat Button */}
                    <button 
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      type="button" 
                      className="absolute top-0 right-0 w-12 h-12 bg-black/50 backdrop-blur-md border border-red-900 text-red-400 rounded-full flex items-center justify-center hover:bg-red-900/40 hover:text-red-300 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.2)] z-40"
                      title="Ask AI Study Questions"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>

                    {/* Floating Chat Window */}
                    {isChatOpen && (
                      <div className="absolute top-14 right-0 w-80 sm:w-96 h-[450px] bg-black/95 backdrop-blur-xl border border-gray-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden z-50">
                        <div className="bg-gradient-to-r from-red-950 to-black px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                          <span className="font-bold text-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Study Assistant
                          </span>
                          <button type="button" onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>

                        <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                msg.role === "user" ? "bg-red-900 text-red-50 rounded-tr-sm" : "bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm"
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          {isChatTyping && (
                            <div className="flex justify-start">
                              <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3 border-t border-gray-800 bg-gray-900/50 flex gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleChatSubmit(e); }}
                            placeholder="Ask about your syllabus..."
                            className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500"
                          />
                          <button type="button" onClick={handleChatSubmit} disabled={!chatInput.trim() || isChatTyping} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg px-3 py-2 transition flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 lg:text-left text-center">Generate</h3>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80 border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 mb-2">
                      Neural Action Stack
                    </div>
                    
                    <button onClick={handleScheduleClick} className="w-full px-4 py-3.5 rounded-md font-bold text-sm bg-gradient-to-r from-red-900/30 to-black border border-red-800/50 text-red-100 hover:from-red-900/50 hover:to-red-950/30 transition duration-300 shadow-[0_0_10px_rgba(220,38,38,0.1)]">
                      AI Study Schedule 
                    </button>

                    <button onClick={(e) => handleGenerate(e, "summary")} className="w-full px-4 py-3.5 rounded-md font-semibold text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition duration-300">3-Line Summary</button>
                    <button onClick={(e) => handleGenerate(e, "bullets")} className="w-full px-4 py-3.5 rounded-md font-semibold text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition duration-300">Bullet Points</button>
                    <button onClick={(e) => handleGenerate(e, "quiz")} className="w-full px-4 py-3.5 rounded-md font-semibold text-sm border border-red-900/50 text-red-400 bg-red-950/20 hover:bg-red-900/40 hover:text-red-300 transition duration-300">Practice Quiz</button>
                    <button onClick={(e) => handleGenerate(e, "paper")} className="w-full mt-4 bg-red-600 text-white px-5 py-4 rounded-md font-bold tracking-wide hover:bg-red-700 transition duration-300 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] text-base">Prediction Paper</button>
                  </div>
                </form>
              )}

              {appState === "ask_days" && (
                <div className="flex flex-col items-center justify-center flex-1 space-y-8 w-full max-w-lg mx-auto py-10">
                  <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 mb-4">Exam Timeline</h2>
                    <p className="text-gray-400 text-lg">How many days do you have left to prepare for {formData.subject || 'this subject'}?</p>
                  </div>
                  <div className="w-full bg-black/40 border border-gray-800 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center backdrop-blur-sm">
                    <div className="relative mb-8">
                      <input type="number" min="1" max="90" name="daysToPrepare" value={formData.daysToPrepare} onChange={handleInputChange} className="w-40 text-center text-6xl font-black bg-gray-900 border-2 border-red-900/50 rounded-2xl p-6 text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition shadow-inner" />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-gray-500 font-mono text-sm tracking-widest uppercase">Days</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
                      <button onClick={() => setAppState("input")} className="flex-1 px-6 py-4 border border-gray-700 bg-gray-900 rounded-xl text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition duration-300">Cancel</button>
                      <button onClick={(e) => handleGenerate(e, "schedule")} className="flex-1 bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]">Create Plan 🚀</button>
                    </div>
                  </div>
                </div>
              )}

              {appState === "processing" && (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600 mb-6"></div>
                  <h2 className="text-2xl font-semibold text-gray-100 tracking-wide">Generating your {generationType === "paper" ? "Prediction Paper" : generationType === "schedule" ? "Study Schedule" : generationType}...</h2>
                  <div className="text-red-400 mt-6 space-y-2 text-center text-sm font-mono bg-red-950/30 p-5 rounded-xl border border-red-900/30 min-w-[300px]">
                    <p className="animate-pulse">Extracting & Cleaning Content...</p>
                    <p className="animate-pulse delay-75">Analyzing Context via AI...</p>
                    <p className="animate-pulse delay-150">Formatting Output...</p>
                  </div>
                </div>
              )}

              {appState === "output" && generationType !== "quiz" && generatedContent && (
                <div className="space-y-8 flex-1 w-full max-w-6xl mx-auto flex flex-col justify-between">
                  <div className="text-center mb-6 border-b border-gray-800 pb-8">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-100 tracking-wide">{generatedContent.title}</h2>
                    <p className="text-red-400 mt-3 font-mono text-sm">{generatedContent.instructions}</p>
                  </div>
                  {generationType === "schedule" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-2">
                      {generatedContent.schedule.map((dayPlan, idx) => (
                        <div key={idx} className="bg-black/40 border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-red-900/50 transition-all duration-300 relative overflow-hidden group flex flex-col">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-900/30 group-hover:bg-red-600 transition-colors"></div>
                          <div className="flex justify-between items-start mb-5 pl-2">
                            <h3 className="text-2xl font-black text-gray-200">Day {dayPlan.day}</h3>
                            <span className="text-xs font-mono font-medium text-red-300 bg-red-950/40 px-3 py-1.5 rounded-md border border-red-900/40">{dayPlan.hours}</span>
                          </div>
                          <h4 className="text-base font-semibold text-red-400 mb-5 pl-2 leading-snug border-b border-gray-800 pb-3">{dayPlan.focus}</h4>
                          <ul className="space-y-3 pl-2 flex-1">
                            {dayPlan.tasks.map((task, tIdx) => (
                              <li key={tIdx} className="text-sm text-gray-400 flex items-start gap-3 leading-relaxed">
                                <span className="text-red-600 mt-0.5 text-xs">◆</span> {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-black/40 border border-gray-700 rounded-xl p-8 md:p-10 shadow-inner flex-1 print:shadow-none print:border-none print:bg-white print:text-black">
                      {generatedContent.sections.map((section, idx) => (
                        <div key={idx} className="mb-10 last:mb-0">
                          <h3 className="text-xl font-bold text-red-100 mb-5 bg-red-950/50 border border-red-900/50 px-5 py-3 rounded-lg inline-block">{section.name}</h3>
                          <ul className={`${generationType === "bullets" ? "list-disc" : "list-decimal"} pl-6 space-y-4 text-gray-300 text-lg`}>
                            {section.questions.map((q, qIdx) => (<li key={qIdx} className="pl-3 leading-relaxed">{q}</li>))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 justify-center border-t border-gray-800 pt-8 mt-6">
                    <button onClick={() => setAppState("input")} className="px-8 py-3 border border-gray-600 bg-gray-900 rounded-xl text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition duration-300">← Main Menu</button>
                    <button onClick={handleRegenerate} className="px-8 py-3 border border-red-900/80 text-red-500 bg-red-950/20 rounded-xl font-medium hover:bg-red-950/50 hover:text-red-400 transition duration-300">Regenerate</button>
                    <button onClick={handleDownload} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition duration-300 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">Export to PDF</button>
                  </div>
                </div>
              )}
            </div>
          </MagicCard>
        )}

        {appState === "output" && generationType === "quiz" && (
          <PracticeQuiz formData={formData} onBackToMenu={() => setAppState("input")} />
        )}

      </main>

      {/* CHANGED: Footer sits here outside the main padded wrapper */}
      <Footer />
    </div>
  );
};

export default Home;