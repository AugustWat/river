import React, { useState, useRef, useEffect } from "react";
import { AuroraText } from "../AuroraText";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import MasteryInterface from "./MasteryInterface";

// 🟢 BACKEND SENIORS: Set your API base URL here

const Home = () => {

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const navigate = useNavigate();   
  const [appState, setAppState] = useState("input");
  const [error, setError] = useState(null); 
  const [showIntro, setShowIntro] = useState(true);

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
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      setChatMessages(prev => [...prev, { role: "ai", content: data.reply }]);

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
      if (type === "paper") {
        // --- REAL API CALL FOR PREDICTION PAPER ---
        const payload = {
          subject: formData.subject,
          degreeType: formData.degreeType,
          examType: formData.examType,
          semester: formData.semester,
          extraInstructions: formData.extraInstructions,
        };

        const response = await fetch("/api/paper/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to generate paper");
        
        setGeneratedContent(data.paper);

      } else if (type === "schedule") {
        // --- REAL API CALL FOR STUDY SCHEDULE ---
        const scheduleForm = new FormData();
        scheduleForm.append("subject", formData.subject);
        scheduleForm.append("daysToPrepare", formData.daysToPrepare);
        scheduleForm.append("degreeType", formData.degreeType || "B.Tech");
        scheduleForm.append("examType", formData.examType || "Mid Sem");
        scheduleForm.append("semester", formData.semester || "1");
        if (formData.extraInstructions) {
          scheduleForm.append("extraInstructions", formData.extraInstructions);
        }
        if (formData.syllabus) scheduleForm.append("syllabus", formData.syllabus);
        if (formData.pyq1) scheduleForm.append("pyq1", formData.pyq1);
        if (formData.pyq2) scheduleForm.append("pyq2", formData.pyq2);

        const response = await fetch("/api/schedule/generate", {
          method: "POST",
          body: scheduleForm, 
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to generate schedule");
        
        setGeneratedContent(data.scheduleContent);

      } else {
        // --- TEMP MOCK DATA FOR QUIZ ---
        await new Promise(resolve => setTimeout(resolve, 2500)); 
        
        if (type === "quiz") {
          setGeneratedContent([
            { question: "Based on the uploaded syllabus, which data structure is best for LIFO?", options: ["Queue", "Linked List", "Stack", "Tree"], correctAnswer: 2 },
            { question: "What concept is tested most frequently in Section B?", options: ["Binary Search", "Dynamic Programming", "Graph Traversals", "Sorting Arrays"], correctAnswer: 1 },
          ]);
        } 
      }

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

  const matrixCards = [
    { code: "ALG", value: 92, active: true },
    { code: "DSA", value: 88, active: true },
    { code: "DB", value: 74 },
    { code: "OS", value: 68 },
    { code: "CN", value: 71 },
    { code: "TOC", value: 64, dim: true },
    { code: "ML", value: 79 },
    { code: "SE", value: 83, active: true },
    { code: "M1", value: 86 },
    { code: "M2", value: 81 },
    { code: "PHY", value: 73 },
    { code: "CHE", value: 69, dim: true },
    { code: "ENG", value: 90, active: true },
    { code: "HSS", value: 77 },
    { code: "LAB", value: 84 },
    { code: "PROJ", value: 80 },
  ];

 if (showIntro) {

  const handleActionClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      setShowIntro(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 flex flex-col">

      {/* 🔥 Top Bar */}
      <div className="w-full flex justify-end p-4">
        {isLoggedIn ? (
          <span className="text-sm font-medium text-gray-300">
            Welcome {
              localStorage.getItem("username")
            } 
          </span>
        ) : (
          <button
            onClick={() => navigate("/Login")}
            className="border border-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Login
          </button>
        )}
      </div>

      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-red-500 mb-4">
          StudyAlly 🔥
        </h1>

        <p className="text-gray-400 mb-10 text-center max-w-lg">
          Your AI-powered learning companion. Choose what you want to do.
        </p>

        {/* Student Section */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          
          <button
            onClick={handleActionClick}
            className="w-full bg-red-600 hover:bg-red-700 px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg"
          >
            📘 Study a New Topic
          </button>

          <button
            onClick={handleActionClick}
            className="w-full bg-gray-900 border border-gray-700 hover:bg-gray-800 px-6 py-4 rounded-xl font-semibold text-lg transition"
          >
            📝 Prepare for Exams
          </button>

        </div>

        {/* Parent Section */}
        <div className="mt-10 w-full max-w-md text-center">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
            For Parents
          </h2>

          <button
            onClick={handleActionClick}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl font-semibold text-lg transition"
          >
            👨‍👩‍👧 Track Your Child's Progress
          </button>
        </div>

      </div>
    </div>
  );
}
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

        <MasteryInterface
          appState={appState}
          error={error}
          formData={formData}
          generationType={generationType}
          generatedContent={generatedContent}
          isChatOpen={isChatOpen}
          chatInput={chatInput}
          chatMessages={chatMessages}
          isChatTyping={isChatTyping}
          chatScrollRef={chatScrollRef}
          matrixCards={matrixCards}
          setAppState={setAppState}
          setError={setError}
          setFormData={setFormData}
          setGenerationType={setGenerationType}
          setGeneratedContent={setGeneratedContent}
          setIsChatOpen={setIsChatOpen}
          setChatInput={setChatInput}
          setChatMessages={setChatMessages}
          setIsChatTyping={setIsChatTyping}
          handleInputChange={handleInputChange}
          handleScheduleClick={handleScheduleClick}
          handleChatSubmit={handleChatSubmit}
          handleGenerate={handleGenerate}
          handleDownload={handleDownload}
          handleRegenerate={handleRegenerate}
        />

      </main>

      {/* CHANGED: Footer sits here outside the main padded wrapper */}
      <Footer />
    </div>
  );
};

export default Home;
