import { useState } from "react";
import "./ParentsDashboard.css";

function ParentsDashboard() {
  const [studentName, setStudentName] = useState("Pallab");
  const [aiSummary, setAiSummary] = useState(
    "Your child is performing well in core subjects. Strong understanding of concepts but needs more practice in numericals."
  );

  const progressData = [
    { subject: "Data Structures", progress: 80 },
    { subject: "Algorithms", progress: 65 },
    { subject: "DBMS", progress: 75 },
    { subject: "Operating Systems", progress: 60 },
  ];

  return (
    <div className="parent-container">

      {/* Header */}
      <div className="parent-header">
        <h1>Parent Dashboard 👨‍👩‍👧</h1>
        <p>Tracking progress for <span>{studentName}</span></p>
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        <h2>📊 Subject Progress</h2>

        {progressData.map((item, index) => (
          <div key={index} className="progress-card">
            <div className="progress-info">
              <span>{item.subject}</span>
              <span>{item.progress}%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary Section */}
      <div className="summary-section">
        <h2>🤖 AI Performance Summary</h2>

        <textarea
          className="summary-box"
          value={aiSummary}
          onChange={(e) => setAiSummary(e.target.value)}
        />

        <button className="generate-btn">
          Generate New Summary
        </button>
      </div>

    </div>
  );
}

export default ParentsDashboard;