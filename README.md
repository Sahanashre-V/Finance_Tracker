# 📊 Intelligent Finance Tracker

A full-stack assignment for building an AI-powered personal finance tracker with Google OAuth authentication, natural language transaction entry, and a beautiful dashboard.

---

## 🚀 Overview

**Goal:** Build an intelligent finance tracker that allows users to:
- Sign in securely with Google OAuth
- Add transactions using natural language (AI parsing)
- View insights and analytics in a clean dashboard

---

## ✨ Core Features

### 🔐 Google OAuth Authentication
- Google OAuth 2.0 sign-in/sign-up
- Secure session handling (JWT)
- Per-user data isolation
- User profile management
- Sign out functionality

**User Stories:**
- As a user, I can sign in with my Google account  
- As a user, my financial data is private and secure  
- As a user, I can access my data from any device  

---

### 🤖 Smart Transaction Entry
- Natural language input
- AI parses amount, category, description
- Auto-categorization with confidence scoring
- User confirmation before saving

**Example Inputs:**
- `"I just bought a $250 Samsung Galaxy watch - Electronics"`
- `"Ordered Panda Express for $25"`
- `"Got paid $3500 salary today"`
---

### 📊 Dashboard + Transaction History
- Charts: Pie chart (categories), Line chart (trends)
- Summary cards: income, expenses, savings
- Transaction list with edit/delete
- Category filtering and search
- Monthly/weekly view toggles

---

## 🎨 Design Requirements
- AI-generated, modern UI (inspired by Credit Karma / Mint)
- Responsive (mobile-first)
- Smooth animations & micro-interactions
- Dark/light mode support (bonus)
- Clean typography & spacing
- Beautiful data visualizations with custom colors

---

## 🛠 Technical Requirements

### Frontend
- **Framework:** React
- **Styling:** Tailwind CSS
- **Charts:** Any charting library
- **Auth:** Google OAuth (client-side)
- **State:** React Context or Redux Toolkit

### Backend
- **Framework:** Node.js + Express
- **Database:** MongoDB 
- **Auth:** Google OAuth server verification + JWT
- **AI Integration:** OpenAI GPT-4 or Google Gemini
- **API Design:** RESTful with error handling

---

## 🤖 AI Integration
- Parse transactions: extract amount, category, description
- Handle parsing errors gracefully
- Learn from user history for better categorization

---
