import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Make Your Resume Awesome! 🚀</h1>
          <p className="hero-subtitle">
            Get instant feedback, ATS compatibility scores, and super helpful
            suggestions to make your resume stand out from the crowd! ✨
          </p>

          {isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/upload" className="primary-button">
                📄 Upload Resume
              </Link>
              <Link to="/dashboard" className="secondary-button">
                📊 Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                🎉 Get Started Free
              </Link>
              <Link to="/login" className="secondary-button">
                🔑 Login
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="student-note">
        <strong>Hey there! 👋</strong> This tool was made by students, for
        students. We know how tough job hunting can be, so we've made this super
        easy to use!
      </div>

      <section className="features-section">
        <h2>How It Works (Super Simple!) 🎯</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Upload Your Resume</h3>
            <p>Just drag and drop your resume (PDF or DOCX works great!)</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Magic Happens</h3>
            <p>
              Our smart AI analyzes your resume and compares it to job
              requirements
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Get Your Score</h3>
            <p>See your ATS compatibility score and get detailed feedback</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✏️</div>
            <h3>Improve & Repeat</h3>
            <p>Apply the suggestions and watch your resume get better!</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Make Your Resume Shine? ✨</h2>
        <p>
          Join thousands of students who've already improved their chances of
          landing their dream jobs!
        </p>

        {isAuthenticated ? (
          <Link to="/upload" className="cta-button">
            🚀 Upload Your Resume Now
          </Link>
        ) : (
          <Link to="/register" className="cta-button">
            🎓 Start Your Free Journey
          </Link>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
