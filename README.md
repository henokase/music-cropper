# WaveCrop

**Precision Audio Trimmer & Studio**

A browser-based audio trimming and cropping application. Upload an audio file, visualize it as an interactive waveform, select crop intervals by dragging or entering timestamps, and export the segments as WAV files — individually or as a ZIP bundle. All processing happens **entirely in your browser** with zero server uploads.

---

## Features

- **Audio Upload** — Drag-and-drop or click-to-browse for MP3, WAV, OGG, M4A, and AAC files (up to 200 MB)
- **Waveform Visualization** — High-resolution WaveSurfer.js waveform with bar display
- **Interactive Cropping** — Click and drag directly on the waveform to create crop intervals; fine-tune with precise start/end timestamps
- **Manual Interval Entry** — Add intervals by typing `mm:ss` or `h:mm:ss` timestamps
- **Single Export** — Download any interval as a 16-bit WAV file
- **Batch Export** — Export all intervals at once as a ZIP archive with a live progress indicator
- **Dark / Light Theme** — Toggle between dark and light modes (persisted to localStorage)
- **Keyboard Shortcuts** — Play/Pause (Space), Seek (±5s with Arrow keys), Volume control (Arrow Up/Down)
- **100% Private** — All audio processing is client-side; your files never leave your machine
- **Responsive Design** — Works on desktop and tablet viewports

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | TailwindCSS 3 |
| **Audio** | WaveSurfer.js 7 + Regions Plugin |
| **State** | Zustand |
| **Routing** | React Router 7 |
| **Icons** | Lucide React |
| **Export** | JSZip (WAV) |
| **Animations** | Framer Motion |
| **Notifications** | Sonner |
| **Linting** | ESLint 9 (flat config) |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
git clone https://github.com/henokasegedew/wavecrop.git
cd wavecrop
npm install
```

### Development

```bash
npm run dev
```

Opens the Vite dev server at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

Output is written to `./dist/`, ready for static hosting.

### Preview Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Usage

1. **Upload** — On the home page, drop an audio file or click the upload area to browse
2. **Crop** — In the editor, drag across the waveform or use the manual entry form to define intervals
3. **Export** — Click the download icon on any interval for a single WAV, or hit "Export All (ZIP)" for a batch download

### Keyboard Shortcuts (Editor)

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `ArrowLeft` | Seek backward 5 seconds |
| `ArrowRight` | Seek forward 5 seconds |
| `ArrowUp` | Volume up |
| `ArrowDown` | Volume down |

---

## Project Structure

```
src/
├── assets/          # Static assets (SVG icon)
├── components/
│   ├── layout/      # Layout shell, ThemeToggle
│   ├── AudioPlayer.jsx      # WaveSurfer waveform + playback
│   ├── AudioUploader.jsx    # File upload (drag & drop)
│   ├── ErrorBoundary.jsx    # React error boundary
│   ├── IntervalForm.jsx     # Manual timestamp entry
│   ├── IntervalList.jsx     # Crop interval list + actions
│   ├── ProgressBar.jsx      # Export progress indicator
│   └── SiteDescription.jsx  # Feature cards
├── pages/
│   ├── HomePage.jsx         # Landing page
│   ├── EditorPage.jsx       # Editor workspace
│   └── NotFoundPage.jsx     # 404 page
├── store/
│   └── useAudioStore.js     # Zustand global state
├── utils/
│   └── audioUtils.js        # AudioBuffer → WAV converter
├── App.jsx                  # Root component with routes
├── index.css                # Global styles + CSS custom properties
└── main.jsx                 # Entry point
```

---

## Deployment

The project includes a `render.yaml` for one-click deployment to **Render** as a static site:

- **Build command:** `npm install && npm run build`
- **Publish directory:** `./dist`
- **SPA support:** All routes rewrite to `index.html` (via `_redirects` + Render config)
- **Pull request previews** are enabled

---

## License

[MIT](LICENSE) — Copyright (c) 2024 Henok Asegedew
