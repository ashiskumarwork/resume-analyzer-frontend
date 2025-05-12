"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api"; // Your path to api.js
import "../styles/ResumeDetails.css"; // Your path to the CSS file

const ResumeDetails = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const fetchResumeDetails = async () => {
      setLoading(true);
      setError("");
      try {
        // Current method: fetching all history and finding the one
        // Consider changing this to a direct fetch: const response = await api.get(`/resume/${id}`);
        const response = await api.get(`/resume/history`);
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
        console.error("Error fetching resume details:", err); // Keep critical error logs
        setResume(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResumeDetails();
    } else {
      setError("No resume ID provided.");
      setLoading(false);
      setResume(null);
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!resume || downloadLoading) return;

    setDownloadLoading(true);
    setDownloadError("");

    try {
      const response = await api.get(`/resume/download/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeFileName = resume.fileName
        ? resume.fileName.replace(/[^a-z0-9_.-]/gi, "_")
        : "resume";
      link.setAttribute("download", `${safeFileName}-feedback.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err); // Keep critical error logs
      setDownloadError(
        err.response?.data?.error || "Failed to download PDF. Please try again."
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const extractListItems = (text) => {
    const trimmedText = text.trim();
    if (!trimmedText) return [];

    if (/\d+\.\s+/.test(trimmedText)) {
      const items = trimmedText
        .split(/\d+\.\s+/)
        .filter((item) => item.trim() !== "");
      if (items.length > 0)
        return items.map((item) => item.trim().replace(/\n$/, ""));
    }
    if (/[•\-*]\s+/.test(trimmedText)) {
      const items = trimmedText
        .split(/[•\-*]\s+/)
        .filter((item) => item.trim() !== "");
      if (items.length > 0)
        return items.map((item) => item.trim().replace(/\n$/, ""));
    }
    const lineItems = trimmedText
      .split(/\n+/)
      .filter((line) => line.trim().length > 5);
    if (lineItems.length > 0) return lineItems.map((item) => item.trim());
    if (trimmedText.length < 150 && trimmedText.length > 5)
      return [trimmedText];
    return [];
  };

  const parseFeedback = (feedbackText) => {
    // Parameter renamed for clarity
    if (!feedbackText || typeof feedbackText !== "string") {
      // console.log("[parseFeedback] Called with invalid or no feedback string."); // Optional: for debugging
      return {
        overview: "Feedback not available or in an unexpected format.",
        suggestions: [],
        missingKeywords: [],
        formattingIssues: [],
      };
    }
    // Optional: Log raw feedback once if needed during development, remove for production
    // console.log("----------- RAW AI FEEDBACK TO PARSE (ResumeDetails.js) -----------\n", feedbackText + "\n--------------------------------------------------------------------");

    let suggestions = [];
    let missingKeywords = [];
    let formattingIssues = [];
    let overview = "";

    const terminators = `(?=Suggestions for improvement:|Missing keywords:|Formatting or grammar issues:|Formatting and Grammar Issues:|Formatting & Grammar Issues:|Formatting Issues:|Grammar Issues:|ATS Compatibility Score:|ATS Compatibility Rating:|$)`;

    const suggestionRegex = new RegExp(
      `Suggestions for improvement:?([\\s\\S]*?)${terminators}`,
      "i"
    );
    const suggestionMatch = feedbackText.match(suggestionRegex);
    if (suggestionMatch && suggestionMatch[1]) {
      suggestions = extractListItems(suggestionMatch[1].trim());
    }

    const keywordsRegex = new RegExp(
      `Missing keywords:?([\\s\\S]*?)${terminators}`,
      "i"
    );
    const keywordsMatch = feedbackText.match(keywordsRegex);
    if (keywordsMatch && keywordsMatch[1]) {
      missingKeywords = extractListItems(keywordsMatch[1].trim());
    }

    const primaryFormattingRegex = new RegExp(
      `Formatting or grammar issues:([\\s\\S]*?)${terminators}`,
      "i"
    );
    const primaryFormattingMatch = feedbackText.match(primaryFormattingRegex);
    if (primaryFormattingMatch && primaryFormattingMatch[1]) {
      formattingIssues = extractListItems(primaryFormattingMatch[1].trim());
    } else {
      const altFormattingRegex = new RegExp(
        `(?:Formatting and Grammar Issues|Formatting & Grammar Issues|Formatting Issues|Grammar Issues):([\\s\\S]*?)${terminators}`,
        "i"
      );
      const altFormattingMatch = feedbackText.match(altFormattingRegex);
      if (altFormattingMatch && altFormattingMatch[1]) {
        formattingIssues = extractListItems(altFormattingMatch[1].trim());
      }
    }

    if (suggestions.length > 0) {
      overview =
        suggestions.slice(0, 2).join(". ") +
        (suggestions.length > 2 ? "..." : suggestions.length > 0 ? "." : "");
      if (overview.length < 20 && suggestions.length > 0)
        overview = suggestions[0];
    } else if (missingKeywords.length > 0 || formattingIssues.length > 0) {
      overview =
        "Key areas for improvement identified. Please review other tabs for details.";
    } else {
      overview = "AI analysis complete. Review tabs for detailed insights.";
    }

    return {
      overview,
      suggestions,
      missingKeywords,
      formattingIssues,
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
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
          <i className="fas fa-arrow-left"></i> Back to History
        </Link>
      </div>
    );
  }

  // aiFeedback is expected to be a string. Ensure it is before parsing.
  const feedbackOutput = parseFeedback(resume.aiFeedback || "");
  const { overview, suggestions, missingKeywords, formattingIssues } =
    feedbackOutput;

  // atsScore is taken directly from resume object
  const atsScore =
    resume.atsScore !== null && resume.atsScore !== undefined
      ? resume.atsScore
      : null;

  return (
    <div className="details-container">
      <div className="details-header">
        <Link to="/history" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to History
        </Link>

        <div className="details-actions">
          <button
            onClick={handleDownloadPDF}
            className="download-button"
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <>
                <div
                  className="button-spinner"
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "8px",
                    borderTopColor: "white",
                    borderWidth: "2px",
                    display: "inline-block",
                  }}
                ></div>
                Downloading...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="error-message" style={{ marginTop: "1rem" }}>
          {downloadError}
        </div>
      )}

      <div className="resume-details-card">
        <div className="resume-details-header">
          <div className="resume-details-info">
            <h1>{resume.fileName || "Resume"}</h1>
            <p className="job-role">Job Role: {resume.jobRole || "N/A"}</p>
            <p className="upload-date">
              Uploaded on: {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="resume-details-score">
            <div
              className={`score-circle large ${
                atsScore !== null
                  ? atsScore >= 7
                    ? "high-score"
                    : atsScore >= 5
                    ? "medium-score"
                    : "low-score"
                  : "no-score"
              }`}
            >
              <span>{atsScore !== null ? atsScore : "N/A"}</span>
            </div>
            <p>ATS Score</p>
          </div>
        </div>

        <div className="feedback-container">
          <h2>AI Feedback</h2>

          <div className="feedback-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-clipboard-check"></i> Overview
            </button>
            <button
              className={`tab-button ${
                activeTab === "suggestions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("suggestions")}
            >
              <i className="fas fa-lightbulb"></i> Suggestions
            </button>
            <button
              className={`tab-button ${
                activeTab === "keywords" ? "active" : ""
              }`}
              onClick={() => setActiveTab("keywords")}
            >
              <i className="fas fa-key"></i> Keywords
            </button>
            <button
              className={`tab-button ${
                activeTab === "formatting" ? "active" : ""
              }`}
              onClick={() => setActiveTab("formatting")}
            >
              <i className="fas fa-align-left"></i> Formatting
            </button>
          </div>

          <div className="feedback-content">
            {activeTab === "overview" && (
              <div className="feedback-overview">
                <div className="feedback-summary-card">
                  <h3>
                    <i className="fas fa-chart-line"></i> ATS Compatibility
                  </h3>
                  <div className="ats-meter-container">
                    <div className="ats-meter">
                      <div
                        className={`ats-meter-fill ${
                          atsScore !== null
                            ? atsScore >= 7
                              ? "high-score"
                              : atsScore >= 5
                              ? "medium-score"
                              : "low-score"
                            : "low-score"
                        }`}
                        style={{
                          width: `${
                            atsScore !== null ? (atsScore / 10) * 100 : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="ats-meter-labels">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                  <p className="ats-description">
                    {atsScore !== null
                      ? atsScore >= 7
                        ? "Your resume appears well-optimized for ATS systems."
                        : atsScore >= 5
                        ? "Your resume has moderate ATS compatibility. Consider the suggestions."
                        : "Your resume may need significant improvements for optimal ATS compatibility."
                      : "ATS score not available. Feedback below may still be helpful."}
                  </p>
                </div>

                <div className="feedback-summary-card">
                  <h3>
                    <i className="fas fa-star"></i> Key Insights{" "}
                    {/* Changed from Key Strengths */}
                  </h3>
                  {/* Use the overview from parseFeedback if it's meaningful */}
                  <p>{overview}</p>
                </div>

                <div className="feedback-summary-card">
                  <h3>
                    <i className="fas fa-exclamation-triangle"></i> Areas to
                    Improve
                  </h3>
                  <ul className="improvements-list">
                    {missingKeywords.length > 0 && (
                      <li>
                        <strong>Missing Keywords:</strong>{" "}
                        {missingKeywords.length} key terms identified.
                      </li>
                    )}
                    {formattingIssues.length > 0 && (
                      <li>
                        <strong>Formatting/Grammar:</strong>{" "}
                        {formattingIssues.length} issues noted.
                      </li>
                    )}
                    {suggestions.length > 0 && (
                      <li>
                        <strong>Content Suggestions:</strong>{" "}
                        {suggestions.length} general suggestions provided.
                      </li>
                    )}
                    {missingKeywords.length === 0 &&
                      formattingIssues.length === 0 &&
                      suggestions.length === 0 && (
                        <li>
                          No specific areas for improvement clearly parsed from
                          feedback. Check other tabs.
                        </li>
                      )}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "suggestions" && (
              <div className="feedback-suggestions">
                <h3>Suggestions for Improvement</h3>
                {suggestions.length > 0 ? (
                  <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>
                        <div className="suggestion-item">
                          <i className="fas fa-lightbulb suggestion-icon"></i>
                          <span>{suggestion}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-message">
                    No specific suggestions for improvement identified from the
                    AI feedback.
                  </p>
                )}
              </div>
            )}

            {activeTab === "keywords" && (
              <div className="feedback-keywords">
                <h3>Missing Keywords</h3>
                {missingKeywords.length > 0 ? (
                  <div className="keywords-container">
                    {missingKeywords.map((keyword, index) => (
                      <div className="keyword-tag" key={`keyword-${index}`}>
                        <i className="fas fa-key"></i> {keyword}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-message">
                    No specific missing keywords identified in the AI feedback.
                  </p>
                )}
                <div className="keywords-tip">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    Including industry-specific keywords helps your resume pass
                    through Applicant Tracking Systems (ATS).
                  </p>
                </div>
              </div>
            )}

            {activeTab === "formatting" && (
              <div className="feedback-formatting">
                <h3>Formatting & Grammar Issues</h3>
                {formattingIssues.length > 0 ? (
                  <ul className="formatting-list">
                    {formattingIssues.map((issue, index) => (
                      <li key={`formatting-${index}`}>
                        <div className="formatting-item">
                          <i className="fas fa-exclamation-circle formatting-icon"></i>
                          <span>{issue}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-message">
                    No specific formatting or grammar issues identified in the
                    AI feedback.
                  </p>
                )}
                <div className="formatting-tip">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    Clean, consistent formatting makes your resume more readable
                    for both humans and ATS systems.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails;
