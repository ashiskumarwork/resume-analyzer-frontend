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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

    // Check if file is PDF or DOCX
    if (
      fileType === "application/pdf" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileExtension === "pdf" ||
      fileExtension === "docx"
    ) {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please upload a PDF or DOCX file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a resume file");
      return;
    }

    if (!jobRole) {
      setError("Please select or enter a job role");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobRole", jobRole);

    try {
      const response = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Instead of redirecting, navigate to the details page of the newly uploaded resume
      // The backend should return the ID of the newly created resume analysis
      if (response.data && response.data.success) {
        // Get the latest resume from history
        const historyResponse = await api.get("/resume/history");
        if (
          historyResponse.data &&
          historyResponse.data.history &&
          historyResponse.data.history.length > 0
        ) {
          // Navigate to the most recent resume (which should be the one we just uploaded)
          const latestResumeId = historyResponse.data.history[0]._id;
          navigate(`/resume/${latestResumeId}`);
        } else {
          navigate("/history");
        }
      } else {
        navigate("/history");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Your Resume</h1>
      <p className="upload-subtitle">
        Upload your resume to get AI-powered feedback and ATS compatibility
        score
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div
          className={`file-drop-area ${dragActive ? "drag-active" : ""} ${
            file ? "has-file" : ""
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="resume"
            className="file-input"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />

          {file ? (
            <div className="file-info">
              <i className="fas fa-file-alt file-icon"></i>
              <span className="file-name">{file.name}</span>
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => setFile(null)}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="drop-message">
              <i className="fas fa-cloud-upload-alt upload-icon"></i>
              <p>Drag & drop your resume here or</p>
              <label htmlFor="resume" className="select-file-btn">
                Browse Files
              </label>
              <p className="file-format-hint">Supported formats: PDF, DOCX</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="jobRole">Target Job Role</label>
          <div className="job-role-input-container">
            <input
              type="text"
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Enter the job role you're applying for"
              list="jobRolesList"
              required
            />
            <datalist id="jobRolesList">
              {commonJobRoles.map((role, index) => (
                <option key={index} value={role} />
              ))}
            </datalist>
          </div>
        </div>

        <button
          type="submit"
          className="upload-button"
          disabled={loading || !file || !jobRole}
        >
          {loading ? (
            <>
              <div className="button-spinner"></div>
              Analyzing Resume...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadResume;
