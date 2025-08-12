# AI Resume Analyzer Frontend

A modern React.js web application that provides AI-powered resume analysis and ATS (Applicant Tracking System) compatibility scoring.

## 🚀 Features

- **AI-Powered Analysis**: Get instant feedback on your resume using advanced AI
- **ATS Compatibility Scoring**: Receive scores from 1-10 indicating how well your resume performs with ATS systems
- **Drag & Drop Upload**: Easy file upload with support for PDF and DOCX formats
- **Resume History**: Track and manage all your uploaded resumes
- **Detailed Feedback**: View comprehensive AI-generated feedback for each resume
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User Authentication**: Secure login and registration system

## 🛠️ Tech Stack

- **Frontend**: React.js 18.2.0
- **Routing**: React Router DOM 6.8.0
- **HTTP Client**: Axios 1.9.0
- **Styling**: CSS3 with modern design patterns
- **Build Tool**: Create React App 5.0.1

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd resume-analyzer-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will open at [http://localhost:3000](http://localhost:3000).

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.js       # Navigation component
├── context/            # React Context providers
│   └── AuthContext.js  # Authentication state management
├── pages/              # Main application pages
│   ├── Dashboard.js    # User dashboard with stats
│   ├── LandingPage.js  # Welcome/landing page
│   ├── Login.js        # User login form
│   ├── Register.js     # User registration form
│   ├── ResumeDetails.js # Individual resume analysis view
│   ├── ResumeHistory.js # List of all uploaded resumes
│   └── UploadResume.js # Resume upload interface
├── styles/             # CSS stylesheets
├── utils/              # Utility functions
│   └── api.js         # API configuration and helpers
└── App.js             # Main application component
```

## 🚀 Available Scripts

- **`npm start`** - Runs the app in development mode
- **`npm run build`** - Builds the app for production
- **`npm test`** - Launches the test runner
- **`npm run eject`** - Ejects from Create React App (one-way operation)

## 🔧 Configuration

### Environment Variables

- `REACT_APP_API_BASE_URL`: Backend API base URL (default: http://localhost:5000/api)

### API Endpoints

The frontend communicates with the backend API for:

- User authentication (login/register)
- Resume upload and analysis
- Resume history retrieval
- File downloads

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with intuitive navigation
- **Loading States**: Skeleton loaders and spinners for better user experience
- **Error Handling**: User-friendly error messages and recovery options
- **Responsive Layout**: Optimized for all screen sizes
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🔒 Security

- JWT token-based authentication
- Secure API communication
- Input validation and sanitization
- Protected routes for authenticated users

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React.js**
