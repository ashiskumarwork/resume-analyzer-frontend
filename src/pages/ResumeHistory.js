"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/ResumeHistory.css";

const ResumeHistory = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const fetchResumeHistory = async () => {
      try {
        const response = await api.get("/resume/history");
        setResumes(response.data.history);
      } catch (err) {
        setError("Failed to load resume history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeHistory();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleDownloadPDF = async (resumeId, fileName) => {
    if (downloadingId) return;

    setDownloadingId(resumeId);
    setDownloadError("");

    try {
      const response = await api.get(`/resume/download/${resumeId}`, {
        responseType: "blob",
      });

      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}-feedback.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      setDownloadError("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredResumes = resumes.filter((resume) => {
    return (
      resume.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.jobRole.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedResumes = [...filteredResumes].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "score") {
      // Handle null scores
      const scoreA = a.atsScore !== null ? a.atsScore : -1;
      const scoreB = b.atsScore !== null ? b.atsScore : -1;

      return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
    } else if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.fileName.localeCompare(b.fileName)
        : b.fileName.localeCompare(a.fileName);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h1>Resume History</h1>

      {error && <div className="error-message">{error}</div>}
      {downloadError && <div className="error-message">{downloadError}</div>}

      <div className="history-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by filename or job role..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        <div className="sort-container">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="date">Date</option>
            <option value="score">ATS Score</option>
            <option value="name">Filename</option>
          </select>

          <button
            className="sort-order-btn"
            onClick={toggleSortOrder}
            aria-label={`Sort ${
              sortOrder === "asc" ? "ascending" : "descending"
            }`}
          >
            <i
              className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}
            ></i>
          </button>
        </div>
      </div>

      {sortedResumes.length > 0 ? (
        <div className="resume-list">
          {sortedResumes.map((resume) => (
            <div className="resume-history-card" key={resume._id}>
              <div className="resume-history-info">
                <h3>{resume.fileName}</h3>
                <p>Job Role: {resume.jobRole}</p>
                <p>Date: {new Date(resume.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="resume-history-score">
                <div
                  className={`score-circle ${
                    resume.atsScore !== null && resume.atsScore !== undefined
                      ? resume.atsScore >= 7
                        ? "high-score"
                        : resume.atsScore >= 5
                        ? "medium-score"
                        : "low-score"
                      : ""
                  }`}
                >
                  <span>
                    {resume.atsScore !== null && resume.atsScore !== undefined
                      ? resume.atsScore
                      : "N/A"}
                  </span>
                </div>
                <p>ATS Score</p>
              </div>

              <div className="resume-history-actions">
                <Link
                  to={`/resume/${resume._id}`}
                  className="view-details-button"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDownloadPDF(resume._id, resume.fileName)}
                  className="download-button"
                  disabled={downloadingId === resume._id}
                >
                  {downloadingId === resume._id ? (
                    <>
                      <div className="button-spinner"></div> Downloading...
                    </>
                  ) : (
                    "Download PDF"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <p>
            No resume uploads found. Get started by uploading your first resume!
          </p>
          <Link to="/upload" className="history-button">
            Upload Resume
          </Link>
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
