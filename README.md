# EresumeHub - Elite Generation 5 Frontend (React + Vite)

This project is a high-performance React application built with **Vite**, **TailwindCSS**, and **Lucide Icons**. It is fully synchronized with the Distributed Worker backend.

## 🚀 Key Elite Features (v3.x)

### 1. Recursive Polling Engine
Located in `services/resume.ts`, this engine replaces legacy `setInterval` with a recursive `setTimeout` pattern. It prevents "Request Explosion" during server lag and includes a **300-second (5-minute) Watchdog** to safely terminate orphaned polling.

### 2. Operational Metrics
The Dashboard now includes a **"Generation Pipeline"** status indicator that fetches real-time health data from the `/system/stats` backend endpoint.

### 3. Zero-Memory PDF Redirection
Leverages the new Backend Redirect pattern. Instead of downloading heavy PDF bytes via the client, the UI handles **Signed URL Redirects**, significantly improving performance on mobile devices.

### 4. Auth Resilience
The `AuthContext` has been hardened to ensure complete local state clearance (`localStorage.removeItem('token')`) during sign-out, independently of the Supabase session lifecycle.

## 🛠️ Security & Sync
- **VITE_API_KEY**: Injected into every request via the `api.ts` interceptor to prevent unauthorized backend access.
- **Strict Headers**: Communicates via standard Bearer tokens only when a session is active.

## 🏁 Setup & Deployment

### 1. Environment Configuration
Copy `.env.example` to `.env` and populate your secrets.

### 2. Run Locally
```bash
npm install
npm run dev
```

### 3. Deployment (Netlify)
The project is configured for **Netlify**. Ensure the following environment variables are set in the Netlify Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (Your Render/Production backend URL)
- `VITE_API_KEY` (The HMAC secret configured in your backend)

---
### 🏆 EresumeHub 3.x - Frontend Elite
*Crafted for UX. Hardened for Security. Polished for DX.*
