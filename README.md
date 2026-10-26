# CivicSense AI - Smart Civic Complaint System

A civic complaint prototype with a React frontend and an Express/MongoDB backend. AI classification and routing remain simulated in the UI; the backend provides account, issue, and upload APIs.

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
- `server/` - Express API, MongoDB connection, authentication, and issue upload handling.

## Backend setup

Install the backend dependencies and create a local environment file:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI` to the MongoDB instance intended for this environment. Generate a cryptographically random JWT secret of at least 32 bytes (64 hexadecimal characters is a convenient representation) and set `JWT_SECRET` in the ignored `server/.env` file or the deployment secret store. The server refuses to start if the secret is missing or too short. Never commit `.env` or put the secret in frontend code.

Start the API from the `server` directory with `npm start`. Run its security regression tests there with `npm test`.

## 🔮 Future Integration
The frontend currently manages mocked state internally. Future work can connect it to the existing Express API and replace the simulated `setTimeout` classification logic in the `ReportIssue` component with a real machine learning classification API.
