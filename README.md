# 3D Vector Field & Vector Calculus Visualizer

An interactive, high-performance 3D WebGL visualizer built with **React**, **Three.js** (`@react-three/fiber`), and **CSS Modules**. This tool is designed to provide intuitive, real-time visual insights into 3D vector fields $\vec{F}(x,y,z)$, field dynamics, flow streamlines, divergence ($\nabla \cdot \vec{F}$), and curl ($\nabla \times \vec{F}$).

> **Project Status**: Currently prototyping interactive streamline flow dynamics and source-sink kinetics for vector field functions. Advanced vector calculus visualization modes (divergence heatmaps, curl vector grids, custom formula inputs) are under active development.

---

## 🌟 Key Features & Visual Concepts

### 1. High-Performance Particle Streamlines
- **Direct Buffer Mutator**: Frame-by-frame updates occur directly via high-performance `Float32Array` vertex buffers without React state overhead, maintaining a smooth **60 FPS** with up to **10,000 simultaneous particle streamlines**.
- **Speed-Normalized Motion**: Particles advance along normalized directional velocity vectors $\hat{v} = \vec{v} / |\vec{v}|$, maintaining consistent baseline flow speeds across spatial gradients while velocity magnitudes are mapped to perceptual color scales.

### 2. Physical Source & Sink Dynamics (Dipole Mode)
- **Source Generation**: Streamline particles are continuously generated at the Source (+2.5, 0, 0) with randomized spatial jitter.
- **Sink Termination**: Particles entering within collision radius ($r = 0.5$) of the Sink (-2.5, 0, 0) are automatically absorbed and terminated.

### 3. Vector Field Presets
- **Tornado Vortex Field**: Rotational vorticity flow exhibit helical vertical displacement around the Z-axis.
- **Electromagnetic Dipole Field**: Bipolar vector field demonstrating inverse-square push from Source to Sink.
- **Saddle Point Field**: Hyperbolic equilibrium flow showing convergence along Y/Z axes and divergence along X axis.

### 4. Interactive UI & Customization
- **Simulation Sliders**: Adjust Particle Count (2,500 – 10,000), Flow Speed, and Tail Length in real time.
- **Perceptual Color Palettes**: Choose between **Viridis**, **Plasma**, and **Magma** color gradients tailored separately for Light and Dark modes.
- **Architectural Themes**: Seamless toggle between Scientific Light Mode and Luminous Dark Mode.
- **3D Scene Controls**: Smooth camera panning, zooming, and auto-rotation powered by `OrbitControls`.

---

## 🛠️ Technology Stack

- **Core Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: Scoped **CSS Modules** (`.module.css`) + CSS Custom Properties
- **Icons & Typography**: [Lucide React](https://lucide.dev/), Fira Code, Inter
- **Deployment**: [GitHub Pages](https://pages.github.com/) via `gh-pages` and GitHub Actions CI/CD

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18 or higher) and npm installed:
```bash
node -v
npm -v
```

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/username/vector-field-visualizer.git
   cd vector-field-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
Create an optimized production bundle:
```bash
npm run build
```

---

## 📦 Deployment to GitHub Pages

### Manual CLI Deploy
Deploy directly from your terminal:
```bash
npm run deploy
```

### Automated GitHub Actions Deploy
Push changes to the `main` or `master` branch. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and publish the site to GitHub Pages.

---

## 🗺️ Roadmap & Future Additions

- [ ] **Custom Formula Input**: Parser allowing users to type custom mathematical functions for $\vec{F}(x,y,z) = (f_x, f_y, f_z)$.
- [ ] **Discrete Eulerian Tangent Grid**: High-density instanced vector grid using `THREE.InstancedMesh` with GPU GLSL pulse shaders.
- [ ] **Scalar Divergence Cloud ($\nabla \cdot \vec{F}$)**: Instanced sphere point cloud colored by scalar source/sink intensity.
- [ ] **Rotational Curl Field ($\nabla \times \vec{F}$)**: Vector orientation matching local vorticity tensors.
- [ ] **Streamline Trajectory Tracing**: Runge-Kutta 4th order (RK4) integration curves for exact mathematical streamlines.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
