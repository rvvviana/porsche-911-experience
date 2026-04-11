# Porsche 911 3D Experience 🏎️✨

An interactive web experience featuring a real-time 3D Porsche 911 Carrera 4S that reacts to scroll, with dynamic lighting, theme switching, and an engineering showcase carousel — all running in the browser with no build step required.

## Demo

🔗 **[Live site →](https://rvvviana.github.io/porsche-911-experience/)**

> **⚠️ Required:** Download the `free_porsche_911_carrera_4s.glb` file and place it inside the `assets/` folder before opening the site locally — the 3D model is not bundled in the repository.

## Screenshots

![Dark Mode](https://github.com/user-attachments/assets/b0359037-f2e7-44fe-b1d3-2f8740c34db3)
![Light Mode](https://github.com/user-attachments/assets/8e865972-91d5-4554-a4af-051d56c159e1)

## Features

**Real-Time 3D Viewer** — The Porsche 911 model (`.glb`/`.gltf`) is rendered via Three.js with WebGL. As the user scrolls, the car animates and repositions with smooth easing.

**Dark / Light Theme Toggle** — Seamless switching between a dark studio environment and a bright, airy showroom. In Light Mode, the car's paint color automatically shifts to Silver/White to match the ambient lighting.

**Dynamic Lighting** — Spotlights, directional lights, and ambient fills are individually tuned for each theme to produce realistic reflections and highlights across the car body.

**Engineering Carousel** — A fully custom-built responsive slider (no library) showcasing key components: Engine, Performance, and PDK transmission.

**Parallax Watermark Typography** — Large background text elements that drift at different speeds as the user scrolls, adding visual depth to the layout.

## Tech Stack

- **HTML5** — Semantic structure
- **CSS3 / Tailwind CSS** — Utility-first styling, flexbox, grid, glassmorphism effects
- **Vanilla JavaScript (ES6)** — Carousel logic, theme toggle, scroll event handling
- **Three.js** — WebGL engine for 3D model loading, animation, and lighting

## File Structure

```
├── index.html           # Main page structure
├── css/
│   └── style.css        # Custom styles and Light Mode overrides
├── js/
│   └── main.js          # Three.js setup, scroll logic, carousel, and theme switching
├── assets/              # Images (.png, .avif) and 3D models (.glb) — see note below
└── README.md
```

> The `assets/` folder is not included in this repository due to file size. Download the required `.glb` model separately and place it there before running locally.

## License

Built for educational and portfolio purposes. All Porsche trademarks and imagery belong to Dr. Ing. h.c. F. Porsche AG.

https://github.com/user-attachments/assets/079e8f03-221e-4d64-b0ef-853ceb8a092e
