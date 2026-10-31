# 🧠 KnowBridge — AI-Powered Persistent Team Memory Platform

> **UNCHARTED 2026 Hackathon | Track 1: Agentic Memory**  
> *In collaboration with MongoDB & n8n | NEXUS, SVNIT Surat*

---

## 📌 Problem Statement & Overview

In fast-paced engineering organizations, **tribal knowledge vanishes** when senior engineers leave, teams reorganize, or decisions get buried in Slack threads and meeting transcripts. 

**KnowBridge** is an autonomous team memory platform that captures architectural decisions, coding rules, incident resolutions, and temporary constraints. It transforms organizational context into **persistent, queryable memory** that visibly adapts an AI copilot's recommendations and detects contradictions before bad technical debt compounds.

---

## ✨ Key Capabilities (Track 1 Alignment)

### 1. 🔍 Smart Memory Extraction
* Automatically filters casual conversation, lunch chatter, and trivial remarks.
* Identifies and extracts high-signal technical decisions, categories, sources, and rationales into structured JSON.

### 2. ⚡ MongoDB Atlas Vector Search
* Generates 3072-dimensional vector embeddings for all team memories using Gemini embeddings.
* Performs hardware-accelerated semantic recall with metadata filters (`workspace`, `status: "active"`).
* Includes resilient in-memory cosine fallback to guarantee high availability.

### 3. ⚠️ AI Conflict Detection & History Preservation
* Automatically compares proposed new decisions against existing active memories.
* If a contradiction is detected (e.g. proposing Firebase when custom JWT was standardized), KnowBridge flags the conflict, explains why, and prompts for human confirmation.
* Preserves complete decision audit trails: outdated memories are marked `deprecated` and linked via `superseded_by` rather than silently overwritten.

### 4. ⏳ Time-To-Live (TTL) Automatic Expiry
* Native **MongoDB TTL Index** (`expires_at_1` with `expireAfterSeconds: 0`).
* Temporary policies (e.g., Diwali code freeze, sprint-level deployment holds) auto-expire when their date passes without manual cleanup.

### 5. 🤖 Grounded, Context-Aware Q&A
* Answers developer questions strictly grounded in remembered team decisions.
* Cites the exact memories and similarity match scores that influenced its reasoning.

---

## 🏗️ Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Frontend (React)       │
                                  │   Chat & Memory Inspector   │
                                  └──────────────┬──────────────┘
                                                 │ REST APIs
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    Backend (Express API)    │
                                  │   Routes & Orchestration    │
                                  └──────────────┬──────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
         ┌─────────────────────────────┐                   ┌─────────────────────────────┐
         │     AI Memory Engine        │                   │     MongoDB Atlas Cloud     │
         │   • Semantic Extraction     │                   │   • Persistent Documents    │
         │   • Conflict Detection      │ ◄───────────────► │   • Atlas Vector Search     │
         │   • Gemini LLM Reasoning    │                   │   • TTL Auto-Expiry Index   │
         │   • Embeddings Generation   │                   │   • Multi-Tenant Workspaces │
         └─────────────────────────────┘                   └─────────────────────────────┘
```

---

## 🗄️ MongoDB Memory Document Schema

```javascript
{
  "_id": ObjectId("..."),
  "title": "Migrate from Firebase Auth to Custom JWT",
  "content": "Migrating to custom JWT tokens due to multi-tenant RBAC requirements.",
  "category": "technical_decision", // technical_decision | architecture_rule | incident_resolution | temporary_constraint
  "source": "Rahul (Tech Lead)",
  "workspace": "default",
  "status": "active",               // active | deprecated | conflicted
  "superseded_by": null,            // Points to newer Memory ID when overridden
  "conflicts_with": [],
  "tags": ["auth", "jwt", "security"],
  "expires_at": null,               // Monitored by MongoDB TTL Index
  "embedding": [ ...3072 floats... ],
  "createdAt": ISODate("2026-10-31T06:50:44.000Z"),
  "updatedAt": ISODate("2026-10-31T06:50:44.000Z")
}
```

---

## 🚀 Quick Start & Setup

### 1. Prerequisites
* Node.js v18+
* MongoDB Atlas Cluster (M0 or higher) with a `memories` collection
* Google Gemini API Key

### 2. Installation
```bash
git clone https://github.com/Tithi-Gajanand-Chauhan/KnowBridge.git
cd KnowBridge
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/knowbridge?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Diagnostics & Test Suite
```bash
# Verify MongoDB Atlas and Gemini AI connectivity
npm run test:connection

# Run end-to-end AI Memory Engine test suite (Extraction, Conflict Detection, Behavioral Shift)
npm run test:engine

# Seed sample engineering memories
npm run seed
```

---

## 👥 Team Members

* **Tithi** — Database, AI Memory Engine & Deployment Lead
* **Krisha** — Backend & Express API Lead
* **Soham** — Frontend & UI/UX Lead

---

## 📜 License
Developed for UNCHARTED 2026 Hackathon at SVNIT Surat.
