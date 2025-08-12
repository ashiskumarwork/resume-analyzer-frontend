import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/UploadResume.css";

// UploadResume: drag-and-drop file upload with job role input and submit to API.
const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  // Suggested roles (datalist) - optimized array
  const COMMON_JOB_ROLES = useMemo(
    () => [
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
    ],
    []
  );

  // File validation constants
  const SUPPORTED_FILE_TYPES = {
    PDF: "application/pdf",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  const SUPPORTED_EXTENSIONS = useMemo(() => ["pdf", "docx"], []);

  // Accepts PDF/DOCX via MIME type or extension and stores the file
  const validateAndSetFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;

      const fileType = selectedFile.type;
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      const isValidFile =
        fileType === SUPPORTED_FILE_TYPES.PDF ||
        fileType === SUPPORTED_FILE_TYPES.DOCX ||
        SUPPORTED_EXTENSIONS.includes(fileExtension);

      if (isValidFile) {
        setFile(selectedFile);
        setError("");
      } else {
        setFile(null);
        setError("Please upload a PDF or DOCX file");
      }
    },
    [SUPPORTED_FILE_TYPES.PDF, SUPPORTED_FILE_TYPES.DOCX, SUPPORTED_EXTENSIONS]
  );

  // File selection via input
  const handleFileChange = useCallback(
    (e) => validateAndSetFile(e.target.files[0]),
    [validateAndSetFile]
  );

  // Drag-and-drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      e.dataTransfer.files?.[0] && validateAndSetFile(e.dataTransfer.files[0]);
    },
    [validateAndSetFile]
  );

  // Submit form data to backend and navigate to latest resume details
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
        // Fetch latest history to show the fresh analysis
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

  const removeFile = useCallback(() => {
    setFile(null);
    setError("");
  }, []);

  // File size formatting constants
  const FILE_SIZE_BASE = 1024;
  const FILE_SIZE_UNITS = useMemo(() => ["Bytes", "KB", "MB", "GB"], []);

  // Format file size in a friendly unit
  const formatFileSize = useCallback(
    (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const i = Math.floor(Math.log(bytes) / Math.log(FILE_SIZE_BASE));
      return (
        parseFloat((bytes / Math.pow(FILE_SIZE_BASE, i)).toFixed(2)) +
        " " +
        FILE_SIZE_UNITS[i]
      );
    },
    [FILE_SIZE_BASE, FILE_SIZE_UNITS]
  );

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>📤 Upload Your Resume</h1>
        <p className="upload-subtitle">
          Get instant AI-powered feedback on your resume! 🚀
        </p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Step 1: File */}
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

        {/* Selected file preview */}
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

        {/* Step 2: Job role */}
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
                {COMMON_JOB_ROLES.map((role) => (
                  <option key={role} value={role} />
                ))}
              </datalist>
            </div>
            <p className="input-hint">
              💡 Select from common roles or type your own
            </p>
          </div>
        </div>

        {/* Error + submit */}
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
