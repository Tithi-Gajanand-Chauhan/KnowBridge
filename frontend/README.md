# 🧠 KnowBridge Frontend — AI-Powered Shared Memory Platform

> Built for **UNCHARTED 2026 Hackathon | Track 1: Agentic Memory**  
> Modern, polished, and responsive React + Vite application inspired by Linear, Notion, and Slack.

---

## 🚀 Running the Frontend

To start the local development server:

```bash
cd frontend
npm run dev
```

The application will be live at: **`http://localhost:5173`**

To build for production:

```bash
npm run build
```

---

## 🎨 Design Direction & Aesthetic Standards

- **Theme**: Clean off-white background (`#F8FAFC`), charcoal/navy typography (`#0F172A`), and refined indigo brand accents (`#4F46E5`).
- **Typography & Layout**: Standardized Inter system font stack, rounded cards (`rounded-2xl`), subtle borders (`border-slate-200`), and soft shadows.
- **Icons**: Lucide React (`lucide-react`).
- **No AI Clutter**: Avoids gaudy gradients, neon glows, and noisy animations in favor of a mature, production-grade SaaS aesthetic.

---

## 📄 Pages Implemented

### 1. Landing Page (`/`)
- Brand navbar with navigation and launch CTA.
- Hero section: *"Your team's knowledge, remembered. Every decision, connected."*
- Interactive product showcase preview with live conflict interception demo.
- 6-part feature breakdown (Memory extraction, Atlas Vector 3072-dim, Conflict detection, TTL auto-expiry, Grounded citations, History preserving).
- 3-step workflow walkthrough.
- Modern footer with hackathon credits.

### 2. Authentication Pages (`/login` & `/register`)
- Clean form layouts with validation and password visibility toggle.
- **1-Click Demo Sign-In**: Instant persona switching for hackathon judges (Soham, Tithi, Krisha, Rahul).
- Password strength indicator on registration.

### 3. Main Dashboard (`/app`)
- Responsive sidebar with workspace switcher (`default`, `payments-core`, `mobile-app`).
- Live metrics: Total Active Memories, Pending Conflicts, Team Contributors, TTL Constraints.
- Quick Natural Language Search Bar (`⌘K`).
- Conflict Alert Banner with 1-click resolution shortcut.
- Recent Memories feed and chronological Audit Stream.

### 4. Memory Explorer (`/app/explorer`)
- Full catalog of team memories with category filters:
  - Technical Decisions
  - Architectural Rules
  - Incident Resolutions
  - Temporary Constraints (TTL)
  - General Knowledge
- Status filtering (Active, Deprecated, Expiring soon).
- Sorting by Newest, Oldest, Relevance, or Title.
- Grid View vs Compact List View toggle.
- Detailed Memory Modal with complete rationale, tags, and superseded ancestry.

### 5. AI Memory Search (`/app/search`)
- Natural language query interface with suggested engineering prompts.
- Synthesized grounded answer citing exact team decisions.
- Memory Citations list with cosine similarity percentage (e.g. `96% Match`).
- Copy answer shortcut and deep inspection drawer.

### 6. Conflict Detection & Alignment Hub (`/app/conflicts`)
- Side-by-side visual comparison: Proposed Decision vs Existing Active Rule.
- Detailed contradiction explanation and recommended action.
- Interactive resolution workflow:
  - **Supersede & Make Active**: Deprecates old decision and links via `superseded_by`.
  - **Keep Active (Reject Change)**: Rejects candidate change to protect standard.
  - **Scoped Exception**: Records conditional exception.

### 7. Team & Contributors (`/app/team`)
- Member directory (Soham, Tithi, Krisha, Rahul, Priya).
- Activity metrics: Logged decisions, conflicts resolved, queries run.
- Persona switcher for live presentations.
- Invite teammate modal.

### 8. Settings & Preferences (`/app/settings`)
- Profile preferences.
- Workspace scoping & MongoDB TTL index policy details.
- Vector Engine parameters (Gemini 1.5, `text-embedding-004` 3072-dim, similarity threshold slider).
- Export all memories as JSON.
- Reset to sample hackathon seed data.

---

## 🔌 Backend Integration & Mock API Service Layer

The frontend API client is located at **`src/services/api.js`** and directly matches the proposed endpoints in `API_INTEGRATION_GUIDE.md`:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/memories/extract` | `POST` | Extracts decisions from unstructured chat/text |
| `/api/memories` | `POST` | Saves memory with 3072-dim vector embedding |
| `/api/chat` | `POST` | Context-aware Q&A with memory citations |
| `/api/memories/check-conflict` | `POST` | Pre-checks candidate decision for contradictions |
| `/api/memories/:id/supersede` | `PUT` | Deprecates older memory and links new decision |
| `/api/memories` | `GET` | Lists memories filtered by workspace and status |

### Dual Hybrid Architecture:
- If an Express backend is running on `http://localhost:5000` (or `VITE_API_URL`), the client automatically calls live endpoints.
- If no backend is running, the client seamlessly falls back to a high-fidelity in-memory engine backed by `localStorage` so the entire app works 100% offline for hackathon demos.
