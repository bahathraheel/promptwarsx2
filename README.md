<div align="center">

# 🗳️ ELITE ELECTION

**An immersive, 3D AI-powered election assistant & educational guide.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-success?logo=nodedotjs)](https://nodejs.org)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=threedotjs)](https://threejs.org)
[![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-AI-blue?logo=google)](https://deepmind.google/technologies/gemini/)
[![Tests](https://img.shields.io/badge/Tests-111_Passing-success)](#)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_AAA-purple)](#)

</div>

---

## ✨ Overview

**ELITE ELECTION** is an interactive, web-based educational platform designed to demystify the democratic process. Using an immersive **Unique 3D Cyber-Glass Interface**, users are guided step-by-step through voter registration, election timelines, polling day procedures, and result certification. 

At the core of the experience is an integrated **Google Gemini AI Assistant** that acts as your personalized, non-partisan election guide.

---

## 🌟 Key Features

### 🕶️ Immersive 3D Experience
- **Cyber-Wireframe Models**: Procedurally generated 3D low-poly objects (Globe, Ballot Box, Clipboard, etc.) wrapped in glowing wireframe edges.
- **Dynamic Scroll Animations**: Seamlessly transition between election zones using GSAP ScrollTrigger.
- **Interactive UI Parallax**: Glassmorphism UI panels dynamically tilt and float in 3D perspective based on mouse movement.
- **Cyber-Grid Horizon**: Infinite scrolling perspective floor to ground the experience.

### 🤖 Smart AI Election Assistant (Gemini)
- **Context-Aware**: The AI understands exactly which 3D zone you are currently viewing.
- **Conversation Memory**: Remembers past interactions for a natural, flowing conversation.
- **Intent Routing & Follow-ups**: Automatically classifies your intent and offers 4 smart, clickable follow-up questions tailored to your current topic.
- **Proactive Tips**: Pushes helpful, zone-specific tips automatically as you explore the timeline.
- **Markdown & TTS**: Chat supports rich text formatting, copy-to-clipboard, and Text-to-Speech (TTS) reading.

### 🔒 Enterprise-Grade Architecture
- **Security First**: Comprehensive protection including Helmet CSP, strict CORS, rate limiting, input sanitization, and CSRF tokens.
- **Robust Error Handling**: Standardized error classes that safely abstract internal failures away from the user.
- **Thoroughly Tested**: Backed by **111 automated tests** covering Unit, Integration, Security, Accessibility, and Performance metrics (69%+ coverage).

### ♿ Accessibility (WCAG AAA)
- **Text-Only Mode**: A dedicated, ultra-fast text fallback mode for screen readers and low-bandwidth connections.
- **ARIA Compliant**: Fully navigable via keyboard with semantic DOM structure and ARIA attributes.
- **Color Contrast**: Designed with strict adherence to high-contrast guidelines.

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Backend** | Node.js, Express.js |
| **Frontend** | Vanilla JS, HTML5, CSS3 Glassmorphism |
| **3D & Animation** | Three.js (r128), GSAP + ScrollTrigger |
| **AI Integration** | Google Generative AI (Gemini 2.0 Flash) |
| **Testing** | Jest |
| **Deployment** | Google Cloud Run (Docker) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elite-election.git
   cd elite-election
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=8080
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:8080`.*

---

## 🧪 Testing

The project maintains a rigorous test suite:

```bash
# Run all tests (Unit, Integration, Security, etc.)
npm test

# Run tests with coverage report
npm run test -- --coverage
```

---

## 📂 Project Structure

```text
├── server.js              # Express application entry point
├── public/                # Static frontend assets
│   ├── index.html         # Main immersive 3D experience
│   ├── text-mode.html     # Accessible text-only mode
│   ├── css/               # Modular CSS (Design System, UI, 3D overlays)
│   └── js/                
│       ├── app.js         # Core frontend orchestrator
│       ├── assistant-ui.js# Chat panel logic
│       └── scene/         # Three.js 3D modules (Lighting, Zones, Interactions)
├── src/                   
│   ├── routes/            # Express API routes (/api/assistant, /api/zones)
│   ├── middleware/        # Security, validation, logging, rate limiters
│   ├── services/          # External integrations (Gemini AI, TTS, etc.)
│   └── utils/             # Error handling, sanitization logic
├── data/                  # Static election data & knowledge base
└── tests/                 # 111 comprehensive tests across 32 suites
```

---

## 📄 License

This project is licensed under the MIT License.