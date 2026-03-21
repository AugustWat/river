import React, { useState } from 'react';

const QuestionPaperGenerator = () => {
  //Application States: 'input', 'processing', 'output'
  const [appState, setAppState] = useState('input');
  
  //Form Data 
  const [formData, setFormData] = useState({
    syllabus: null,
    pyq1: null,
    pyq2: null,
    examType: 'Mid Sem',
    semester: '1',
    subject: '',
    degreeType: 'B.Tech',
    extraInstructions: ''
  });

  //Output 
  const [generatedPaper, setGeneratedPaper] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAppState('processing');

    // SIMULATED BACKEND CALL
    setTimeout(() => {
      setGeneratedPaper({
        title: `${formData.subject} - ${formData.examType} Examination`,
        instructions: "Attempt all sections. Read questions carefully.",
        sections: [
          {
            name: "Section A: Short Answer Questions (2 Marks Each)",
            questions: [
              "Define the core principles of the subject.",
              "Explain the difference between X and Y based on recent syllabus updates.",
              "List three applications of Z in real-world scenarios."
            ]
          },
          {
            name: "Section B: Long Answer Questions (10 Marks Each)",
            questions: [
              "Derive the formula for [Topic] and explain its significance.",
              "Analyze the impact of [Topic] as discussed in the prescribed text.",
            ]
          }
        ]
      });
      setAppState('output');
    }, 3500); 
  };

  const handleDownload = () => {
    alert("Downloading PDF...");
  };

  const handleRegenerate = () => {
    setAppState('processing');
    setTimeout(() => setAppState('output'), 3000);
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-200"
      style={{
        backgroundColor: '#050505',
        backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '12px 12px'
      }}
    >
      {/* Main Glass Card */}
      <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-900/20 border border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-black px-6 py-4 border-b border-red-800/50">
          <h1 className="text-2xl font-bold text-white text-center tracking-wide">
            Material to Qpaper
          </h1>
          <p className="text-red-300 text-center text-sm mt-1">
            
          </p>
        </div>

        <div className="p-8">
          {/* --- INPUT LAYER --- */}
          {appState === 'input' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload Syllabus (PDF/TXT)</label>
                  <input type="file" name="syllabus" onChange={handleInputChange} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400" required/>
                </div>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                  <label className="block text-sm font-medium text-gray-300 mb-2">PYQ Paper 1 (PDF/TXT)</label>
                  <input type="file" name="pyq1" onChange={handleInputChange} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400" required/>
                </div>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-red-900/20 hover:border-red-500/50 transition duration-300">
                  <label className="block text-sm font-medium text-gray-300 mb-2">PYQ Paper 2 (PDF/TXT)</label>
                  <input type="file" name="pyq2" onChange={handleInputChange} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 cursor-pointer text-gray-400" required/>
                </div>
              </div>

              <hr className="border-gray-800" />

              {/* Exam Details */}
              <h3 className="text-lg font-semibold text-gray-100">Exam Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Subject Name</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border placeholder-gray-600 transition" placeholder="e.g., Data Structures" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400">Degree Type</label>
                  <select name="degreeType" value={formData.degreeType} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border transition [&>option]:bg-gray-900">
                    <option>B.Tech</option>
                    <option>B.Sc</option>
                    <option>BCA</option>
                    <option>BA</option>
                    <option>B.Com</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Exam Type</label>
                  <select name="examType" value={formData.examType} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border transition [&>option]:bg-gray-900">
                    <option>Mid Sem</option>
                    <option>End Sem</option>
                    <option>CIA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border transition [&>option]:bg-gray-900">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>Semester {num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">Extra Instructions (Format changes, focus areas, etc.)</label>
                <textarea name="extraInstructions" value={formData.extraInstructions} onChange={handleInputChange} rows="3" className="mt-1 block w-full rounded-md bg-black/50 border-gray-700 text-gray-100 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2 border placeholder-gray-600 transition" placeholder="e.g., Make sure to include more numericals this year. Section C should have compulsory questions." />
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-red-600 text-white px-8 py-3 rounded-md font-bold tracking-wide hover:bg-red-700 transition duration-300 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]">
                  Generate Prediction Paper 
                </button>
              </div>
            </form>
          )}

          {/* --- PROCESSING LAYER --- */}
          {appState === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-100 tracking-wide">Processing via Gemini AI...</h2>
              <div className="text-red-400 mt-4 space-y-2 text-center text-sm font-mono bg-red-950/30 p-4 rounded-md border border-red-900/30">
                <p className="animate-pulse"> Extracting & Cleaning Content...</p>
                <p className="animate-pulse delay-75"> Analyzing PYQs & Syllabus Context...</p>
                <p className="animate-pulse delay-150"> Drafting Section-wise Questions...</p>
              </div>
            </div>
          )}

          {/* --- OUTPUT LAYER --- */}
          {appState === 'output' && generatedPaper && (
            <div className="space-y-6">
              
              {/* Paper View */}
              <div className="bg-black/40 border border-gray-700 rounded-lg p-8 shadow-inner print:shadow-none print:border-none print:bg-white print:text-black">
                <div className="text-center mb-8 border-b border-gray-700 pb-4">
                  <h2 className="text-2xl font-bold uppercase text-gray-100">{generatedPaper.title}</h2>
                  <p className="text-red-400 mt-2 italic font-mono text-sm">Instructions: {generatedPaper.instructions}</p>
                </div>

                {generatedPaper.sections.map((section, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-lg font-bold text-red-100 mb-4 bg-red-950/50 border border-red-900/50 px-4 py-2 rounded-md">{section.name}</h3>
                    <ol className="list-decimal pl-6 space-y-4 text-gray-300">
                      {section.questions.map((q, qIdx) => (
                        <li key={qIdx} className="pl-2 leading-relaxed">{q}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              {/* User Actions */}
              <div className="flex flex-wrap gap-4 justify-center border-t border-gray-800 pt-6">
                <button onClick={() => setAppState('input')} className="px-6 py-2 border border-gray-600 bg-gray-900 rounded-md text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition">
                  ← Edit Inputs
                </button>
                <button onClick={handleRegenerate} className="px-6 py-2 border border-red-600 text-red-500 bg-red-950/20 rounded-md font-medium hover:bg-red-950/50 hover:text-red-400 transition">
                   Regenerate Paper
                </button>
                <button onClick={handleDownload} className="px-6 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 transition shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                   Download PDF
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default QuestionPaperGenerator;