# MoralVerse – AI Moderated Moral Sharing Platform

MoralVerse is a scalable, secure, AI-powered web platform for sharing moral stories and quotes.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **AI**: OpenRouter API for content and image moderation
- **Database**: MongoDB

## Prerequisites
- Node.js (v14+)
- MongoDB (running locally on port 27017)
- OpenRouter API Key

## Setup & Run

### 1. Setup Backend
1. Navigate to the `server` directory:
   \`\`\`bash
   cd server
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a `.env` file based on the example and add your keys:
   \`\`\`
   PORT=4000
   MONGO_URI=mongodb://127.0.0.1:27017/MoralPostDB
   JWT_SECRET=your_jwt_secret
   OPENROUTER_API_KEY=your_openrouter_key
   \`\`\`
4. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

### 2. Setup Frontend
1. Navigate to the `client` directory:
   \`\`\`bash
   cd client
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Features
- **AI Moderation**: Automaticaly flags and rejects harmful text content.
- **Moral Editor**: Customize your post with fonts, colors, and backgrounds.
- **Feed**: View and like posts from the community.
- **Glassmorphism UI**: Modern and sleek design.

## Project Structure
- \`server/\`: Backend API and database models
- \`client/\`: React frontend application
