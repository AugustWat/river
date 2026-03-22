import React, { useState } from 'react';
import MagicCard from './MagicCard';

// 🟢 BACKEND SENIORS: Set your API base URL here
const API_BASE_URL = '/api/quiz';

const PracticeQuiz = ({ formData, onBackToMenu }) => {
  const [quizState, setQuizState] = useState('setup'); // setup, processing, active, results, dashboard_loading, dashboard, error
  const [error, setError] = useState(null); 
  
  const [selectedCount, setSelectedCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [dashboardData, setDashboardData] = useState(null);

  const subjectName = formData?.subject || 'Study Ally';

  // ==========================================
  // 🟢 BACKEND SENIORS: QUIZ GENERATION API
  // ==========================================
  const handleStartQuiz = async () => {
    setQuizState('processing');
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectName,
          questionCount: selectedCount,
          instructions: formData?.extraInstructions || '',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'AI failed to generate questions. Please try again.');
      }

      if (!Array.isArray(data?.questions) || data.questions.length === 0) {
        throw new Error('Quiz API returned no questions.');
      }

      setQuestions(data.questions);

      setCurrentQuestionIndex(0);
      setSelectedOptions({});
      setQuizState('active'); 

    } catch (err) {
      console.error("Quiz Gen Error:", err);
      setError(err.message || "Failed to generate quiz.");
      setQuizState('error');
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOptions(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState('results');
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (selectedOptions[index] === q.correctAnswer) score++;
    });
    return score;
  };

  // ==========================================
  // 🟢 BACKEND SENIORS: AI EVALUATION API
  // ==========================================
  const fetchDashboardData = async () => {
    setQuizState('dashboard_loading');
    setError(null);
    
    const evaluationPayload = {
      subject: subjectName,
      totalQuestions: selectedCount,
      score: calculateScore(),
      qaData: questions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswer,
        userAnswerIndex: selectedOptions[idx] !== undefined ? selectedOptions[idx] : null,
        isCorrect: selectedOptions[idx] === q.correctAnswer
      }))
    };

    try {
      /* 🟢 UNCOMMENT THIS FOR REAL API CALL
      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationPayload),
      });

      if (!response.ok) throw new Error("AI failed to analyze results.");
      const data = await response.json();
      setDashboardData(data);
      */

      // --- TEMP MOCK ---
      await new Promise(resolve => setTimeout(resolve, 3000));
      const finalScore = calculateScore();
      setDashboardData({
        accuracy: Math.round((finalScore / selectedCount) * 100),
        timeSpent: "14m 23s",
        strongestTopic: "Core Principles",
        weakestTopic: "Edge Cases & Exceptions",
        aiComments: [
          `You have a solid foundational understanding of ${subjectName}, but struggled slightly with application-based scenarios.`,
          `Focus on revisiting the "Edge Cases" section; that's where the majority of your incorrect answers clustered.`,
          `Great decision-making speed! You answered confidently in areas you knew well.`
        ],
        topicBreakdown: [
          { topic: "Core Principles", score: 85 },
          { topic: "Theoretical Proofs", score: 60 },
          { topic: "Edge Cases", score: 30 },
          { topic: "Modern Applications", score: 75 },
        ]
      });
      // -----------------

      setQuizState('dashboard');

    } catch (err) {
      console.error("Dashboard Eval Error:", err);
      setError(err.message || "Failed to load AI analytics.");
      setQuizState('error');
    }
  };

  return (
    <MagicCard className="w-[95vw] max-w-6xl min-h-[85vh] flex flex-col mx-auto rounded-3xl overflow-hidden border border-gray-800 bg-black/60 backdrop-blur-xl shadow-2xl shadow-red-900/20 mb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950/80 via-black to-black px-8 py-6 border-b border-gray-800 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
          {/* Dynamic Subject Name! */}
          {subjectName} <span className="text-red-600">|</span> 
          <span className="text-gray-300 font-medium text-lg">
            {quizState === 'dashboard' ? 'Performance Analytics' : 'Practice Mode'}
          </span>
        </h1>
        {quizState === 'active' && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-red-400 uppercase tracking-widest">Question</span>
            <span className="text-lg font-mono text-gray-200 bg-red-950/40 px-4 py-1.5 rounded-lg border border-red-900/50 shadow-inner">
              {currentQuestionIndex + 1} <span className="text-gray-500">/</span> {questions.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center p-8 md:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-red-900/50 scrollbar-track-transparent z-10">
        
        {/* --- ERROR STATE --- */}
        {quizState === 'error' && (
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="text-7xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-red-500">Connection Error</h2>
            <p className="text-gray-300 text-lg bg-red-950/30 p-4 rounded-xl border border-red-900/50">
              {error}
            </p>
            <div className="flex justify-center gap-4 pt-6">
              <button onClick={onBackToMenu} className="px-6 py-3 border border-gray-700 bg-gray-900 rounded-xl text-gray-300 hover:bg-gray-800 transition">
                Return to Menu
              </button>
              <button onClick={() => setQuizState('setup')} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* --- SETUP STATE --- */}
        {quizState === 'setup' && (
          <div className="text-center space-y-10 max-w-3xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 mb-4">
                Configure Your Session
              </h2>
              <p className="text-gray-400 text-lg">Select how many AI-generated questions you want to tackle based on your uploaded materials.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {[10, 15, 25].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedCount(num)}
                  className={`w-36 h-36 flex flex-col items-center justify-center rounded-2xl font-bold border transition-all duration-300 hover:-translate-y-1 ${
                    selectedCount === num 
                      ? 'bg-red-950/60 border-red-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.2)]' 
                      : 'bg-black/50 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  }`}
                >
                  <span className="text-4xl mb-1">{num}</span>
                  <span className="text-sm font-normal opacity-70 uppercase tracking-wider">Questions</span>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-6 pt-8">
              <button onClick={onBackToMenu} className="px-8 py-4 border border-gray-700 bg-gray-900 rounded-xl text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition duration-300">
                ← Back to Menu
              </button>
              <button onClick={handleStartQuiz} className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg tracking-wide hover:bg-red-700 transition duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                Start Challenge 
              </button>
            </div>
          </div>
        )}

        {/* --- PROCESSING STATE --- */}
        {quizState === 'processing' && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600 mb-8"></div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-100 tracking-wide mb-6">
              Synthesizing your {selectedCount}-question exam...
            </h2>
            <div className="text-red-400 space-y-3 text-center text-base font-mono bg-red-950/20 p-6 rounded-xl border border-red-900/30 min-w-[300px]">
              <p className="animate-pulse">Analyzing Syllabus & PYQs...</p>
              <p className="animate-pulse delay-75">Cross-referencing core concepts...</p>
              <p className="animate-pulse delay-150">Drafting tailored questions...</p>
            </div>
          </div>
        )}

        {/* --- ACTIVE QUIZ STATE --- */}
        {quizState === 'active' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full justify-between py-4">
            <div>
              <div className="w-full bg-gray-900 rounded-full h-2 mb-10 border border-gray-800 overflow-hidden">
                <div 
                  className="bg-red-600 h-2 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-500 ease-out" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-100 leading-snug mb-10">
                {questions[currentQuestionIndex]?.question}
              </h2>

              <div className="space-y-4">
                {questions[currentQuestionIndex]?.options.map((option, idx) => {
                  const isSelected = selectedOptions[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left px-6 py-5 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                        isSelected 
                          ? 'bg-red-950/40 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                          : 'bg-black/40 border-gray-800 text-gray-300 hover:bg-gray-800/60 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-md mr-4 font-mono font-bold ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-10 mt-10 border-t border-gray-800">
              <button onClick={() => setQuizState('setup')} className="px-6 py-3 border border-gray-700 bg-transparent rounded-xl text-gray-400 font-medium hover:bg-gray-900 hover:text-white transition duration-300">
                End Session Early
              </button>
              <button 
                onClick={handleNext}
                disabled={selectedOptions[currentQuestionIndex] === undefined}
                className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg tracking-wide hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit & Grade ' : 'Next Question ➔'}
              </button>
            </div>
          </div>
        )}

        {/* --- RESULTS STATE --- */}
        {quizState === 'results' && (
          <div className="text-center space-y-8 flex flex-col items-center justify-center h-full">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-700">
              Session Complete
            </h2>
            
            <div className="relative inline-flex flex-col items-center justify-center w-56 h-56 rounded-full border-8 border-red-900/40 bg-black/60 shadow-[0_0_50px_rgba(220,38,38,0.3)] backdrop-blur-sm">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-600/20 to-transparent pointer-events-none"></div>
              <span className="text-7xl font-black text-white drop-shadow-lg">{calculateScore()}</span>
              <div className="w-16 h-1 bg-gray-700 my-2 rounded-full"></div>
              <span className="text-gray-400 font-mono text-xl tracking-widest">{questions.length}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <button onClick={onBackToMenu} className="px-8 py-4 border border-gray-700 bg-gray-900 rounded-xl text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition duration-300 text-lg">
                Main Menu
              </button>
              <button onClick={fetchDashboardData} className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                Generate AI Analytics 
              </button>
            </div>
          </div>
        )}

        {/* --- DASHBOARD LOADING STATE --- */}
        {quizState === 'dashboard_loading' && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-8"></div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-100 tracking-wide mb-6">
              AI is analyzing your performance...
            </h2>
            <div className="text-purple-400 space-y-3 text-center text-base font-mono bg-purple-950/20 p-6 rounded-xl border border-purple-900/30 min-w-[300px]">
              <p className="animate-pulse">Evaluating answer accuracy...</p>
              <p className="animate-pulse delay-75">Identifying topic strengths & weaknesses...</p>
              <p className="animate-pulse delay-150">Generating personalized action plan...</p>
            </div>
          </div>
        )}

        {/* --- NEW DASHBOARD STATE --- */}
        {quizState === 'dashboard' && dashboardData && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Accuracy</span>
                <span className={`text-5xl font-black ${dashboardData.accuracy >= 70 ? 'text-green-500' : dashboardData.accuracy >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {dashboardData.accuracy}%
                </span>
              </div>
              <div className="bg-black/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Strongest Topic</span>
                <span className="text-xl font-bold text-blue-400">{dashboardData.strongestTopic}</span>
              </div>
              <div className="bg-black/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Weakest Topic</span>
                <span className="text-xl font-bold text-red-400">{dashboardData.weakestTopic}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                  <span className="text-red-500">✨</span> AI Performance Insights
                </h3>
                <div className="space-y-4">
                  {dashboardData.aiComments.map((comment, idx) => (
                    <div key={idx} className="flex items-start gap-4 bg-black/40 p-4 rounded-xl border border-gray-800">
                      <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                      <p className="text-gray-300 leading-relaxed text-sm md:text-base">{comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/50 border border-gray-800 rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-100 mb-6">Topic Mastery</h3>
                <div className="space-y-6">
                  {dashboardData.topicBreakdown.map((topic, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300 font-medium">{topic.topic}</span>
                        <span className="text-gray-400 font-mono">{topic.score}%</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${topic.score >= 80 ? 'bg-green-500' : topic.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${topic.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 pt-6">
              <button onClick={() => setQuizState('setup')} className="px-8 py-3 border border-gray-700 bg-gray-900 rounded-xl text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition duration-300">
                 Setup New Quiz
              </button>
              <button onClick={onBackToMenu} className="px-8 py-3 border border-red-900/50 bg-red-950/30 text-red-400 rounded-xl font-medium hover:bg-red-900/50 hover:text-red-300 transition duration-300">
                Main Menu
              </button>
            </div>

          </div>
        )}
      </div>
    </MagicCard>
  );
};

export default PracticeQuiz;