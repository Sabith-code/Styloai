# StyloAI Deployment Guide

This guide covers:
1. Creating a new GitHub repository and pushing your code
2. Deploying the app for free (backend + frontend)

---

## 1. Create a New GitHub Repository and Push Your Code

### a. Initialize Git (if not already done)
```sh
git init
git add .
git commit -m "Initial commit"
```

### b. Create a New Repository on GitHub
- Go to https://github.com/new
- Name your repo (e.g., `styloai`)
- Do NOT initialize with a README, .gitignore, or license (your local files will be pushed)

### c. Add Remote and Push
Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME`:
```sh
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy for Free

### Backend (FastAPI + Firebase + OpenRouter)
#### Option 1: Render.com (Recommended for FastAPI)
1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub and select your repo
4. Set build & start commands:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Set environment variables in Render dashboard:
   - `OPENROUTER_API_KEY` (from OpenRouter)
   - `FIREBASE_CREDENTIALS` (JSON string or file path)
   - Any others from your `.env`
6. Deploy. Your API will be live at `https://<your-app>.onrender.com`

#### Option 2: Railway.app (Alternative)
- Similar steps: New Project → Deploy from GitHub → Set environment variables → Deploy

### Frontend (Next.js)
#### Vercel (Best for Next.js)
1. Go to https://vercel.com/
2. Import your GitHub repo
3. Set environment variables (from `.env`)
4. Deploy. Your app will be live at `https://<your-app>.vercel.app`

---

## 3. Environment Variables
- Copy `.env.example` to `.env` and fill in all required values before deploying.
- Never commit secrets to GitHub.

---

## 4. Useful Links
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

## 5. Troubleshooting
- Check logs in Render/Vercel dashboard for errors
- Make sure all environment variables are set
- For CORS/API issues, ensure frontend URL is allowed in backend CORS settings

---

**Enjoy your personal AI stylist!**
