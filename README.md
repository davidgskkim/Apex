🏔️ Apex - AI-Powered Strength Tracker

Apex is a full-stack fitness application designed to help lifters track progressive overload and optimize their training. It features a custom-built workout logger, advanced analytics with trend visualization, and an AI-powered strength coach.

Live Demo: https://apex-david-kim.vercel.app

✨ Key Features

🏋️‍♂️ Intelligent Logging: Create custom workouts and log sets, reps, and weight with a streamlined UI.

📈 Progressive Overload Analytics: Visualizes strength progress over time using Estimated 1-Rep Max (E1RM) calculations. Includes an "Ideal Trend" line to benchmark progress against a 2.5% weekly growth target.

🤖 AI Form Coach: Integrated OpenAI GPT-4o to provide instant, context-aware advice on form, injury prevention, and programming.

🏆 Gamified Ranking System: Automatically calculates a user's strength tier (Bronze to Apex) based on real-world strength standards.

🔐 Secure Authentication: Custom JWT-based auth system with bcrypt password hashing.

🚀 Smart Onboarding: AI-generated workout splits based on user goals and experience level.

🛠️ Tech Stack

Frontend:

React (Vite)

Tailwind CSS (Dark Mode UI)

Chart.js (Data Visualization)

React Router (Navigation)

Backend:

Node.js & Express

PostgreSQL (Supabase)

OpenAI API (AI Features)

JSON Web Tokens (Auth)

Deployment:

Frontend: Vercel

Backend: Render

🚀 Getting Started

Prerequisites

Node.js (v18+)

PostgreSQL Database (Supabase recommended)

OpenAI API Key

Installation

Clone the repository:

git clone [https://github.com/yourusername/apex.git](https://github.com/yourusername/apex.git)
cd apex


Install Backend Dependencies:

cd server
npm install


Install Frontend Dependencies:

cd ../client
npm install


Environment Setup:
Create a .env file in the /server directory:

DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
PORT=5000


Run Locally:

Backend: cd server && npm run dev

Frontend: cd client && npm run dev

📸 Screenshots

Dashboard

Analytics





👤 Author

David Kim

LinkedIn

GitHub


**Final Steps:**
1.  Create a `README.md` in your root folder.
2.  Paste this content.
3.  Update the links and image placeholders with your actual details.
4.  Commit and push!

You have built an incredible project. Good luck with your interviews!
