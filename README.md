# Adventure App

A modern **Choose Your Own Adventure** web application built with **FastAPI** (Python backend) and **React + Vite + TailwindCSS + DaisyUI** (frontend).

Users can generate interactive branching stories, navigate through nodes, and see their final story rendered with a dynamic background image.

---

## ✨ Features

- FastAPI backend with:

  - Story generation via OpenAI GPT (if API key configured).
  - Fallback sample generator (works without an API key).
  - Persistent storage in SQLite or PostgreSQL.
  - Job system for async generation.

- React frontend with:

  - Modern Vite + Tailwind v4 + DaisyUI UI.
  - Light/Dark theme toggle.
  - Story outline tree view.
  - Node viewer with branching choices.
  - Final story panel with dynamic Unsplash background.
  - Footer with author + GitHub link.

---

## 🛠 Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Pydantic, LangChain + OpenAI (optional).
- **Frontend:** React 18, Vite 5, TailwindCSS 4, DaisyUI.
- **Database:** SQLite (default), PostgreSQL (production-ready).

---

## 📦 Installation

### 1. Clone repository

```bash
 git clone https://github.com/ahmadsadin/adventure-app.git
 cd adventure-app
```

### 2. Backend setup

```bash
 cd backend
 python -m venv venv
 source venv/bin/activate   # (on Windows: venv\Scripts\activate)
 pip install -r requirements.txt
```

Create a **.env** file in `backend/`:

```env
DEBUG=True
OPENAI_API_KEY=             # optional, leave empty to use sample generator
DATABASE_URL=sqlite:///./database.db
ALLOWED_ORIGINS=["http://localhost:5173"]
```

Run the backend:

```bash
 uvicorn main:app --reload
```

Backend will be available at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

- API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend setup

```bash
 cd frontend
 npm install
 npm run dev
```

Frontend will be available at: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🚀 Deployment

- **Backend**: Deploy via Docker, Render, Railway, or any FastAPI-compatible host.
- **Frontend**: Build with `npm run build` and serve the `dist/` folder (can be mounted in FastAPI using `StaticFiles`).
- **Database**: Use SQLite for dev, PostgreSQL in production.

---

## 📖 Usage

1. Enter a **theme** (e.g. _space pirates in a solar storm_).
2. Click **Generate**.

   - If API key configured → OpenAI generates a unique story.
   - Otherwise → Sample generator creates a deterministic story.

3. Navigate through the outline tree.
4. Read nodes and make branching choices.
5. If you reach an ending → the **Final Story panel** shows your complete path.

---

## 🧩 Project Structure

```
backend/
 ├─ core/ (config, prompts, story_generator)
 ├─ db/ (database.py)
 ├─ models/ (SQLAlchemy models)
 ├─ routers/ (FastAPI routes)
 ├─ schemas/ (Pydantic schemas)
 └─ main.py

frontend/
 ├─ src/
 │  ├─ App.jsx
 │  ├─ components/
 │  ├─ hooks/
 │  ├─ lib/
 │  └─ styles/
 └─ vite.config.js
```

---

## 👤 Author

**Ahmad Sadin**
[GitHub](https://github.com/ahmadsadin)

---

## 📜 License

This project is open-source and available under the **MIT License**.
