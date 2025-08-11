"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/UploadResume.css";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const commonJobRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Data Scientist",
    "Product Manager",
    "Project Manager",
    "Software Engineer",
    "DevOps Engineer",
    "QA Engineer",
    "Marketing Specialist",
    "Sales Representative",
    "Customer Support",
    "Human Resources",
    "Financial Analyst",
  ];

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    const isValidFile =
      fileType === "application/pdf" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileExtension === "pdf" ||
      fileExtension === "docx";

    if (isValidFile) {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please upload a PDF or DOCX file");
    }
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !jobRole) {
      setError(
        !file
          ? "Please select a resume file"
          : "Please select or enter a job role"
      );
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobRole", jobRole);

    try {
      const response = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success) {
        const historyResponse = await api.get("/resume/history");
        const latestResumeId = historyResponse.data?.history?.[0]?._id;
        navigate(latestResumeId ? `/resume/${latestResumeId}` : "/history");
      } else {
        navigate("/history");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>📤 Upload Your Resume</h1>
        <p className="upload-subtitle">
          Get instant AI-powered feedback on your resume! 🚀
        </p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-section">
          <h3>📄 Step 1: Upload Your Resume</h3>
          <div
            className={`file-drop-area ${dragActive ? "drag-active" : ""} ${
              file ? "has-file" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="file-input"
              id="file-input"
            />
            <div className="drop-message">
              <div className="upload-icon">📄</div>
              <h4>Drop your resume here or click to browse</h4>
              <p>Supports PDF and DOCX files up to 10MB</p>
            </div>
            <label htmlFor="file-input" className="select-file-btn">
              📁 Choose File
            </label>
          </div>
          <p className="file-format-hint">
            💡 Tip: Make sure your resume is clear and well-formatted for better
            analysis
          </p>
        </div>

        {file && (
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{formatFileSize(file.size)}</div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="remove-file-btn"
            >
              ❌
            </button>
          </div>
        )}

        <div className="form-section">
          <h3>🎯 Step 2: Select Job Role</h3>
          <div className="form-group">
            <label htmlFor="job-role">Job Role:</label>
            <div className="job-role-input-container">
              <input
                type="text"
                id="job-role"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., Frontend Developer, Data Scientist..."
                className="job-role-input"
                list="common-roles"
              />
              <datalist id="common-roles">
                {commonJobRoles.map((role) => (
                  <option key={role} value={role} />
                ))}
              </datalist>
            </div>
            <p className="input-hint">
              💡 Select from common roles or type your own
            </p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="upload-button">
          {loading ? (
            <>
              <div className="button-spinner"></div>⏳ Analyzing Resume...
            </>
          ) : (
            "🚀 Analyze My Resume"
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadResume;
