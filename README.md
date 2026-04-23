# 🌌 3D Solar System Explorer

An interactive 3D solar system visualization built with **Three.js** — featuring realistic procedural planet textures, smooth camera transitions, and a stunning galaxy background.

## 🚀 Live Demo

Open `index.html` in your browser or visit the GitHub Pages deployment.

## ✨ Features

- **8 Planets** — Mercury through Neptune with unique procedural textures
- **Realistic Sun** — Procedural surface texture with animated corona particles
- **Saturn's Rings** — Multi-band rings with Cassini division
- **Earth Details** — Oceans, continents, polar ice caps, clouds, and orbiting Moon
- **Galaxy Background** — 15,000 stars + 12,000 soft nebula dust particles
- **Fly-To Navigation** — Smooth cubic-eased camera transitions between planets
- **Planet Tracking** — Camera follows the selected planet as it orbits
- **Info Panels** — Glassmorphism panels with planet statistics
- **Speed Control** — 0.5x to 10x orbital speed
- **Responsive** — Works on desktop and mobile

## 🎮 Controls

| Action | Control |
|--------|--------|
| Navigate to planet | Click sidebar or press **1-8** |
| Return to overview | Press **ESC** |
| Orbit camera | Click & drag |
| Zoom | Scroll wheel |
| Select planet in 3D | Double-click |

## 🛠️ Tech Stack

- **Three.js** (r128) — 3D rendering
- **Vanilla JS** — No frameworks
- **Procedural Textures** — Generated via Canvas ImageData
- **CSS** — Glassmorphism UI with backdrop-filter

## 📁 Structure

```
├── index.html    # Main page
├── style.css     # UI styling
├── app.js        # Three.js engine & planet system
└── README.md     # This file
```

## 🏃 Run Locally

Just open `index.html` in a modern browser, or serve with:

```bash
npx serve .
```

Built with ❤️ and Three.js