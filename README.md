<div align="center">

# 🎵 WaveCrop

**Client-Side Audio Trimmer, Merger & Studio**

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://reactjs.org/) [![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?logo=vite)](https://vitejs.dev/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/) [![WebAssembly](https://img.shields.io/badge/WebAssembly-LAME-654FF0.svg?logo=webassembly)](https://webassembly.org/) [![PWA](https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8.svg?logo=pwa)](https://web.dev/progressive-web-apps/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

WaveCrop is a high-performance, browser-native audio workstation for cutting, merging, and exporting audio clips. Built with modern web technologies, Web Assembly (WASM) multi-threading, and Progressive Web App (PWA) offline capabilities, WaveCrop processes all your files **100% locally** on your device with zero server uploads and zero privacy tradeoffs.

</div>

---

## Features

- **Interactive Waveform Editor** — High-precision audio visualization powered by WaveSurfer.js with real-time hover time tooltips and custom region drag selection.
- **Precise Multi-Interval Cutting** — Create unlimited clip intervals with sub-second millisecond accuracy via interactive visual waveform dragging or manual timestamp inputs (`mm:ss.ms` / `hh:mm:ss.ms`).
- **Audio Merger & Linker** — Concatenate and stitch multiple intervals into a single, seamless continuous audio track without silent gaps or clicks.
- **WASM Multi-Format Encoding** — Export clips as uncompressed **WAV** or WebAssembly-accelerated **MP3** (192 kbps), reducing exported file sizes by **~90%**.
- **Non-Blocking Multithreading** — All heavy audio encoding runs inside dedicated **Web Workers**, keeping the user interface buttery smooth at 60 FPS without tab freezing or browser lag.
- **Batch ZIP Export** — Package and download all defined intervals in a single click as a compressed `.zip` archive with an animated progress loader.
- **Progressive Web App (PWA) & Offline Mode** — Fully installable on Desktop, Android, and iOS devices. Works completely offline without an internet connection.
- **Pitch-Black Dark & Teal Glassmorphism** — Crafted with dynamic HSL color tokens, dark mode (`#000000`), glassmorphism cards, and interactive micro-animations.
- **Keyboard Shortcuts & Seeking** — Full transport accessibility (`Space` to Play/Pause, `←`/`→` to Seek ±5s, `↑`/`↓` to Adjust Volume, plus dedicated on-screen ±5s seek controls for mobile screens).
- **100% Private & Local** — Zero server uploads. Your audio files never leave your web browser.

---

## Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | UI component architecture |
| **Build Tooling** | **Vite 5** | Lightning-fast HMR & production bundler |
| **Styling & Theme** | **Tailwind CSS 3** | Vanilla CSS design tokens & glassmorphism system |
| **Audio Engine** | **WaveSurfer.js 7** | Interactive canvas waveform & region plugins |
| **High-Perf Encoding** | **WebAssembly (WASM LAME)** | Multi-threaded MP3 & WAV Web Worker encoding engine |
| **PWA & Caching** | **vite-plugin-pwa** | Service worker caching & web app manifest |
| **State Management** | **Zustand** | Global audio file & interval workspace store |
| **Routing** | **React Router 7** | Client-side page navigation |
| **Icons & Toasts** | **Lucide React & Sonner** | Modern UI icon set & notifications |
| **Batch Bundling** | **JSZip** | Async ZIP archive compilation |

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause audio playback |
| <kbd>←</kbd> (Left Arrow) | Seek backward 5 seconds |
| <kbd>→</kbd> (Right Arrow) | Seek forward 5 seconds |
| <kbd>↑</kbd> (Up Arrow) | Increase playback volume |
| <kbd>↓</kbd> (Down Arrow) | Decrease playback volume |

*Note: Keyboard shortcuts are automatically disabled while typing in timestamp input fields.*

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/henokasegedew/wavecrop.git
   cd music-cropper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   *Access the app at [http://localhost:3000](http://localhost:3000).*

---

## Scripts

- **`npm run dev`** — Start Vite development server with HMR.
- **`npm run build`** — Build production assets, WASM background workers, and PWA service workers into `dist/`.
- **`npm run preview`** — Preview local production build.
- **`npm run lint`** — Run ESLint check for codebase health.

---

## Project Architecture

```
music-cropper/
├── public/                     # Static icons & PWA manifest assets
├── src/
│   ├── assets/                 # SVGs and static brand assets
│   ├── components/             # Modular React UI components
│   │   ├── layout/             # Layout wrapper, Header navbar & Theme toggle
│   │   ├── AudioPlayer.jsx     # WaveSurfer waveform player & transport bar
│   │   ├── AudioUploader.jsx   # Drag-and-drop file uploader
│   │   ├── ErrorBoundary.jsx   # Fallback React error boundary
│   │   ├── IntervalForm.jsx    # Timestamp manual entry card
│   │   ├── IntervalList.jsx    # Cut interval queue, format selector & export actions
│   │   ├── ProgressBar.jsx     # Animated shimmer loading indicator
│   │   └── SiteDescription.jsx # Feature overview cards
│   ├── pages/                  # Top-level view routes (Home, Editor, 404)
│   ├── store/                  # Zustand global audio state store
│   ├── utils/                  # Safe time formatting & Web Worker audio helpers
│   └── workers/                # WebAssembly LAME & WAV Web Worker encoding script
├── index.html                  # HTML entry point & font preloads
├── vite.config.js              # Vite configuration & PWA service worker plugin
└── package.json                # Project dependencies & build scripts
```

---

## Deployment

WaveCrop compiles to pure static HTML/CSS/JS/WASM assets in `./dist/` and can be deployed directly to any static web host:

- **Vercel / Netlify / Cloudflare Pages / GitHub Pages**:
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

---

## License

This project is licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Henok Asegedew.
