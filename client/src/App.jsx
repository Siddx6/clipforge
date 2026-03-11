/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { getAdminAnalytics, getAdminUsers, updateAdminUser, deleteAdminUser } from './api/admin.api';
import { getAffiliateStats, trackAffiliateClick } from './api/affiliate.api';
import { updateProfile, updatePassword, deleteAccount } from './api/user.api';
import { useState, useEffect, useRef } from "react";
import useAuthStore from './stores/authStore';
import { createProject, generateProject, getProjectStatus, getProjects } from './api/projects.api';
import useBillingStore from './stores/billingStore';

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080810;
    --bg2: #0f0f1a;
    --bg3: #16162a;
    --surface: #1a1a2e;
    --surface2: #22223a;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --accent: #7c5cfc;
    --accent2: #a87aff;
    --accent3: #5b3fd4;
    --pink: #f059da;
    --cyan: #30d5c8;
    --yellow: #ffc93c;
    --text: #f0f0ff;
    --text2: #9898b8;
    --text3: #5a5a7a;
    --success: #22c55e;
    --danger: #ef4444;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 14px;
    --radius-sm: 8px;
    --shadow: 0 8px 32px rgba(0,0,0,0.4);
    --glow: 0 0 40px rgba(124,92,252,0.25);
  }

  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.6; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 3px; }

  body::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 9999; opacity: 0.4;
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes orb { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -20px) scale(1.05); } 66% { transform: translate(-20px, 15px) scale(0.95); } 100% { transform: translate(0, 0) scale(1); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes waveBar { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }

  .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
  .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-slide-in { animation: slideIn 0.3s ease forwards; }

  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 64px; background: rgba(8,8,16,0.8); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
  .nav-logo { font-family: var(--font-display); font-size: 20px; font-weight: 800; background: linear-gradient(135deg, var(--accent2), var(--pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; cursor: pointer; }
  .nav-links { display: flex; align-items: center; gap: 8px; }
  .nav-link { padding: 6px 14px; border-radius: 8px; font-size: 14px; color: var(--text2); cursor: pointer; transition: all 0.2s; font-family: var(--font-body); background: none; border: none; }
  .nav-link:hover { color: var(--text); background: var(--surface); }
  .nav-link.active { color: var(--text); }
  .nav-actions { display: flex; align-items: center; gap: 10px; }

  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; white-space: nowrap; text-decoration: none; }
  .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent3)); color: white; box-shadow: 0 4px 20px rgba(124,92,252,0.4); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,92,252,0.55); }
  .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border2); }
  .btn-secondary:hover { background: var(--surface2); border-color: var(--accent); }
  .btn-ghost { background: transparent; color: var(--text2); }
  .btn-ghost:hover { color: var(--text); background: var(--surface); }
  .btn-danger { background: rgba(239,68,68,0.15); color: var(--danger); border: 1px solid rgba(239,68,68,0.3); }
  .btn-sm { padding: 6px 14px; font-size: 13px; }
  .btn-lg { padding: 14px 28px; font-size: 16px; border-radius: var(--radius); }
  .btn-xl { padding: 18px 36px; font-size: 17px; border-radius: var(--radius); font-weight: 600; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; transition: all 0.2s; }
  .card:hover { border-color: var(--border2); }
  .card-glow:hover { box-shadow: var(--glow); border-color: rgba(124,92,252,0.3); }

  .input { width: 100%; padding: 12px 16px; background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font-body); font-size: 14px; transition: all 0.2s; outline: none; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,92,252,0.15); }
  .input::placeholder { color: var(--text3); }
  .textarea { resize: vertical; min-height: 120px; }
  .label { display: block; font-size: 13px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 500; }
  .badge-purple { background: rgba(124,92,252,0.2); color: var(--accent2); border: 1px solid rgba(124,92,252,0.3); }
  .badge-pink { background: rgba(240,89,218,0.15); color: var(--pink); border: 1px solid rgba(240,89,218,0.25); }
  .badge-cyan { background: rgba(48,213,200,0.15); color: var(--cyan); border: 1px solid rgba(48,213,200,0.25); }
  .badge-yellow { background: rgba(255,201,60,0.15); color: var(--yellow); border: 1px solid rgba(255,201,60,0.25); }
  .badge-green { background: rgba(34,197,94,0.15); color: var(--success); border: 1px solid rgba(34,197,94,0.25); }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .page { min-height: 100vh; padding-top: 64px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .flex { display: flex; }
  .flex-center { display: flex; align-items: center; justify-content: center; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .flex-col { display: flex; flex-direction: column; }
  .gap-4 { gap: 4px; } .gap-8 { gap: 8px; } .gap-12 { gap: 12px; } .gap-16 { gap: 16px; } .gap-24 { gap: 24px; } .gap-32 { gap: 32px; }

  .text-xs { font-size: 12px; } .text-sm { font-size: 13px; } .text-base { font-size: 14px; } .text-lg { font-size: 16px; } .text-xl { font-size: 18px; } .text-2xl { font-size: 22px; } .text-3xl { font-size: 28px; } .text-4xl { font-size: 36px; } .text-5xl { font-size: 48px; }
  .font-display { font-family: var(--font-display); }
  .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; } .font-medium { font-weight: 500; }
  .text-muted { color: var(--text2); } .text-dim { color: var(--text3); }
  .text-accent { color: var(--accent2); } .text-pink { color: var(--pink); } .text-cyan { color: var(--cyan); } .text-success { color: var(--success); }
  .text-center { text-align: center; }

  .gradient-text { background: linear-gradient(135deg, var(--accent2) 0%, var(--pink) 50%, var(--cyan) 100%); background-size: 200% 200%; animation: gradientShift 4s ease infinite; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .divider { height: 1px; background: var(--border); margin: 24px 0; }

  .app-layout { display: flex; min-height: 100vh; padding-top: 64px; }
  .sidebar { width: 240px; flex-shrink: 0; background: var(--bg2); border-right: 1px solid var(--border); padding: 24px 12px; position: fixed; top: 64px; bottom: 0; overflow-y: auto; }
  .main-content { margin-left: 240px; flex: 1; padding: 32px; min-height: calc(100vh - 64px); }
  .sidebar-section { margin-bottom: 24px; }
  .sidebar-label { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; padding: 0 12px; margin-bottom: 8px; }
  .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 14px; color: var(--text2); cursor: pointer; transition: all 0.15s; margin-bottom: 2px; border: none; background: none; width: 100%; text-align: left; font-family: var(--font-body); }
  .sidebar-item:hover { background: var(--surface); color: var(--text); }
  .sidebar-item.active { background: rgba(124,92,252,0.15); color: var(--accent2); }
  .sidebar-icon { font-size: 16px; width: 20px; text-align: center; }

  .token-pill { background: linear-gradient(135deg, rgba(124,92,252,0.2), rgba(240,89,218,0.1)); border: 1px solid rgba(124,92,252,0.3); border-radius: 10px; padding: 12px 16px; margin: 0 4px 16px; }
  .progress-track { height: 6px; background: var(--bg3); border-radius: 100px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--accent), var(--pink)); transition: width 0.3s; }

  .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .status-dot.done { background: var(--success); box-shadow: 0 0 8px var(--success); }
  .status-dot.processing { background: var(--yellow); animation: pulse 1.5s ease-in-out infinite; }
  .status-dot.queued { background: var(--text3); }
  .status-dot.failed { background: var(--danger); }

  .video-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: all 0.2s; cursor: pointer; }
  .video-card:hover { transform: translateY(-2px); border-color: var(--border2); box-shadow: var(--shadow); }
  .video-thumb { aspect-ratio: 9/16; max-height: 180px; width: 100%; background: var(--bg3); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }

  .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; opacity: 0.4; animation: orb 8s ease-in-out infinite; }
  .waveform { display: flex; align-items: center; gap: 3px; height: 32px; }
  .wave-bar { width: 3px; background: var(--accent); border-radius: 100px; animation: waveBar 1s ease-in-out infinite; }

  .tag { display: inline-flex; padding: 4px 12px; border-radius: 100px; background: var(--surface); border: 1px solid var(--border); font-size: 13px; color: var(--text2); cursor: pointer; transition: all 0.2s; }
  .tag:hover, .tag.active { background: rgba(124,92,252,0.15); border-color: rgba(124,92,252,0.4); color: var(--accent2); }

  .template-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
  .template-card:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 12px 40px rgba(124,92,252,0.2); }
  .template-card.selected { border-color: var(--accent); background: rgba(124,92,252,0.1); }
  .template-emoji { font-size: 36px; margin-bottom: 12px; display: block; }

  .voice-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 12px; }
  .voice-card:hover { border-color: var(--border2); }
  .voice-card.selected { border-color: var(--accent); background: rgba(124,92,252,0.1); }
  .voice-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

  .pricing-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 32px; transition: all 0.25s; }
  .pricing-card.featured { background: linear-gradient(135deg, rgba(124,92,252,0.15), rgba(240,89,218,0.08)); border-color: rgba(124,92,252,0.4); box-shadow: 0 0 60px rgba(124,92,252,0.15); transform: scale(1.03); }
  .price-tag { font-family: var(--font-display); font-size: 48px; font-weight: 800; color: var(--text); }
  .price-period { font-size: 16px; color: var(--text2); }
  .feature-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 14px; border-top: 1px solid var(--border); }

  .editor-panel { background: var(--bg2); border-right: 1px solid var(--border); overflow-y: auto; padding: 24px; }
  .editor-center { background: var(--bg); display: flex; flex-direction: column; }
  .editor-right { background: var(--bg2); border-left: 1px solid var(--border); overflow-y: auto; padding: 24px; }

  .select { width: 100%; padding: 10px 14px; background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font-body); font-size: 14px; cursor: pointer; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239898b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; transition: border-color 0.2s; }
  .select:focus { border-color: var(--accent); }

  .tabs { display: flex; gap: 4px; padding: 4px; background: var(--bg3); border-radius: 10px; }
  .tab { flex: 1; padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: none; color: var(--text2); transition: all 0.15s; font-family: var(--font-body); }
  .tab.active { background: var(--surface); color: var(--text); }

  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 24px; }
  .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; }
  .stat-label { font-size: 13px; color: var(--text2); margin-top: 2px; }
  .stat-change { font-size: 12px; margin-top: 8px; }
  .stat-up { color: var(--success); }
  .stat-down { color: var(--danger); }

  .scroll-x { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
  .scroll-x::-webkit-scrollbar { height: 4px; }
  .empty-state { text-align: center; padding: 60px 20px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

  .toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .toggle-track { width: 44px; height: 24px; border-radius: 100px; background: var(--bg3); border: 1px solid var(--border2); position: relative; transition: all 0.2s; flex-shrink: 0; }
  .toggle-track.on { background: var(--accent); border-color: var(--accent); }
  .toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; }
  .toggle-track.on .toggle-thumb { transform: translateX(20px); }

  .affiliate-link-box { background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; font-family: monospace; font-size: 14px; color: var(--accent2); }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { text-align: left; padding: 10px 16px; font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
  .data-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: var(--surface); }

  .or-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .or-divider::before, .or-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .or-label { font-size: 12px; color: var(--text3); }

  .hero-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 120px 24px 80px; }
  .hero-title { font-family: var(--font-display); font-size: clamp(48px, 8vw, 96px); font-weight: 800; line-height: 1.0; letter-spacing: -2px; margin-bottom: 24px; }
  .hero-sub { font-size: 18px; color: var(--text2); max-width: 560px; line-height: 1.7; margin-bottom: 40px; }
  .feature-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }

  /* Caption style selector cards */
  .caption-style-card { padding: 10px 14px; background: var(--bg3); border: 2px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.15s; }
  .caption-style-card.active { border-color: var(--accent); background: rgba(124,92,252,0.12); }
  .caption-style-card:hover:not(.active) { border-color: var(--border2); }

  @media (max-width: 768px) {
    .grid-3, .grid-4 { grid-template-columns: 1fr; }
    .grid-2 { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .main-content { margin-left: 0; }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "reddit",    emoji: "👾", name: "Reddit Story",      desc: "Paste a Reddit URL or write a story",        badge: "Popular",  badgeColor: "badge-pink",   tokens: 8  },
  { id: "dialogue",  emoji: "🎭", name: "Dialogue Video",    desc: "Funny conversations between characters",      badge: "Trending", badgeColor: "badge-cyan",   tokens: 10 },
  { id: "voiceover", emoji: "🎙️", name: "Voiceover Video",   desc: "Script + AI voice + background gameplay",     badge: "",         badgeColor: "",             tokens: 5  },
  { id: "lipsync",   emoji: "💋", name: "Lip-Sync Deepfake", desc: "Sync any video with your script",             badge: "New",      badgeColor: "badge-purple", tokens: 25 },
  { id: "avatar",    emoji: "🧑‍🎨", name: "Image Avatar",      desc: "Animate a static image to speak",            badge: "New",      badgeColor: "badge-purple", tokens: 20 },
  { id: "captions",  emoji: "📝", name: "Auto Captions",     desc: "Upload video → get viral captions",          badge: "",         badgeColor: "",             tokens: 3  },
];

// NOTE: category must be "Premium" or "Neutral" — NOT "Celebrity"
const VOICES = [
  { id: "peter-griffin",  name: "The Everyman",    emoji: "🎭", style: "Casual & Relatable",  category: "Premium" },
  { id: "stewie-griffin", name: "The Brit",         emoji: "🎩", style: "Sharp & Witty",        category: "Premium" },
  { id: "donald-trump",   name: "The Boss",         emoji: "💼", style: "Bold & Commanding",    category: "Premium" },
  { id: "elon-musk",      name: "The Visionary",    emoji: "🚀", style: "Calm & Confident",     category: "Premium" },
  { id: "homer-simpson",  name: "The Goofball",     emoji: "🍩", style: "Warm & Funny",         category: "Premium" },
  { id: "spongebob",      name: "The Hype Man",     emoji: "⚡", style: "Energetic & Fun",      category: "Premium" },
  { id: "morgan-freeman", name: "The Narrator",     emoji: "🎬", style: "Deep & Authoritative", category: "Premium" },
  { id: "darth-vader",    name: "The Dark One",     emoji: "🌑", style: "Deep & Menacing",      category: "Premium" },
  { id: "arnold",         name: "The Action Hero",  emoji: "💪", style: "Strong & Direct",      category: "Premium" },
  { id: "cartman",        name: "The Troublemaker", emoji: "😈", style: "Loud & Opinionated",   category: "Premium" },
  { id: "1", name: "Christopher", emoji: "🎙️", style: "Conversational",   category: "Neutral" },
  { id: "2", name: "Guy",         emoji: "😎", style: "Energetic",         category: "Neutral" },
  { id: "3", name: "Eric",        emoji: "🎧", style: "Authoritative",     category: "Neutral" },
  { id: "4", name: "Jenny",       emoji: "👩", style: "News/Documentary",  category: "Neutral" },
  { id: "5", name: "Sonia",       emoji: "🇬🇧", style: "British Formal",   category: "Neutral" },
  { id: "6", name: "William",     emoji: "🦘", style: "Aussie Friendly",   category: "Neutral" },
];

const CAPTION_STYLES = [
  { id: "highlight", label: "🔥 Highlight", desc: "Yellow word pop"   },
  { id: "bounce",    label: "💥 Bounce",    desc: "Big white impact"  },
  { id: "fade",      label: "✨ Fade",      desc: "Smooth cyan glow"  },
  { id: "karaoke",   label: "🎵 Karaoke",  desc: "Pink fill-from-left" },
];

const CAPTION_COLORS = [
  { hex: "#FFD700", label: "Gold"   },
  { hex: "#ffffff", label: "White"  },
  { hex: "#f059da", label: "Pink"   },
  { hex: "#30d5c8", label: "Cyan"   },
  { hex: "#a87aff", label: "Purple" },
  { hex: "#ff4444", label: "Red"    },
];

const PROJECTS = [
  { id: "1", title: "My Reddit Story",     template: "reddit",    status: "done",       thumb: "👾", createdAt: "2h ago",   tokens: 8, views: 12400 },
  { id: "2", title: "Morning Motivation",  template: "voiceover", status: "processing", thumb: "🎙️", createdAt: "Just now", tokens: 5, views: 0 },
  { id: "3", title: "Travel Vlog Captions",template: "captions",  status: "failed",     thumb: "📝", createdAt: "4d ago",   tokens: 3, views: 0 },
];

const PLANS = [
  { id: "free",    name: "Free",    price: 0,  tokens: 30,   color: "#5a5a7a", features: ["Watermarked exports", "2 template types", "720p quality", "Community support"] },
  { id: "creator", name: "Creator", price: 19, tokens: 300,  color: "#7c5cfc", features: ["No watermark", "All 6 templates", "1080p quality", "Priority support"], featured: true },
  { id: "pro",     name: "Pro",     price: 39, tokens: 800,  color: "#f059da", features: ["Everything in Creator", "Lip-sync + Avatar", "4K export", "Analytics dashboard"] },
  { id: "team",    name: "Team",    price: 99, tokens: 2500, color: "#30d5c8", features: ["Everything in Pro", "5 team seats", "API access", "Custom branding"] },
];

const ADMIN_USERS = [
  { id: "u1", name: "Aryan Sharma", email: "aryan@email.com", plan: "Pro",     tokens: 340,  joined: "Jan 12", status: "active"    },
  { id: "u2", name: "Priya Singh",  email: "priya@email.com", plan: "Creator", tokens: 128,  joined: "Feb 3",  status: "active"    },
  { id: "u3", name: "Rahul Dev",    email: "rahul@email.com", plan: "Free",    tokens: 8,    joined: "Mar 1",  status: "active"    },
  { id: "u4", name: "Sofia Chen",   email: "sofia@email.com", plan: "Team",    tokens: 1840, joined: "Dec 28", status: "active"    },
  { id: "u5", name: "Marcus Lee",   email: "marcus@email.com",plan: "Free",    tokens: 0,    joined: "Mar 5",  status: "suspended" },
];

// ─── TEMPLATE EDITOR CONFIGS ──────────────────────────────────────────────────
const TEMPLATE_CONFIGS = {
  reddit: {
    defaultScript: "Welcome to my channel! Today I'm going to show you something absolutely insane that happened on Reddit...",
    scriptLabel: "Script / Story",
    scriptPlaceholder: "Write your Reddit story here or paste a Reddit URL...",
    extraFields: (vals, setVals) => (
      <>
        <div>
          <label className="label">Background Video</label>
          <select className="select" value={vals.bgVideo} onChange={e => setVals({...vals, bgVideo: e.target.value})}>
            <option value="subway-surfers">🎮 Subway Surfers</option>
            <option value="minecraft">⛏️ Minecraft Parkour</option>
            <option value="gta-driving">🚗 GTA Driving</option>
            <option value="nature">🌿 Nature Footage</option>
          </select>
        </div>
        <div>
          <label className="label">Reddit Username (optional)</label>
          <input className="input" placeholder="u/username" value={vals.username || ""} onChange={e => setVals({...vals, username: e.target.value})} />
        </div>
      </>
    ),
  },
  voiceover: {
    defaultScript: "In a world where technology moves faster than ever, one thing remains constant — the power of a great story.",
    scriptLabel: "Voiceover Script",
    scriptPlaceholder: "Write your voiceover script here...",
    extraFields: (vals, setVals) => (
      <>
        <div>
          <label className="label">Background Video</label>
          <select className="select" value={vals.bgVideo} onChange={e => setVals({...vals, bgVideo: e.target.value})}>
            <option value="nature">🌿 Nature Footage</option>
            <option value="space">🌌 Space / Galaxy</option>
            <option value="subway-surfers">🎮 Subway Surfers</option>
            <option value="gta-driving">🚗 City Driving</option>
          </select>
        </div>
        <div>
          <label className="label">Video Title (optional)</label>
          <input className="input" placeholder="e.g. Morning Motivation" value={vals.title || ""} onChange={e => setVals({...vals, title: e.target.value})} />
        </div>
      </>
    ),
  },
  dialogue: {
    defaultScript: "Character 1: Did you hear what happened today?\nCharacter 2: No way! Tell me everything.\nCharacter 1: You won't believe it...",
    scriptLabel: "Dialogue Script",
    scriptPlaceholder: "Write your dialogue here. Format:\nCharacter 1: ...\nCharacter 2: ...",
    extraFields: (vals, setVals) => (
      <>
        <div>
          <label className="label">Character 1 Voice</label>
          <select className="select" value={vals.voice1 || "1"} onChange={e => setVals({...vals, voice1: e.target.value})}>
            {VOICES.map(v => <option key={v.id} value={v.id}>{v.emoji} {v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Character 2 Voice</label>
          <select className="select" value={vals.voice2 || "4"} onChange={e => setVals({...vals, voice2: e.target.value})}>
            {VOICES.map(v => <option key={v.id} value={v.id}>{v.emoji} {v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Background</label>
          <select className="select" value={vals.bgVideo || "subway-surfers"} onChange={e => setVals({...vals, bgVideo: e.target.value})}>
            <option value="subway-surfers">🎮 Subway Surfers</option>
            <option value="minecraft">⛏️ Minecraft</option>
            <option value="gta-driving">🚗 GTA Driving</option>
          </select>
        </div>
      </>
    ),
  },
  captions: {
  defaultScript: "",
  scriptLabel: "Video URL",
  scriptPlaceholder: "Paste a direct video URL to add captions to...",
  extraFields: (vals, setVals) => (
    <>
      <div>
        <label className="label">Caption Language</label>
        <select className="select" value={vals.language || "en"} onChange={e => setVals({...vals, language: e.target.value})}>
          <option value="en">🇺🇸 English</option>
          <option value="hi">🇮🇳 Hindi</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="fr">🇫🇷 French</option>
          <option value="de">🇩🇪 German</option>
        </select>
      </div>
      <div>
        <label className="label">Caption Position</label>
        <select className="select" value={vals.position || "bottom"} onChange={e => setVals({...vals, position: e.target.value})}>
          <option value="bottom">Bottom (72%)</option>
          <option value="center">Center (50%)</option>
          <option value="top">Top (15%)</option>
        </select>
      </div>
    </>
  ),
},
  lipsync: {
    defaultScript: "Hey everyone! Today I'm going to show you something incredible that you've never seen before.",
    scriptLabel: "Script to Lip-Sync",
    scriptPlaceholder: "Write the script that will be lip-synced to the video...",
    extraFields: (vals, setVals) => (
      <>
        <div>
          <label className="label">Video URL</label>
          <input className="input" placeholder="Paste video URL to lip-sync..." value={vals.videoUrl || ""} onChange={e => setVals({...vals, videoUrl: e.target.value})} />
        </div>
        <div>
          <label className="label">Sync Quality</label>
          <select className="select" value={vals.quality || "standard"} onChange={e => setVals({...vals, quality: e.target.value})}>
            <option value="standard">Standard (faster)</option>
            <option value="high">High Quality (slower)</option>
          </select>
        </div>
      </>
    ),
  },
  avatar: {
    defaultScript: "Hello! I'm your AI avatar. Today I want to share something amazing with you.",
    scriptLabel: "Avatar Script",
    scriptPlaceholder: "Write what your avatar will say...",
    extraFields: (vals, setVals) => (
      <>
        <div>
          <label className="label">Avatar Image URL</label>
          <input className="input" placeholder="Paste image URL for your avatar..." value={vals.imageUrl || ""} onChange={e => setVals({...vals, imageUrl: e.target.value})} />
        </div>
        <div>
          <label className="label">Animation Style</label>
          <select className="select" value={vals.animStyle || "natural"} onChange={e => setVals({...vals, animStyle: e.target.value})}>
            <option value="natural">Natural</option>
            <option value="expressive">Expressive</option>
            <option value="subtle">Subtle</option>
          </select>
        </div>
      </>
    ),
  },
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return (
    <div className="animate-spin" style={{ width: size, height: size, border: `2px solid rgba(255,255,255,0.2)`, borderTopColor: "var(--accent)", borderRadius: "50%" }} />
  );
}

function StatusDot({ status }) {
  return <div className={`status-dot ${status}`} />;
}

function WaveViz({ active }) {
  return (
    <div className="waveform">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="wave-bar" style={{
          height: `${Math.random() * 20 + 6}px`,
          animationDelay: `${i * 0.12}s`,
          opacity: active ? 1 : 0.3,
          background: active ? "var(--accent)" : "var(--text3)"
        }} />
      ))}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <div className="toggle-wrap" onClick={onToggle}>
      <div className={`toggle-track ${on ? "on" : ""}`}>
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, setUser }) {
  const user = useAuthStore((state) => state.user);
  const [navDropdown, setNavDropdown] = useState(false);  // ← ADD
const dropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setNavDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  
  const isApp = !["landing", "login", "register"].includes(page) && user !== null;
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage(user ? "dashboard" : "landing")}>✦ ClipForge</div>
      {!isApp && (
        <div className="nav-links">
          {["Features"].map(l => (
  <button key={l} className="nav-link" onClick={() => setPage(l.toLowerCase())}>{l}</button>
))}
        </div>
      )}
     {isApp && (
  <div className="nav-links">
    <button className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Dashboard</button>
    <button className={`nav-link ${page.startsWith("editor") ? "active" : ""}`} onClick={() => setPage("template-select")}>New Video</button>
    <button className="nav-link" onClick={() => setPage("features")}>Features</button>
    <button className="nav-link" onClick={() => setPage("pricing")}>Upgrade</button>
  </div>
)}
      <div className="nav-actions">
        {user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderRadius: 8, fontSize: 13 }}>
              <span>⚡</span>
              <span style={{ fontWeight: 600 }}>{user.tokens ?? 0}</span>
              <span className="text-muted">tokens</span>
            </div>
            <div style={{ position: "relative" }} ref={dropdownRef}>
  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", fontWeight: 600 }}
    onClick={() => setNavDropdown(!navDropdown)}>
    {user.name?.[0]}
  </div>
  {navDropdown && (
    <div style={{ position: "absolute", right: 0, top: 42, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 10, padding: "6px", minWidth: 160, zIndex: 200, boxShadow: "var(--shadow)" }}>
      <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => { setNavDropdown(false); setPage("account"); }}>⚙ Account</button>
      <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start" }} onClick={async () => { setNavDropdown(false); await useAuthStore.getState().logout(); setPage("landing"); }}>↩ Sign Out</button>
    </div>
  )}
</div>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("login")}>Sign in</button>
            <button className="btn btn-primary btn-sm" onClick={() => setPage("register")}>Get Started</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, user }) {
  const items = [
    { id: "dashboard",       icon: "⬡", label: "Dashboard"  },
    { id: "template-select", icon: "＋", label: "New Video"  },
    { id: "projects",        icon: "▦", label: "My Projects" },
    { id: "pricing",         icon: "◈", label: "Upgrade"     },
  ];
  const bottom = [
    { id: "affiliate", icon: "◎", label: "Affiliate"  },
    { id: "account",   icon: "◉", label: "Account"    },
    ...(user?.role === "admin" ? [{ id: "admin", icon: "⊛", label: "Admin Panel" }] : []),
  ];
  return (
    <aside className="sidebar">
      <div className="token-pill">
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Token Balance</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>{user?.tokens ?? 247}</span>
          <span style={{ fontSize: 13, color: "var(--text2)" }}>/ 300</span>
        </div>
        <div className="progress-track" style={{ marginTop: 10 }}>
          <div className="progress-fill" style={{ width: `${Math.min(100, ((user?.tokens ?? 247) / 300) * 100)}%` }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>Creator Plan · Resets Apr 1</div>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-label">Main</div>
        {items.map(item => (
          <button key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <span className="sidebar-icon">{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
      <div className="sidebar-section">
        <div className="sidebar-label">Account</div>
        {bottom.map(item => (
          <button key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <span className="sidebar-icon">{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ setPage }) {
  const [activeTemplate, setActiveTemplate] = useState(0);
  return (
    <div className="page">
      <section className="hero-section">
        <div className="orb" style={{ width: 600, height: 600, top: -200, left: -100, background: "radial-gradient(circle, rgba(124,92,252,0.4), transparent 70%)" }} />
        <div className="orb" style={{ width: 400, height: 400, bottom: -100, right: -50, background: "radial-gradient(circle, rgba(240,89,218,0.3), transparent 70%)", animationDelay: "3s" }} />
        <div className="container" style={{ position: "relative", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 100, fontSize: 13, marginBottom: 24, animation: "fadeUp 0.5s ease forwards" }}>
            <span style={{ color: "var(--accent2)" }}>✦</span>
            <span className="text-muted">Now in Beta · </span>
            <span style={{ color: "var(--accent2)", fontWeight: 600 }}>Join 4,200+ creators</span>
          </div>
          <h1 className="hero-title" style={{ animation: "fadeUp 0.6s 0.1s ease both" }}>
            Create Viral Videos<br /><span className="gradient-text">With AI</span>
          </h1>
          <p className="hero-sub" style={{ margin: "0 auto 40px", animation: "fadeUp 0.6s 0.2s ease both" }}>
            AI voiceovers, animated captions, lip-sync deepfakes, and viral templates — all in one editor.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", animation: "fadeUp 0.6s 0.3s ease both" }}>
            <button className="btn btn-primary btn-xl" onClick={() => setPage("register")}>Start Creating Free →</button>
            <button className="btn btn-secondary btn-xl" onClick={() => setPage("pricing")}>See Pricing</button>
          </div>
          <div style={{ marginTop: 24, fontSize: 13, color: "var(--text3)", animation: "fadeUp 0.6s 0.4s ease both" }}>
            No credit card required · 30 free tokens on signup
          </div>
          <div className="scroll-x" style={{ marginTop: 64, justifyContent: "center", padding: "8px 0 16px" }}>
            {TEMPLATES.map((t, i) => (
              <div key={i} style={{ flexShrink: 0, width: 120, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", animation: `fadeUp 0.6s ${0.5 + i * 0.1}s ease both` }}>
                <div style={{ height: 200, background: `linear-gradient(135deg, hsl(${i * 60}, 50%, 10%), hsl(${i * 60 + 30}, 50%, 5%))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{t.emoji}</div>
                <div style={{ padding: "8px 10px", fontSize: 12, color: "var(--text2)" }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0", background: "var(--bg2)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="font-display text-4xl font-bold" style={{ marginBottom: 16 }}>Everything in one editor</h2>
            <p className="text-muted">Stop switching between 5 different tools</p>
          </div>
          <div className="grid-3">
            {[
              { icon: "🎙️", color: "#7c5cfc", title: "AI Voiceovers",       desc: "Microsoft Edge TTS with natural-sounding voices in 100+ languages." },
              { icon: "📝", color: "#f059da", title: "Animated Captions",    desc: "Word-level captions with 4 animation styles burned into video." },
              { icon: "💋", color: "#30d5c8", title: "Lip-Sync Deepfakes",   desc: "Upload a video and a script — we sync the lips perfectly." },
              { icon: "🎬", color: "#ffc93c", title: "Viral Templates",      desc: "Reddit stories, dialogue videos — the highest-performing formats." },
              { icon: "🧑‍🎨", color: "#7c5cfc", title: "Image Avatars",       desc: "Bring any static image to life." },
              { icon: "🎮", color: "#f059da", title: "Free Media Library",   desc: "Subway Surfers, Minecraft, stock footage — 500+ backgrounds." },
            ].map((f, i) => (
              <div key={i} className="card card-glow">
                <div className="feature-icon-wrap" style={{ background: `${f.color}22` }}><span>{f.icon}</span></div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="font-display text-4xl font-bold" style={{ marginBottom: 16 }}>Pick your template</h2>
            <p className="text-muted">Choose a format, write your script, generate. Done in 60 seconds.</p>
          </div>
          <div className="grid-3">
            {TEMPLATES.map((t, i) => (
              <div key={t.id} className={`template-card ${activeTemplate === i ? "selected" : ""}`} onClick={() => setActiveTemplate(i)}>
                <span className="template-emoji">{t.emoji}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{t.name}</span>
                  {t.badge && <span className={`badge ${t.badgeColor}`}>{t.badge}</span>}
                </div>
                <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>{t.desc}</p>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>⚡ {t.tokens} tokens</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button className="btn btn-primary btn-lg" onClick={() => setPage("register")}>Try All Templates Free →</button>
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 0", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
            {[["4,200+", "Active Creators"], ["2.8M+", "Videos Generated"], ["102", "Languages"], ["6", "AI Templates"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, background: "linear-gradient(135deg, var(--accent2), var(--pink))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
                <div style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 0", textAlign: "center" }}>
        <div className="container">
          <h2 className="font-display" style={{ fontSize: 48, fontWeight: 800, marginBottom: 20 }}>Ready to go viral?</h2>
          <p className="text-muted" style={{ fontSize: 18, marginBottom: 36 }}>Join thousands of creators making content in seconds, not hours.</p>
          <button className="btn btn-primary btn-xl" onClick={() => setPage("register")}>Create Your First Video Free</button>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 0" }}>
        <div className="container flex-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div className="nav-logo">✦ ClipForge</div>
          <div style={{ display: "flex", gap: 24, fontSize: 14, color: "var(--text2)" }}>
            {["Privacy", "Terms", "Affiliate", "Discord"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>© 2026 ClipForge AI</div>
        </div>
      </footer>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
function AuthPage({ mode, setPage, setUser }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const data = mode === "login" ? await login(email, password) : await register(name, email, password);
      setUser(data); setPage("dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="page flex-center" style={{ minHeight: "100vh" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div className="orb" style={{ width: 500, height: 500, top: -100, left: "20%", background: "radial-gradient(circle, rgba(124,92,252,0.2), transparent 70%)" }} />
      </div>
      <div style={{ width: "100%", maxWidth: 420, padding: 24, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="nav-logo" style={{ fontSize: 28, marginBottom: 8, display: "block" }}>✦ ClipForge</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            {mode === "login" ? "Welcome back" : "Start creating free"}
          </h1>
          <p className="text-muted text-sm">{mode === "login" ? "Sign in to your account" : "No credit card required · 30 free tokens"}</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
  onClick={() => window.location.href = "http://localhost:5000/api/v1/auth/google"}>
  <span>G</span> Continue with Google
</button>
          <div className="or-divider"><span className="or-label">or continue with email</span></div>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "13px" }} onClick={handleSubmit}>
            {loading ? <Spinner /> : (mode === "login" ? "Sign In" : "Create Account")}
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--text2)", marginTop: 20 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: "var(--accent2)", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ setPage }) {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const TEMPLATE_EMOJIS = {
    reddit: "👾", dialogue: "🎭", voiceover: "🎙️",
    lipsync: "💋", avatar: "🧑‍🎨", captions: "📝"
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects(1, 50);
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Compute real stats from projects
  const totalVideos   = projects.length;
  const totalTokens   = projects.reduce((sum, p) => sum + (p.tokensUsed || 0), 0);
  const doneProjects  = projects.filter(p => p.status === "done").length;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek   = projects.filter(p => new Date(p.createdAt) > oneWeekAgo).length;

  const stats = [
    { label: "Videos Created", value: totalVideos,           change: `+${thisWeek} this week`,       up: true,  icon: "🎬" },
    { label: "Tokens Used",    value: totalTokens,           change: `${user?.tokens ?? 0} remaining`, up: true,  icon: "⚡" },
    { label: "Completed",      value: doneProjects,          change: `of ${totalVideos} total`,        up: true,  icon: "✅" },
    { label: "Success Rate",   value: totalVideos > 0 ? `${Math.round((doneProjects / totalVideos) * 100)}%` : "—", change: "completed successfully", up: true, icon: "📈" },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{getGreeting()}, {user?.name?.split(" ")[0]} ✦</h1>
          <p className="text-muted text-sm">Here's what's happening with your content</p>
        </div>
        <button className="btn btn-primary" onClick={() => setPage("template-select")}>+ New Video</button>
      </div>
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value gradient-text">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.up ? "stat-up" : "text-dim"}`}>{s.change}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Recent Projects</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("projects")}>View all →</button>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={28} /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <p className="text-muted">No projects yet — create your first video!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {projects.slice(0, 4).map((p, i) => (
              <div key={p._id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", animation: `slideIn 0.3s ${i * 0.06}s ease both` }}>
                <div style={{ width: 44, height: 44, background: "var(--bg3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {TEMPLATE_EMOJIS[p.template] || "🎬"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{p.template} · {new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusDot status={p.status} />
                  <span style={{ fontSize: 12, color: "var(--text2)", textTransform: "capitalize" }}>{p.status}</span>
                </div>
                {p.tokensUsed > 0 && <div style={{ fontSize: 13, color: "var(--text3)", minWidth: 60, textAlign: "right" }}>⚡ {p.tokensUsed}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Start</h2>
        <div className="grid-3">
          {TEMPLATES.slice(0, 3).map(t => (
            <div key={t.id} className="template-card" onClick={() => setPage("editor:" + t.id)} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{t.name}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text2)" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE SELECTOR ────────────────────────────────────────────────────────
function TemplateSelectorPage({ setPage }) {
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>What do you want to create?</h1>
        <p className="text-muted">Pick a template to get started. You can change it later.</p>
      </div>
      <div className="grid-3">
        {TEMPLATES.map((t, i) => (
          <div key={t.id} className={`template-card ${selected === t.id ? "selected" : ""}`} onClick={() => setSelected(t.id)} style={{ animation: `fadeUp 0.4s ${i * 0.07}s ease both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 40 }}>{t.emoji}</span>
              {t.badge && <span className={`badge ${t.badgeColor}`}>{t.badge}</span>}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{t.name}</div>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, marginBottom: 14 }}>{t.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>⚡ {t.tokens} tokens</span>
              {selected === t.id && <span style={{ fontSize: 12, color: "var(--accent2)", fontWeight: 600 }}>✓ Selected</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        <button className="btn btn-primary btn-lg" disabled={!selected} onClick={() => setPage("editor:" + selected)}
          style={{ opacity: selected ? 1 : 0.4, cursor: selected ? "pointer" : "not-allowed" }}>
          Continue with {selected ? TEMPLATES.find(t => t.id === selected)?.name : "Template"} →
        </button>
      </div>
    </div>
  );
}

// ─── EDITOR PAGE ──────────────────────────────────────────────────────────────
function EditorPage({ setPage, template = "reddit" }) {
  const templateData = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
  const config = TEMPLATE_CONFIGS[template] || TEMPLATE_CONFIGS.reddit;
  const refreshUser = useAuthStore((state) => state.refreshUser);  // ← ADD
  const user = useAuthStore((state) => state.user);                // ← ADD

  const [script, setScript] = useState(config.defaultScript);
  const [selectedVoice, setSelectedVoice] = useState("1");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState("script");
  const [outputVideoUrl, setOutputVideoUrl] = useState(null);
  const [extraVals, setExtraVals] = useState({ bgVideo: "subway-surfers" });

  // ── Caption settings — all three wired to state ──
  const [captionStyle, setCaptionStyle] = useState("highlight");
  const [captionFont,  setCaptionFont]  = useState("impact");
  const [captionColor, setCaptionColor] = useState("#FFD700");
  const [resolution, setResolution] = useState("1080x1920");

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerated(false);
    setProgress(0);
    setOutputVideoUrl(null);

    try {
      const project = await createProject({
        title: `${templateData.name} ${Date.now()}`,
        template,
        script,
        voiceId: selectedVoice,
        metadata: {
          ...extraVals,
          captionStyle,
          captionFont,
          captionColor,
          resolution,
          voice1: extraVals.voice1 || "1",
          voice2: extraVals.voice2 || "4",
        }
      });

      await generateProject(project._id);

      const interval = setInterval(async () => {
        try {
          const status = await getProjectStatus(project._id);
          if (status.status === "queued")      setProgress(10);
          if (status.status === "processing")  setProgress(60);
          if (status.status === "done") {
  clearInterval(interval);
  setProgress(100);
  setGenerating(false);
  setGenerated(true);
  setOutputVideoUrl(status.outputVideoUrl);
  await refreshUser();  // ← ADD: update token balance in navbar
}
          if (status.status === "failed") {
            clearInterval(interval);
            setGenerating(false);
            alert("Generation failed. Please try again.");
          }
        } catch (err) {
          clearInterval(interval);
          setGenerating(false);
        }
      }, 3000);

    } catch (err) {
      setGenerating(false);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 280px", height: "calc(100vh - 64px)", position: "fixed", top: 64, left: 0, right: 0, bottom: 0 }}>

      {/* ── LEFT PANEL ── */}
      <div className="editor-panel">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            {templateData.emoji} {templateData.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>⚡ {templateData.tokens} tokens · Est. 45 seconds</div>
        </div>

        <div className="tabs" style={{ marginBottom: 20 }}>
          {["script", "voice", "style"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        {/* ── SCRIPT TAB ── */}
        {tab === "script" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">{config.scriptLabel}</label>
              <textarea className="input textarea" style={{ minHeight: 160 }} value={script} onChange={e => setScript(e.target.value)} placeholder={config.scriptPlaceholder} />
            </div>
            {config.extraFields(extraVals, setExtraVals)}
          </div>
        )}

        {/* ── VOICE TAB ── */}
        {/* FIX: filter by "Premium" not "Celebrity" */}
        {tab === "voice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>Select voice for generation</div>

            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, marginTop: 8 }}>✨ Premium AI Voices</div>
            {VOICES.filter(v => v.category === "Premium").map(v => (
              <div key={v.id} className={`voice-card ${selectedVoice === v.id ? "selected" : ""}`} onClick={() => setSelectedVoice(v.id)}>
                <div className="voice-avatar" style={{ background: selectedVoice === v.id ? "rgba(124,92,252,0.2)" : "var(--bg3)" }}>{v.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{v.style}</div>
                </div>
                <span style={{ fontSize: 10, color: "var(--pink)", fontWeight: 600 }}>PRO</span>
              </div>
            ))}

            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, marginTop: 12 }}>🎙️ Neutral Voices</div>
            {VOICES.filter(v => v.category === "Neutral").map(v => (
              <div key={v.id} className={`voice-card ${selectedVoice === v.id ? "selected" : ""}`} onClick={() => setSelectedVoice(v.id)}>
                <div className="voice-avatar" style={{ background: selectedVoice === v.id ? "rgba(124,92,252,0.2)" : "var(--bg3)" }}>{v.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{v.style}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STYLE TAB ── */}
        {tab === "style" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Caption Style */}
            <div>
              <label className="label">Caption Style</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                {CAPTION_STYLES.map(s => (
                  <div key={s.id} className={`caption-style-card ${captionStyle === s.id ? "active" : ""}`} onClick={() => setCaptionStyle(s.id)}>
                    {/* Mini live preview of the style */}
                    <div style={{
                      fontSize: 14, fontWeight: 900, textAlign: "center", padding: "6px 0", letterSpacing: 1,
                      textTransform: "uppercase", textShadow: "1px 1px 0 #000, -1px -1px 0 #000",
                      color: s.id === "highlight" ? "#FFD700"
                           : s.id === "bounce"    ? "#ffffff"
                           : s.id === "fade"      ? "#30d5c8"
                           :                        "#FF69B4",
                    }}>WORD</div>
                    <div style={{ fontSize: 12, fontWeight: 600, textAlign: "center", marginTop: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", textAlign: "center" }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caption Font */}
            <div>
              <label className="label">Caption Font</label>
              <select className="select" value={captionFont} onChange={e => setCaptionFont(e.target.value)}>
                <option value="impact">Bold Impact</option>
                <option value="syne">Syne ExtraBold</option>
                <option value="montserrat">Montserrat Black</option>
                <option value="arial">Arial Bold</option>
              </select>
              {/* Font preview */}
              <div style={{ marginTop: 8, padding: "10px", background: "#000", borderRadius: 8, textAlign: "center", fontSize: 18, fontWeight: 900, color: captionColor, textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000", letterSpacing: 2, textTransform: "uppercase" }}>
                Preview Text
              </div>
            </div>

            {/* Caption Color */}
            <div>
              <label className="label">Caption Color</label>
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                {CAPTION_COLORS.map(({ hex, label }) => (
                  <div key={hex} onClick={() => setCaptionColor(hex)} title={label}
                    style={{
                      width: 32, height: 32, borderRadius: "50%", background: hex, cursor: "pointer",
                      border: captionColor === hex ? "3px solid white" : "2px solid rgba(255,255,255,0.15)",
                      transform: captionColor === hex ? "scale(1.25)" : "scale(1)",
                      transition: "all 0.15s",
                      boxShadow: captionColor === hex ? `0 0 12px ${hex}88` : "none",
                    }}
                  />
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)" }}>
                Selected: <span style={{ color: captionColor, fontWeight: 700, fontFamily: "monospace" }}>{captionColor}</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── CENTER PREVIEW ── */}
      <div className="editor-center">
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>Preview</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {generating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text2)" }}>
                <Spinner size={14} />
                Generating... {Math.round(progress)}%
              </div>
            )}
            {generated && <span className="badge badge-green">✓ Ready to export</span>}
            <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
              {generating ? <><Spinner size={12} /> Generating…</> : "⚡ Generate Video"}
            </button>
          </div>
        </div>

       <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, background: "var(--bg)" }}>
          <div style={{ position: "relative",
            width: resolution === "1920x1080" ? 480 : resolution === "1080x1080" ? 340 : 220,
            aspectRatio: resolution === "1920x1080" ? "16/9" : resolution === "1080x1080" ? "1/1" : "9/16",
            background: "linear-gradient(180deg, #0f0f2a, #1a0a2e)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", border: "1px solid var(--border2)" }}>
            {generated && outputVideoUrl ? (
              <video src={outputVideoUrl?.startsWith('http') ? outputVideoUrl : `http://localhost:5000${outputVideoUrl}`} controls autoPlay loop
  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{templateData.emoji}</div>
                {generating && (
                  <div style={{ width: "100%", padding: "0 16px" }}>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progress}%`, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 8 }}>Processing your video...</div>
                  </div>
                )}
                {!generating && !generated && (
                  <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>▶</div>
                    <div>Click Generate to preview</div>
                    {/* Live style indicator */}
                    <div style={{ marginTop: 12, padding: "6px 12px", background: "rgba(0,0,0,0.4)", borderRadius: 8, fontSize: 11 }}>
                      <span style={{ color: captionColor, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{captionStyle}</span>
                      <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                      <span style={{ color: "var(--text3)" }}>{captionFont}</span>
                    </div>
                  </div>
                )}
                {generated && !outputVideoUrl && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Video ready!</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm">◁ Undo</button>
            <button className="btn btn-secondary btn-sm">Redo ▷</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" disabled={!generated}
              onClick={() => {
                if (outputVideoUrl) {
                  const a = document.createElement("a");
                  a.href = outputVideoUrl?.startsWith('http') ? outputVideoUrl : `http://localhost:5000${outputVideoUrl}`;
                  a.download = "clipforge-video.mp4";
                  a.click();
                }
              }}>⬇ Export MP4</button>
            <button className="btn btn-secondary btn-sm" disabled={!generated}>📤 Share</button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="editor-right">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Settings</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">Resolution</label>
            <select className="select" value={resolution} onChange={e => setResolution(e.target.value)}>
  <option value="1080x1920">1080 × 1920 (9:16)</option>
  <option value="1920x1080">1920 × 1080 (16:9)</option>
  <option value="1080x1080">1080 × 1080 (1:1)</option>
</select>
          </div>
          <div>
            <label className="label">Video Length</label>
            <select className="select">
              <option>Auto (from script)</option>
              <option>30 seconds</option>
              <option>60 seconds</option>
              <option>90 seconds</option>
            </select>
          </div>
          <div className="divider" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Options</div>
            {[["Add Watermark", false], ["Add Intro Music", true], ["Auto-fade Audio", true], ["HD Export", true]].map(([label, defaultOn], i) => {
              const [checked, setChecked] = useState(defaultOn);
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
                  <Toggle on={checked} onToggle={() => setChecked(!checked)} />
                </div>
              );
            })}
          </div>
          <div className="divider" />
          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>Cost Estimate</div>
            {[["TTS (45s)", "4 tokens"], ["Captions", "2 tokens"], ["Rendering", "2 tokens"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span className="text-muted">{k}</span><span>{v}</span>
              </div>
            ))}
            <div className="divider" style={{ margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
              <span>Total</span><span style={{ color: "var(--accent2)" }}>{templateData.tokens} tokens</span>
            </div>
          </div>

          {/* ── Live caption preview in settings panel ── */}
          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Caption Preview</div>
            <div style={{ background: "#000", borderRadius: 8, padding: "16px 12px", textAlign: "center" }}>
              <div style={{
                fontSize: 20, fontWeight: 900, color: captionColor, letterSpacing: 2, textTransform: "uppercase",
                textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                lineHeight: 1.3,
              }}>
                WORD BY<br />WORD
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 8 }}>
                {captionStyle} · {captionFont} · <span style={{ color: captionColor, fontFamily: "monospace" }}>{captionColor}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ─── PROJECTS PAGE ────────────────────────────────────────────────────────────
function ProjectsPage({ setPage }) {
  const [filter, setFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects(1, 50);
        setProjects(data.projects || []);
      } catch (err) {
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const TEMPLATE_EMOJIS = {
    reddit: "👾", dialogue: "🎭", voiceover: "🎙️",
    lipsync: "💋", avatar: "🧑‍🎨", captions: "📝"
  };

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>My Projects</h1>
        <button className="btn btn-primary" onClick={() => setPage("template-select")}>+ New Video</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["all", "done", "processing", "queued", "failed"].map(f => (
          <button key={f} className={`tag ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={32} />
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--danger)" }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No projects yet</div>
          <p className="text-muted">Create your first video to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setPage("template-select")}>Create Now</button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((p, i) => (
            <div key={p._id} className="video-card" style={{ animation: `fadeUp 0.4s ${i * 0.06}s ease both` }}>
              <div className="video-thumb">
                <span style={{ fontSize: 48 }}>{TEMPLATE_EMOJIS[p.template] || "🎬"}</span>
                {p.status === "processing" && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--bg3)" }}>
                    <div style={{ height: "100%", background: "var(--accent)", width: "65%" }} />
                  </div>
                )}
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text3)", textTransform: "capitalize" }}>{p.template}</span>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <StatusDot status={p.status} />
                    <span style={{ fontSize: 12, color: "var(--text2)", textTransform: "capitalize" }}>{p.status}</span>
                  </div>
                  {p.tokensUsed > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>⚡ {p.tokensUsed} tokens</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PRICING PAGE ─────────────────────────────────────────────────────────────
function PricingPage({ setPage }) {
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(null);
  const { purchasePlan, purchaseTokens } = useBillingStore();
  const user = useAuthStore((state) => state.user);

  const handlePlanPurchase = async (planId) => {
    if (!user) return setPage("register");
    if (planId === "free") return setPage("register");
    setLoading(planId);
    await purchasePlan(planId, user,
      (result) => { alert(`Successfully subscribed to ${planId} plan! Tokens: ${result.tokens}`); setLoading(null); },
      (error) => { console.error(error); setLoading(null); }
    );
  };

  const handleTokenPurchase = async (packId) => {
    if (!user) return setPage("register");
    setLoading(packId);
    await purchaseTokens(packId, user,
      (result) => { alert(`Successfully added tokens! New balance: ${result.tokens}`); setLoading(null); },
      (error) => { console.error(error); setLoading(null); }
    );
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Simple, transparent pricing</h1>
        <p className="text-muted" style={{ fontSize: 17, marginBottom: 24 }}>Start free. Scale as you grow.</p>
        <div style={{ display: "inline-flex", padding: 4, background: "var(--bg3)", borderRadius: 10, gap: 4 }}>
          {["monthly", "yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, transition: "all 0.15s", background: billing === b ? "var(--surface)" : "transparent", color: billing === b ? "var(--text)" : "var(--text2)" }}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
              {b === "yearly" && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--success)", fontWeight: 600 }}>-20%</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
        {PLANS.map((plan, i) => (
          <div key={plan.id} className={`pricing-card ${plan.featured ? "featured" : ""}`} style={{ animation: `fadeUp 0.5s ${i * 0.1}s ease both` }}>
            {plan.featured && (
              <div style={{ background: "linear-gradient(90deg, var(--accent), var(--pink))", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, marginBottom: 20, display: "inline-block", letterSpacing: "0.05em" }}>MOST POPULAR</div>
            )}
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span className="price-tag" style={{ fontSize: 40 }}>${billing === "yearly" ? Math.round(plan.price * 0.8) : plan.price}</span>
              {plan.price > 0 && <span className="price-period">/mo</span>}
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>{plan.tokens} tokens / month</div>
            <button className={`btn ${plan.featured ? "btn-primary" : "btn-secondary"}`}
              style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
              onClick={() => handlePlanPurchase(plan.id)} disabled={loading === plan.id}>
              {loading === plan.id ? <Spinner /> : plan.price === 0 ? "Start Free" : `Get ${plan.name}`}
            </button>
            <div>
              {plan.features.map((f, fi) => (
                <div key={fi} className="feature-row">
                  <span style={{ color: "var(--success)", fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 64, maxWidth: 800, margin: "64px auto 0" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Need more tokens?</h2>
        <p style={{ textAlign: "center", color: "var(--text2)", fontSize: 14, marginBottom: 28 }}>Top up anytime. No expiry.</p>
        <div className="grid-4">
          {[{ id: "starter", name: "Starter", tokens: 100, price: 9.99 }, { id: "power", name: "Power", tokens: 300, price: 24.99 }, { id: "creator", name: "Creator", tokens: 750, price: 49.99 }, { id: "studio", name: "Studio", tokens: 2000, price: 99.99 }].map((pack, i) => (
            <div key={i} className="card card-glow" style={{ textAlign: "center", padding: "20px 16px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{pack.name}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent2)", fontFamily: "var(--font-display)", marginBottom: 2 }}>{pack.tokens}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>tokens</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>${pack.price}</div>
              <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => handleTokenPurchase(pack.id)} disabled={loading === pack.id}>
                {loading === pack.id ? <Spinner /> : "Buy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNT PAGE ─────────────────────────────────────────────────────────────
function AccountPage({ setUser, setPage }) {
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile(name);
      await refreshUser();
      setProfileMsg({ type: "success", text: "Name updated successfully!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "Failed to update name." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPasswordMsg({ type: "error", text: "All password fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return setPasswordMsg({ type: "error", text: "New passwords do not match." });
    }
    if (newPassword.length < 6) {
      return setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
    }
    setPasswordLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.message || "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will permanently delete your account and all data.")) return;
    try {
      await deleteAccount();
      setUser(null);
      setPage("landing");
    } catch (err) {
      alert("Failed to delete account. Please try again.");
    }
  };

  const tokenPercent = Math.min(100, ((user?.tokens ?? 0) / 300) * 100);

  const MsgBanner = ({ msg }) => msg ? (
    <div style={{
      padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 10,
      background: msg.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
      border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
      color: msg.type === "success" ? "var(--success)" : "var(--danger)"
    }}>{msg.text}</div>
  ) : null;

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Account Settings</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Profile */}
        <div className="card">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700 }}>
              {user?.name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label className="label">Display Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="label">Email</label><input className="input" value={user?.email} disabled style={{ opacity: 0.5 }} /></div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }} onClick={handleSaveProfile} disabled={profileLoading}>
              {profileLoading ? <Spinner size={12} /> : "Save Changes"}
            </button>
            <MsgBanner msg={profileMsg} />
          </div>
        </div>

        {/* Current Plan */}
        <div className="card">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Current Plan</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{user?.plan} Plan</span>
                <span className="badge badge-purple">Active</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage("pricing")}>Upgrade</button>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${tokenPercent}%` }} /></div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>{user?.tokens ?? 0} tokens remaining</div>
        </div>

        {/* Security */}
        <div className="card">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Security</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label className="label">Current Password</label><input className="input" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
            <div><label className="label">New Password</label><input className="input" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
            <div><label className="label">Confirm New Password</label><input className="input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
            <button className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }} onClick={handleUpdatePassword} disabled={passwordLoading}>
              {passwordLoading ? <Spinner size={12} /> : "Update Password"}
            </button>
            <MsgBanner msg={passwordMsg} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card">
  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Session</div>
  <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>Sign out of your account on this device.</p>
  <button className="btn btn-secondary btn-sm" onClick={async () => {
    await useAuthStore.getState().logout();
    setUser(null);
    setPage("landing");
  }}>Sign Out</button>
</div>

<div className="card">
  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--danger)" }}>Danger Zone</div>
  <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>Permanently delete your account and all data. This cannot be undone.</p>
  <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>Delete Account</button>
</div>

      </div>
    </div>
  );
}

// ─── AFFILIATE PAGE ───────────────────────────────────────────────────────────
function AffiliatePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAffiliateStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load affiliate stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(stats?.referralLink || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <Spinner size={32} />
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Affiliate Program</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>Earn 20% commission on every referred user's first 3 payments.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Clicks",   value: stats?.totalClicks       ?? 0, icon: "🔗" },
          { label: "Signups",        value: stats?.totalConversions  ?? 0, icon: "👥" },
          { label: "Total Referrals",value: stats?.referrals?.length ?? 0, icon: "💰" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize: 28 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>Your Referral Link</div>
        <div className="affiliate-link-box">
          <span style={{ fontSize: 13 }}>{stats?.referralLink || "Loading..."}</span>
          <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? "✓ Copied!" : "Copy"}</button>
        </div>
        <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 10 }}>Share this link and earn 20% on every payment your referrals make for 3 months.</p>
      </div>

      <div className="card">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>Recent Referrals</div>
        {stats?.referrals?.length === 0 ? (
          <div className="empty-state" style={{ padding: "20px 0" }}>
            <div className="empty-icon" style={{ fontSize: 32 }}>👥</div>
            <p className="text-muted" style={{ fontSize: 13 }}>No referrals yet — start sharing your link!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>User</th><th>Joined</th><th>Plan</th></tr></thead>
            <tbody>
              {stats?.referrals?.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--text2)" }}>{r.name}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge badge-purple" style={{ textTransform: "capitalize" }}>{r.plan}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage() {
  const [tab, setTab] = useState("users");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsData, usersData] = await Promise.all([
          getAdminAnalytics(),
          getAdminUsers(1, 20)
        ]);
        setAnalytics(analyticsData);
        setUsers(usersData.users || []);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteAdminUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const handleUpdateTokens = async (id, tokens) => {
    try {
      const updated = await updateAdminUser(id, { tokens: Number(tokens) });
      setUsers(users.map(u => u._id === id ? { ...u, tokens: updated.tokens } : u));
    } catch (err) {
      alert("Failed to update tokens.");
    }
  };

  const getPlanCount = (plan) => analytics?.planCounts?.find(p => p._id === plan)?.count ?? 0;
  const getTemplateCount = (template) => analytics?.templateCounts?.find(t => t._id === template)?.count ?? 0;
  const topTemplate = analytics?.templateCounts?.sort((a, b) => b.count - a.count)?.[0];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <Spinner size={32} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>Admin Panel</h1>
        <span className="badge badge-yellow">⊛ Admin</span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Users",    value: analytics?.totalUsers    ?? 0 },
          { label: "Total Videos",   value: analytics?.totalProjects ?? 0 },
          { label: "Completed",      value: analytics?.totalDone     ?? 0 },
          { label: "Success Rate",   value: analytics?.totalProjects ? `${Math.round((analytics.totalDone / analytics.totalProjects) * 100)}%` : "0%" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{ fontSize: 26 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 24, maxWidth: 400 }}>
        {["users", "analytics"].map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Plan</th><th>Tokens</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{u.email}</div>
                  </td>
                  <td><span className="badge badge-purple" style={{ textTransform: "capitalize" }}>{u.plan}</span></td>
                  <td>
                    <input
                      type="number"
                      defaultValue={u.tokens}
                      style={{ width: 70, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", color: "var(--text1)", fontSize: 13 }}
                      onBlur={e => {
                        if (Number(e.target.value) !== u.tokens) {
                          handleUpdateTokens(u._id, e.target.value);
                        }
                      }}
                    />
                  </td>
                  <td style={{ color: "var(--text2)", fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="grid-2">
            {[
              { title: "Free Plan Users",    value: getPlanCount("free"),    sub: "on free plan" },
              { title: "Creator Plan Users", value: getPlanCount("creator"), sub: "on creator plan" },
              { title: "Top Template",       value: topTemplate?._id ?? "—", sub: `${topTemplate?.count ?? 0} generations` },
              { title: "Total Completed",    value: analytics?.totalDone ?? 0, sub: "videos done" },
            ].map((s, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 4, textTransform: "capitalize" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Template breakdown */}
          <div className="card">
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Template Breakdown</div>
            {analytics?.templateCounts?.sort((a, b) => b.count - a.count).map(t => {
              const pct = Math.round((t.count / (analytics.totalProjects || 1)) * 100);
              return (
                <div key={t._id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: "capitalize" }}>{t._id}</span>
                    <span style={{ color: "var(--text3)" }}>{t.count} ({pct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ComingSoonPage({ setPage, template }) {
  const info = {
    lipsync: { emoji: "💋", name: "Lip Sync", desc: "AI-powered lip sync to any audio track" },
    avatar:  { emoji: "🧑‍🎨", name: "AI Avatar", desc: "Animate any image to speak your script" },
  }[template] || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>{info.emoji}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{info.name}</div>
      <p style={{ fontSize: 16, color: "var(--text2)", maxWidth: 400, marginBottom: 8 }}>{info.desc}</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 20, marginBottom: 32 }}>
        <span style={{ fontSize: 12, color: "var(--accent2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>🔜 Coming Soon</span>
      </div>
      <p style={{ fontSize: 14, color: "var(--text3)", maxWidth: 440, marginBottom: 32 }}>
        This feature requires a third-party AI API integration. We're working on bringing it to ClipForge soon. Stay tuned!
      </p>
      <button className="btn btn-primary" onClick={() => setPage("template-select")}>← Back to Templates</button>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { fetchMe } = useAuthStore();
  const storeUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token && window.location.pathname === "/auth/google/success") {
      localStorage.setItem("accessToken", token);
      window.history.replaceState({}, document.title, "/");
      fetchMe().then(() => {
        setPage("dashboard");
        setSessionLoading(false);
      });
      return;
    }

    const ref = urlParams.get("ref");
    if (ref) {
      trackAffiliateClick(ref).catch(() => {});
      localStorage.setItem("affiliateRef", ref);
    }

    const existingToken = localStorage.getItem("accessToken");
    if (existingToken) {
      fetchMe().then(() => {
        setPage("dashboard");
        setSessionLoading(false);
      }).catch(() => {
        setSessionLoading(false);
      });
    } else {
      setSessionLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync local user state with Zustand store
  useEffect(() => {
    if (storeUser) setUser(storeUser);
  }, [storeUser]);

 const publicPages = ["landing", "login", "register"];
  const isPublic = publicPages.includes(page);
  const isEditor = page.startsWith("editor:");

  const renderPage = () => {
    if (page.startsWith("editor:")) {
  const template = page.split(":")[1];
  if (["lipsync", "avatar"].includes(template)) {
    return <ComingSoonPage setPage={setPage} template={template} />;
  }
  return <EditorPage setPage={setPage} template={template} />;
}
    switch (page) {
      case "landing":         return <LandingPage setPage={setPage} />;
      case "login":           return <AuthPage mode="login"     setPage={setPage} setUser={setUser} />;
      case "register":        return <AuthPage mode="register"  setPage={setPage} setUser={setUser} />;
      case "dashboard":       return <DashboardPage setPage={setPage} />;
      case "template-select": return <TemplateSelectorPage setPage={setPage} />;
      case "projects":        return <ProjectsPage setPage={setPage} />;
      case "pricing":         return <PricingPage setPage={setPage} />;
      case "account":         return <AccountPage user={user} setUser={setUser} setPage={setPage} />;
      case "affiliate":       return <AffiliatePage />;
      case "admin":           return <AdminPage />;
      default:                return <LandingPage setPage={setPage} />;
    }
  };

  if (sessionLoading) return (
    <>
      <style>{styles}</style>
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>✦ ClipForge</div>
          <Spinner size={32} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <Navbar page={page} setPage={setPage} user={user} setUser={setUser} />
      {isPublic ? renderPage() : isEditor ? <div>{renderPage()}</div> : (
        <div className="app-layout">
          <Sidebar page={page} setPage={setPage} user={storeUser} />
          <main className="main-content">{renderPage()}</main>
        </div>
      )}
    </>
  );
}