import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/ResumeHistory.css";

// ResumeHistory: searchable, sortable list of analyzed resumes with download.
const ResumeHistory = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch list of resumes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/resume/history");
        setResumes(response.data.history || []);
      } catch (err) {
        setError("Failed to load resume history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Score threshold constants
  const SCORE_THRESHOLDS = {
    HIGH: 7,
    MEDIUM: 5,
  };

  // Score helpers for color and label
  const getScoreClass = (score) => {
    if (score == null) return "no-score";
    return score >= SCORE_THRESHOLDS.HIGH
      ? "high-score"
      : score >= SCORE_THRESHOLDS.MEDIUM
      ? "medium-score"
      : "low-score";
  };

  const getScoreDescription = (score) => {
    if (score == null) return "No score";
    return score >= SCORE_THRESHOLDS.HIGH
      ? "Great!"
      : score >= SCORE_THRESHOLDS.MEDIUM
      ? "Good!"
      : "Needs work";
  };

  // Download original file (guards against duplicate clicks per-item)
  const handleDownload = async (resumeId, fileName) => {
    if (downloadingId === resumeId) return;

    setDownloadingId(resumeId);
    let downloadUrl = null;

    try {
      const response = await api.get(`/resume/download/${resumeId}`, {
        responseType: "blob",
      });
      downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fileName || "resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      downloadUrl && window.URL.revokeObjectURL(downloadUrl);
      setDownloadingId(null);
    }
  };

  // Memoized filtered and sorted resumes for better performance
  const filteredAndSortedResumes = useMemo(() => {
    return resumes
      .filter((resume) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const fileName = resume.fileName || resume.originalName || "Resume";
        const jobRole = resume.jobRole || "N/A";
        return (
          fileName.toLowerCase().includes(searchLower) ||
          jobRole.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "score": {
            const scoreA = a.atsScore ?? -1;
            const scoreB = b.atsScore ?? -1;
            return scoreB - scoreA;
          }
          case "name": {
            const nameA = a.fileName || a.originalName || "";
            const nameB = b.fileName || b.originalName || "";
            return nameA.localeCompare(nameB);
          }
          default:
            return 0;
        }
      });
  }, [resumes, searchTerm, sortBy]);

  // Memoized average ATS score calculation
  const averageScore = useMemo(() => {
    if (resumes.length === 0) return "0";
    const validScores = resumes.filter((resume) => resume.atsScore != null);
    if (validScores.length === 0) return "0";
    return (
      validScores.reduce((sum, resume) => sum + resume.atsScore, 0) /
      validScores.length
    ).toFixed(1);
  }, [resumes]);

  // Loading state
  if (loading) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h1>📚 Resume History</h1>
          <p>Your uploaded resumes and analysis results</p>
        </div>
        <div className="resumes-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="resume-card skeleton">
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="history-container">
        <div className="error-message">{error}</div>
        <Link to="/upload" className="upload-link">
          📤 Upload Your First Resume
        </Link>
      </div>
    );
  }

  // Main content
  return (
    <div className="history-container">
      <div className="history-header">
        <h1>📚 Resume History</h1>
        <p>Your uploaded resumes and analysis results</p>
        <div className="stats-summary">
          <span>
            📄 {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
          </span>
          {resumes.length > 0 && (
            <span>📊 Average Score: {averageScore}/10</span>
          )}
        </div>
      </div>

      {/* Search + sort controls */}
      <div className="history-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search by filename or job role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">📅 Date (Newest)</option>
            <option value="score">📊 ATS Score (High to Low)</option>
            <option value="name">📄 Filename (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Empty states vs results */}
      {resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No resumes uploaded yet</h3>
          <p>Start your journey by uploading your first resume!</p>
          <Link to="/upload" className="upload-btn">
            📤 Upload Your First Resume
          </Link>
        </div>
      ) : filteredAndSortedResumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="resumes-grid">
          {filteredAndSortedResumes.map((resume) => {
            const fileName = resume.fileName || resume.originalName || "Resume";
            const jobRole = resume.jobRole || "N/A";
            const uploadDate = resume.createdAt
              ? new Date(resume.createdAt).toLocaleDateString()
              : "N/A";

            return (
              <div key={resume._id} className="resume-card">
                <div className="resume-header">
                  <div className="resume-info">
                    <h3 title={fileName}>📄 {fileName}</h3>
                    <p className="job-role" title={jobRole}>
                      {jobRole}
                    </p>
                    <p className="upload-date">{uploadDate}</p>
                  </div>
                  <div className="score-section">
                    <div
                      className={`score-circle ${getScoreClass(
                        resume.atsScore
                      )}`}
                    >
                      <span>{resume.atsScore ?? "N/A"}</span>
                    </div>
                    <p className="score-label">ATS Score</p>
                    <p className="score-description">
                      {getScoreDescription(resume.atsScore)}
                    </p>
                  </div>
                </div>

                <div className="resume-actions">
                  <Link to={`/resume/${resume._id}`} className="view-btn">
                    👁️ View Details
                  </Link>
                  <button
                    onClick={() => handleDownload(resume._id, fileName)}
                    disabled={downloadingId === resume._id}
                    className="download-btn"
                  >
                    {downloadingId === resume._id
                      ? "⏳ Downloading..."
                      : "📥 Download"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
