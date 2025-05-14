"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    recentUploads: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/resume/history");
        const history = response.data.history;

        // Calculate stats
        const totalResumes = history.length;

        // Calculate average score (only for resumes that have a score)
        const scoresArray = history
          .filter(
            (item) => item.atsScore !== null && item.atsScore !== undefined
          )
          .map((item) => item.atsScore);
        const averageScore =
          scoresArray.length > 0
            ? (
                scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length
              ).toFixed(1)
            : "N/A";

        // Get recent uploads (last 3)
        const recentUploads = history.slice(0, 3);

        setStats({
          totalResumes,
          averageScore,
          recentUploads,
        });
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-container">
        {loading ? (
          <>
            <div className="stat-card skeleton">
              <h3 className="skeleton-text"></h3>
              <p className="stat-value skeleton-text"></p>
            </div>
            <div className="stat-card skeleton">
              <h3 className="skeleton-text"></h3>
              <p className="stat-value skeleton-text"></p>
            </div>
            <div className="stat-card action-card skeleton">
              <h3 className="skeleton-text"></h3>
              <div className="skeleton-button"></div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <h3>Total Resumes</h3>
              <p className="stat-value">{stats.totalResumes}</p>
            </div>

            <div className="stat-card">
              <h3>Average ATS Score</h3>
              <p className="stat-value">{stats.averageScore}</p>
            </div>

            <div className="stat-card action-card">
              <h3>Analyze Resume</h3>
              <Link to="/upload" className="dashboard-button">
                Upload New Resume
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="recent-activity">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <Link to="/history" className="view-all-link">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="recent-uploads">
            {[1, 2, 3].map((item) => (
              <div className="resume-card skeleton" key={item}>
                <div className="resume-info">
                  <h3 className="skeleton-text"></h3>
                  <p className="skeleton-text"></p>
                  <p className="skeleton-text"></p>
                </div>
                <div className="resume-score">
                  <div className="score-circle skeleton"></div>
                  <p className="skeleton-text"></p>
                </div>
                <div className="skeleton-button"></div>
              </div>
            ))}
          </div>
        ) : stats.recentUploads.length > 0 ? (
          <div className="recent-uploads">
            {stats.recentUploads.map((resume) => (
              <div className="resume-card" key={resume._id}>
                <div className="resume-info">
                  <h3>{resume.fileName}</h3>
                  <p>Job Role: {resume.jobRole}</p>
                  <p>Date: {new Date(resume.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="resume-score">
                  <div className="score-circle">
                    <span>
                      {resume.atsScore !== null && resume.atsScore !== undefined
                        ? resume.atsScore
                        : "N/A"}
                    </span>
                  </div>
                  <p>ATS Score</p>
                </div>
                <Link
                  to={`/resume/${resume._id}`}
                  className="view-details-button"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>
              No resume uploads yet. Get started by uploading your first resume!
            </p>
            <Link to="/upload" className="dashboard-button">
              Upload Resume
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
