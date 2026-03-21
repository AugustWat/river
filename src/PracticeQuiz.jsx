import React, { useState } from 'react';
import MagicCard from './MagicCard';

const PracticeQuiz = ({ formData, onBackToMenu }) => {
  const [quizState, setQuizState] = useState('setup'); 
  const [selectedCount, setSelectedCount] = useState(10);
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleStartQuiz = () => {
    setQuizState('processing');

    setTimeout(() => {
      // THE FIX: Added 'formData?.subject' so it won't crash if formData is missing!
      const subjectName = formData?.subject || 'your requested';

      const generatedQuestions = Array(selectedCount).fill(null).map((_, i) => ({
        question: `Based on the ${subjectName} syllabus, this is AI Practice Question #${i + 1}. Which option is logically correct?`,
        options: ["First Concept", "Second Theorem", "Third Principle", "Fourth Rule"],
        correctAnswer: Math.floor(Math.random() * 4) 
      }));
      
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedOptions({});
      setQuizState('active'); // Safely transitions to the active quiz
    }, 3000);
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

  return (
    
     <MagicCard className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-black px-6 py-4 border-b border-red-800/50 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white tracking-wide">
          CollegeStudyBuddy <span className="text-red-400 font-medium px-2">|</span> Practice Quiz
        </h1>
        {quizState === 'active' && (
          <span className="text-sm font-mono text-gray-400 bg-black/50 px-3 py-1 rounded-md border border-gray-700">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        )}
      </div>

      <div className="p-8">
        
        {/* --- SETUP STATE --- */}
        {quizState === 'setup' && (
          <div className="text-center space-y-8 py-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Configure Your Quiz</h2>
              <p className="text-gray-400 text-sm">Select how many AI-generated questions you want to tackle.</p>
            </div>

            <div className="flex justify-center gap-4">
              {[10, 15, 25].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedCount(num)}
                  className={`px-8 py-4 rounded-lg font-bold text-lg border transition duration-300 ${
                    selectedCount === num 
                      ? 'bg-red-900/40 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                      : 'bg-black/50 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {num} <span className="block text-xs font-normal mt-1 opacity-70">Questions</span>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button onClick={onBackToMenu} className="px-6 py-3 border border-gray-600 bg-gray-900 rounded-md text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition">
                ← Back
              </button>
              <button onClick={handleStartQuiz} className="bg-red-600 text-white px-10 py-3 rounded-md font-bold tracking-wide hover:bg-red-700 transition duration-300 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                Start Practice Quiz 
              </button>
            </div>
          </div>
        )}

        {/* --- PROCESSING STATE --- */}
        {quizState === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-100 tracking-wide">
              Generating your {selectedCount}-question quiz...
            </h2>
            <div className="text-red-400 mt-4 space-y-2 text-center text-sm font-mono bg-red-950/30 p-4 rounded-md border border-red-900/30">
              <p className="animate-pulse"> Extracting PYQs & Syllabus...</p>
              <p className="animate-pulse delay-75"> Gemini AI drafting questions...</p>
            </div>
          </div>
        )}

        {/* --- ACTIVE QUIZ STATE --- */}
        {quizState === 'active' && (
          <div className="space-y-6">
            <div className="w-full bg-gray-900 rounded-full h-1.5 mb-6 border border-gray-800">
              <div 
                className="bg-red-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)] transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <h2 className="text-xl font-semibold text-gray-100 leading-relaxed min-h-[4rem]">
              {questions[currentQuestionIndex]?.question}
            </h2>

            <div className="space-y-3 mt-6">
              {questions[currentQuestionIndex]?.options.map((option, idx) => {
                const isSelected = selectedOptions[currentQuestionIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left px-5 py-4 rounded-lg border transition duration-200 ${
                      isSelected ? 'bg-red-950/40 border-red-500/80 text-white shadow-inner' : 'bg-black/40 border-gray-700/80 text-gray-300 hover:bg-gray-800/60 hover:border-gray-500'
                    }`}
                  >
                    <span className="inline-block w-8 font-mono text-gray-500">{['A', 'B', 'C', 'D'][idx]}.</span> 
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-8 border-t border-gray-800">
              <button onClick={() => setQuizState('setup')} className="px-6 py-2 border border-gray-600 bg-gray-900 rounded-md text-gray-400 font-medium hover:bg-gray-800 hover:text-white transition">
                End Early
              </button>
              <button 
                onClick={handleNext}
                disabled={selectedOptions[currentQuestionIndex] === undefined}
                className="bg-red-600 text-white px-8 py-3 rounded-md font-bold tracking-wide hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz ✨' : 'Next Question ➔'}
              </button>
            </div>
          </div>
        )}

        {/* --- RESULTS STATE --- */}
        {quizState === 'results' && (
          <div className="text-center py-10 space-y-6">
            <h2 className="text-3xl font-bold text-gray-100">Quiz Completed!</h2>
            
            <div className="inline-flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 border-red-900/50 bg-black/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <span className="text-5xl font-bold text-white">{calculateScore()}</span>
              <span className="text-gray-400 font-mono text-sm border-t border-gray-800 mt-2 pt-2 w-20">out of {questions.length}</span>
            </div>

            <p className="text-gray-300 max-w-md mx-auto">
              {calculateScore() === questions.length 
                ? "Perfect score! You're completely ready for this topic." 
                : "Great effort! Review the topics you missed and try again."}
            </p>

            <div className="flex justify-center gap-4 pt-6">
              <button onClick={() => setQuizState('setup')} className="px-6 py-3 border border-gray-600 bg-gray-900 rounded-md text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition">
                🔄 Retake Quiz
              </button>
              <button onClick={onBackToMenu} className="bg-red-600 text-white px-8 py-3 rounded-md font-bold hover:bg-red-700 transition shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </MagicCard>
  );
};

export default PracticeQuiz;