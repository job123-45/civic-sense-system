# CivicSense AI - Smart Civic Complaint System

A modern, premium digital platform designed to enable citizens to efficiently report, track, and resolve urban issues such as potholes, waste management, or broken infrastructure. This project currently represents the full **Frontend UI**, built to seamlessly mock and integrate with backend AI and routing systems.

## 🌟 Key Features

- **Dashboard Analytics**: A stunning overview panel for municipal officers to visualize reported issues, resolution rates, and live intake streams.
- **AI-Assisted Issue Reporting (Mocked)**: Users upload photos of issues, and the system simulates an AI classification model (like CNN-RNN) extracting geotags, categorizing the issue, deciding urgency, and determining departmental routing.
- **Real-Time Issue Tracking**: A structured timeline view allows citizens to monitor the progression of their complaint from "Submitted" to "Resolved" with precise timestamps and status indicators.
- **Premium Aesthetic**: Engineered with pure CSS using advanced custom properties to deliver a sleek, glassmorphism-inspired UI with smooth gradients, responsive layouts, and interactive micro-animations.

## 💻 Tech Stack
- **React 18** (via Vite)
- **Vanilla CSS** (Custom Design System & Variables)
- **Recharts** (Dashboard Data Visualization)
- **Lucide React** (Consistent crisp iconography)
- **React Router** (Navigation)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed.

### Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **View in Browser**
   Open your browser and navigate to `http://localhost:5173`. 

## 📁 Project Structure

- `src/App.jsx` - Root component containing React Router configuration.
- `src/index.css` - Global CSS containing the premium design tokens, layouts, and animations.
- `src/components/Sidebar.jsx` - The persistent side navigation bar.
- `src/pages/Dashboard.jsx` - The main municipal analytics view with charts.
- `src/pages/ReportIssue.jsx` - The citizen reporting flow featuring mock AI analysis.
- `src/pages/TrackIssues.jsx` - The real-time timeline tracking panel for users.

## 🔮 Future Integration
Currently, the application manages mocked state internally. The next phase involves integrating a real backend (e.g., Python/Django or Node/Express) and an actual machine learning classification API to replace the simulated `setTimeout` logic in the `ReportIssue` component.
