# ✦ ClipForge
### AI-Powered Video Generation Platform

> Write a script → get a professional short-form video. AI voiceovers, animated word-by-word captions, stock footage, and cloud storage — all in one editor.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, Axios |
| Backend | Node.js, Express, MongoDB/Mongoose |
| Queue | BullMQ + Upstash Redis |
| AI / TTS | ElevenLabs |
| Transcription | AssemblyAI (word-level captions) |
| Video Processing | FFmpeg (fluent-ffmpeg) |
| Stock Footage | Pexels API |
| Auth | JWT (access 15min + refresh 7d) + Google OAuth 2.0 |
| Storage | Supabase Storage |
| Payments | Razorpay |
| Deployment | Vercel (frontend) + Render (backend) |

---

## ✅ Features

### Video Templates

| Template | Token Cost | Status |
|---|---|---|
| Reddit Story | 8 tokens | ✅ Working |
| Dialogue | 10 tokens | ✅ Working |
| Voiceover | 5 tokens | ✅ Working |
| Auto Captions | 3 tokens | ✅ Working |
| Lip Sync | 25 tokens | 🔜 Coming Soon |
| Avatar | 20 tokens | 🔜 Coming Soon |

### Platform Features
- Real token deduction (atomic, before processing starts)
- Live token balance in navbar
- AssemblyAI real word-level captions
- Projects page with real DB data
- Dashboard stats with real DB data
- Google OAuth 2.0 + JWT auth
- Save display name & update password
- Watermark for free plan users
- Resolution selector (9:16, 16:9, 1:1)
- Affiliate click tracking
- Admin panel with real data
- Session restore on refresh
- Supabase Storage (videos uploaded to cloud)
- Multiple caption styles: highlight, bounce, fade, karaoke
- Background videos via Pexels API

---

## 📁 Project Structure

```
ai-video-platform/
├── src/                          # Frontend (React)
│   ├── App.jsx                   # Entire frontend (single file, no React Router)
│   ├── index.css
│   ├── main.jsx
│   ├── api/
│   │   ├── auth.api.js
│   │   ├── projects.api.js
│   │   ├── user.api.js
│   │   ├── affiliate.api.js
│   │   └── admin.api.js
│   ├── stores/
│   │   └── authStore.js
│   └── utils/
│       └── axiosInstance.js
│
└── server/                       # Backend (Node/Express)
    ├── index.js
    ├── config/
    │   ├── db.js
    │   └── passport.js
    ├── models/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── services/
    │   ├── elevenlabs.service.js
    │   ├── assemblyai.service.js
    │   ├── ffmpeg.service.js
    │   ├── pexels.service.js
    │   └── storage.service.js
    ├── workers/
    │   └── videoWorker.js
    └── utils/
        ├── tokenCost.js
        └── downloadVideo.js
```

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Upstash Redis account
- FFmpeg installed (`C:\ffmpeg\bin\ffmpeg.exe` on Windows)
- API keys: ElevenLabs, AssemblyAI, Pexels, Supabase, Google OAuth

### Environment Variables

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_atlas_uri
REDIS_URL=your_upstash_redis_url
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ELEVENLABS_API_KEY=your_elevenlabs_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
PEXELS_API_KEY=your_pexels_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_BUCKET=videos
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Running Locally

```bash
# Frontend — http://localhost:5173
npm install
npm run dev

# Backend — http://localhost:5000
cd server
npm install
node index.js
```

---

## 🚀 Deployment

| Service | Platform | Status |
|---|---|---|
| Frontend | Vercel | ✅ Live |
| Backend | Render | ✅ Live |
| Video Storage | Supabase Storage | ✅ Live |
| Database | MongoDB Atlas | ✅ Live |
| Redis / Queue | Upstash | ✅ Live |

### Frontend — Vercel
- Root Directory: `client/`
- Build Command: `npm install && npm run build`
- Output Directory: `dist`
- Env var: `VITE_API_URL=https://your-render-url.onrender.com/api/v1`

### Backend — Render
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node index.js`
- Add all `server/.env` vars plus:
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://your-vercel-url.vercel.app`
  - `GOOGLE_CALLBACK_URL=https://your-render-url.onrender.com/api/v1/auth/google/callback`

---

## ⚙️ Video Generation Pipeline

Every video goes through these steps in the BullMQ worker:

1. **Token check & deduction** — atomic, before processing starts
2. **Voiceover generation** — ElevenLabs TTS
3. **Background video fetch** — Pexels API
4. **Word-level transcription** — AssemblyAI
5. **Video composition** — FFmpeg (captions, scaling, watermark)
6. **Upload to Supabase** — public URL saved to MongoDB

---

## 🗺 Navigation System

No React Router. Uses `useState("landing")` with a `switch/renderPage()` pattern.

| Page | Description |
|---|---|
| `landing` | Marketing landing page |
| `login` / `register` | Auth pages |
| `dashboard` | User stats and quick actions |
| `editor:<template>` | Video editor for each template |
| `projects` | All generated videos |
| `account` | Profile settings |
| `affiliate` | Affiliate dashboard |
| `pricing` | Plans and pricing |
| `admin` | Admin panel (admin role only) |

---

## 📋 Post-Deployment Checklist

- [ ] Switch Razorpay from test mode to live mode
- [ ] Update Google OAuth authorized origins and redirect URIs
- [ ] Generate strong JWT secrets for production
- [ ] Check AssemblyAI usage limits
- [ ] Check ElevenLabs character limits
- [ ] Check Pexels API rate limits
- [ ] Check Upstash Redis request limits
- [ ] Test all templates on production

---

Built by Siddharth Kumar • ClipForge © 2026