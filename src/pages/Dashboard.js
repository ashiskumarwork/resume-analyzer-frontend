import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/Dashboard.css";

// Dashboard: shows quick stats and suggested actions based on resume history.
const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch resume history to build stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/resume/history");
        setResumes(response.data.history || []);
      } catch (err) {
        setError(
          "Oops! Something went wrong while loading your dashboard. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoized stats calculation for better performance
  const stats = useMemo(() => {
    const validScores = resumes.filter((item) => item.atsScore != null);
    return {
      totalResumes: resumes.length,
      averageScore:
        validScores.length > 0
          ? (
              validScores.reduce((sum, item) => sum + item.atsScore, 0) /
              validScores.length
            ).toFixed(1)
          : "N/A",
    };
  }, [resumes]);

  // Score threshold constants
  const SCORE_THRESHOLDS = {
    EXCELLENT: 8,
    GREAT: 7,
    GOOD: 5,
  };

  // Friendly explanation for the average score
  const getScoreMessage = (score) => {
    if (score === "N/A") return "Upload your first resume to get started! 🚀";
    const numScore = parseFloat(score);
    return numScore >= SCORE_THRESHOLDS.EXCELLENT
      ? "Excellent! You're crushing it! 🎉"
      : numScore >= SCORE_THRESHOLDS.GREAT
      ? "Great job! Your resumes are looking good! 👍"
      : numScore >= SCORE_THRESHOLDS.GOOD
      ? "Good progress! Keep improving! 💪"
      : "Keep working on it! Every improvement counts! 🔥";
  };

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>📊 Your Dashboard</h1>
          <p>Welcome back! Here's your resume analysis overview</p>
        </div>
        <div className="stats-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="stat-card skeleton">
              <div className="skeleton-text"></div>
              <p className="stat-value skeleton-text"></p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Your Dashboard</h1>
        <p>Welcome back! Here's your resume analysis overview</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <h3>Total Resumes</h3>
          <p className="stat-value">{stats.totalResumes}</p>
          <p className="stat-description">
            You've uploaded {stats.totalResumes} resume
            {stats.totalResumes !== 1 ? "s" : ""} so far!
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <h3>Average ATS Score</h3>
          <p className="stat-value">{stats.averageScore}</p>
          <p className="stat-description">
            {getScoreMessage(stats.averageScore)}
          </p>
        </div>

        <div className="stat-card action-card">
          <div className="stat-icon">🚀</div>
          <h3>Ready to Improve?</h3>
          <p className="stat-description">
            Upload a new resume and get instant AI feedback!
          </p>
          <Link to="/upload" className="upload-btn">
            📤 Upload New Resume
          </Link>
        </div>
      </div>

      {/* Actions or welcome section */}
      {stats.totalResumes > 0 ? (
        <div className="dashboard-actions">
          <div className="action-section">
            <h3>📚 Manage Your Resumes</h3>
            <p>View and analyze all your uploaded resumes</p>
            <Link to="/history" className="action-btn primary">
              👁️ View All Resumes
            </Link>
          </div>
          <div className="action-section">
            <h3>📈 Improve Your Score</h3>
            <p>Upload a new resume to get better feedback</p>
            <Link to="/upload" className="action-btn secondary">
              📤 Upload New Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>🎉 Welcome to AI Resume Analyzer!</h2>
            <p>
              Get started by uploading your first resume and see how AI can help
              improve your job applications.
            </p>
            <div className="welcome-features">
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <span>AI-Powered Analysis</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>ATS Compatibility Score</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💡</span>
                <span>Detailed Feedback</span>
              </div>
            </div>
            <Link to="/upload" className="welcome-btn">
              🚀 Start Your Journey
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
