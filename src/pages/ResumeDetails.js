"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/ResumeDetails.css";

const ResumeDetails = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResumeDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/resume/history");
      const allResumes = response.data.history;
      const selectedResume = allResumes.find((r) => r._id === id);

      if (!selectedResume) {
        setError("Resume not found");
        setResume(null);
      } else {
        setResume(selectedResume);
      }
    } catch (err) {
      setError("Failed to load resume details. Please try again later.");
      setResume(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResumeDetails();
  }, [fetchResumeDetails]);

  const getScoreClass = (score) => {
    if (score === null || score === undefined) return "no-score";
    if (score >= 7) return "high-score";
    if (score >= 5) return "medium-score";
    return "low-score";
  };

  const getScoreDescription = (score) => {
    if (score === null || score === undefined) {
      return "ATS score not available.";
    }
    if (score >= 7) {
      return "Great! Your resume is well-optimized for ATS systems.";
    }
    if (score >= 5) {
      return "Good! Your resume has moderate ATS compatibility.";
    }
    return "Your resume needs improvements for better ATS compatibility.";
  };

  if (loading) {
    return (
      <div className="details-container">
        <Link to="/history" className="back-button">
          ← Back to History
        </Link>
        <div className="resume-card skeleton">
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="details-container">
        <div className="error-message">
          {error || "Resume not found or an error occurred."}
        </div>
        <Link to="/history" className="back-button">
          ← Back to History
        </Link>
      </div>
    );
  }

  const atsScore =
    resume.atsScore !== null && resume.atsScore !== undefined
      ? resume.atsScore
      : null;

  return (
    <div className="details-container">
      <Link to="/history" className="back-button">
        ← Back to History
      </Link>

      <div className="resume-card">
        <div className="resume-header">
          <div className="resume-info">
            <h1>📄 {resume.fileName || "Resume"}</h1>
            <p>Job Role: {resume.jobRole || "N/A"}</p>
            <p>Uploaded: {new Date(resume.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="score-section">
            <div className={`score-circle ${getScoreClass(atsScore)}`}>
              <span>{atsScore !== null ? atsScore : "N/A"}</span>
            </div>
            <p>ATS Score</p>
            <p className="score-description">{getScoreDescription(atsScore)}</p>
          </div>
        </div>

        <div className="feedback-section">
          <h2>🤖 AI Feedback</h2>
          <div className="feedback-content">
            {resume.aiFeedback ? (
              <div className="feedback-text">
                {resume.aiFeedback.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            ) : (
              <p>No AI feedback available for this resume.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails;
