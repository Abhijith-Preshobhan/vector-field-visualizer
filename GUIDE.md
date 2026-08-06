# 3D Vector Field Visualizer — Comprehensive Architecture & Mathematical Guide

Welcome to the **3D Vector Field Visualizer** internal codebase and mathematics guide! This document is crafted to explain step-by-step how this high-performance 3D WebGL web application works under the hood.

Whether you are new to web development, computer graphics, or vector calculus, this guide breaks down every single component, algorithm, shader, and mathematical formula in clear, intuitive terms.

---

## Table of Contents
1. [Core Concepts for Beginners](#1-core-concepts-for-beginners)
   - [What is a Vector Field?](#what-is-a-vector-field)
   - [What is WebGL & Three.js?](#what-is-webgl--threejs)
   - [How Do We Visualize Vector Fields with Particles?](#how-do-we-visualize-vector-fields-with-particles)
   - [What is Euler Integration?](#what-is-euler-integration)
2. [Application Architecture & Component Flow](#2-application-architecture--component-flow)
3. [The Rendering & Particle Simulation Engine](#3-the-rendering--particle-simulation-engine)
   - [Flat Array Memory Buffers (`Float32Array`)](#flat-array-memory-buffers-float32array)
   - [Custom WebGL Shaders (`fieldShaders.js`)](#custom-webgl-shaders-fieldshadersjs)
   - [The Animation Loop & Respawning Logic](#the-animation-loop--respawning-logic)
4. [Deep Dive into the 7 Vector Fields & Mathematics](#4-deep-dive-into-the-7-vector-fields--mathematics)
   - [Understanding Vector Calculus (Divergence & Curl)](#understanding-vector-calculus-divergence--curl)
   - [1. Tornado Vortex Field](#1-tornado-vortex-field)
   - [2. Dipole Field (Source & Sink)](#2-dipole-field-source--sink)
   - [3. Saddle Point Field](#3-saddle-point-field)
   - [4. ABC Chaotic Flow (Arnold-Beltrami-Childress)](#4-abc-chaotic-flow-arnold-beltrami-childress)
   - [5. Spiral Accretion Sink](#5-spiral-accretion-sink)
   - [6. Toroidal Ring Vortex](#6-toroidal-ring-vortex)
   - [7. Quadrupole Strain Field](#7-quadrupole-strain-field)
5. [UI Architecture & Glassmorphic Design System](#5-ui-architecture--glassmorphic-design-system)

---

## 1. Core Concepts for Beginners

### What is a Vector Field?
Imagine walking outdoors on a windy day. At every point in space $(x, y, z)$, the wind blows in a specific direction with a specific speed. 
* A **scalar** is just a single number (e.g. temperature $= 22^\circ\text{C}$).
* A **vector** is a arrow with both a **direction** and a **magnitude** (length/speed).
* A **Vector Field** is a mathematical rule that assigns a 3D direction vector $\vec{V}(x, y, z) = (v_x, v_y, v_z)$ to every single point in 3D space.

### What is WebGL & Three.js?
Computers draw graphics using a specialized processor called the **GPU** (Graphics Processing Unit). 
* **WebGL** is a web standard that allows JavaScript in your web browser to talk directly to your computer's GPU.
* **Three.js** is a JavaScript library built on top of WebGL. It handles 3D math (cameras, lighting, 3D meshes, geometries) so developers don't have to write raw low-level WebGL graphics code from scratch.
* **React Three Fiber (`@react-three/fiber`)** connects Three.js with **React**, letting us write 3D scenes as clean React components.

### How Do We Visualize Vector Fields with Particles?
Because vector fields are invisible invisible mathematical mathematical constructs floating in space, we visualize them by spawning thousands of tiny moving line segments (particles with short tails). 
As these particles drift through space, their speed and direction at every frame are governed by the vector field at their current position. The trails left behind show us the "currents" or "streamlines" of the field.

### What is Euler Integration?
To move a particle through a vector field over time, we use a simple physics technique called **Euler Numerical Integration**:

$$\vec{r}_{\text{new}} = \vec{r}_{\text{old}} + \vec{V}(\vec{r}_{\text{old}}) \times \Delta t$$

Where:
- $\vec{r} = (x, y, z)$ is the position of the particle in 3D space.
- $\vec{V}(\vec{r}) = (v_x, v_y, v_z)$ is the field velocity calculated at that position.
- $\Delta t$ (delta time) is the tiny time step between animation frames (e.g., $1/60$th of a second).

---

## 2. Application Architecture & Component Flow

The visualizer follows a clean, decoupled modular architecture:

```
                  ┌──────────────────────────────┐
                  │          App.jsx             │
                  │   (State & Composition Root) │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌────────────────────┐
│    Header.jsx    │   │  Canvas Scene    │   │ Side Floating      │
│ (Brand & Vector  │   │ VectorField      │   │ Panels             │
│ Field Dropdown)  │   │ Particles.jsx    │   │ (FieldDynamics &   │
└──────────────────┘   └──────────────────┘   │ SimulationControls)│
                                              └────────────────────┘
```

1. **`App.jsx`**: Holds the central state of the simulation:
   - `mode`: Currently selected vector field (`tornado`, `dipole`, `saddle`, `abc`, `spiral_sink`, `toroidal`, `quadrupole`).
   - `particleCount`: Total active streamline particles (e.g. 7,500).
   - `flowSpeed` & `tailLength`: Simulation velocity multiplier & visual tail scaling.
   - `colorPaletteKey`: Current color map (`viridis`, `plasma`, `magma`).
   - `isDarkMode`: Theme state (Dark/Light).

2. **`Header.jsx`**: Displays top telemetry stats (Streamline count, FPS) and houses the custom glassmorphic **Vector Field Dropdown Selector**.

3. **`VectorFieldParticles.jsx`**: The core WebGL engine that computes particle physics and renders line segments on the GPU.

4. **`FieldDynamicsPanel.jsx`**: Renders real-time differential calculus equations ($\nabla \cdot \vec{V}$, $\nabla \times \vec{V}$) using KaTeX LaTeX typesetting.

---

## 3. The Rendering & Particle Simulation Engine

### Flat Array Memory Buffers (`Float32Array`)
In JavaScript, creating 10,000 separate object instances `{ x: 1, y: 2, z: 3 }` would cause severe memory allocation pauses and low frame rates (lag).
To achieve a smooth 60 FPS performance, `VectorFieldParticles.jsx` uses contiguous typed arrays (`Float32Array`):

1. **Position Buffer (`positions`)**:
   - Each streamline particle is rendered as a line segment with 2 vertices: a **Head** $(x_h, y_h, z_h)$ and a **Tail** $(x_t, y_t, z_t)$.
   - Size: `particleCount * 2 * 3` floats.

2. **Color Buffer (`colors`)**:
   - Contains RGBA color values for both Head and Tail vertices.
   - Size: `particleCount * 2 * 4` floats.

3. **Metadata Array (`particleMeta`)**:
   - Stores each particle's current exact 3D position and remaining `lifespan` float $[0.0, 1.0]$.

### Custom WebGL Shaders (`fieldShaders.js`)
Instead of default mesh materials, we use a custom **ShaderMaterial** for maximum performance:

* **Vertex Shader**: Receives 3D positions and per-vertex colors, transforming coordinates into camera screen space:
  ```glsl
  attribute vec4 color;
  varying vec4 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
  ```

* **Fragment Shader**: Outputs the final pixel RGBA color on screen:
  ```glsl
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
  ```

### The Animation Loop & Respawning Logic
Every animation frame (`useFrame`), the engine updates particle positions:

1. **Lifespan Decay**: Every particle's `lifespan` decreases over time.
2. **Absorption Checks**: In field modes like `dipole` (sink node) or `spiral_sink` (central singularity), particles that get too close to the sink are absorbed (`lifespan = 0`).
3. **Out-of-Bounds & Respawn**: If a particle dies (`lifespan <= 0`) or leaves the $12 \times 12 \times 12$ bounding box:
   - For `dipole`: 50% respawn near the positive source node $(+2.5, 0, 0)$.
   - For `spiral_sink`: Respawn along the outer boundary circle ($r \approx 4.5$).
   - For `toroidal`: Respawn near the torus ring radius ($R_0 = 3.0$).
   - Otherwise: Respawn at a random coordinate inside the bounding box.
4. **Color Mapping**: The speed magnitude $|\vec{V}| = \sqrt{v_x^2 + v_y^2 + v_z^2}$ is evaluated and linearly interpolated (`lerp`) across color palettes (Slow $\rightarrow$ Mid $\rightarrow$ Fast).

---

## 4. Deep Dive into the 7 Vector Fields & Mathematics

### Understanding Vector Calculus (Divergence & Curl)
Before looking at the 7 fields, let's understand two key calculus operators:

1. **Divergence ($\nabla \cdot \vec{V}$)**: Measures flux expansion or compression at a point.
   - Positive Divergence ($>0$): Source (fluid expanding outward, like a fountain).
   - Negative Divergence ($<0$): Sink (fluid compressing inward, like a drain).
   - Zero Divergence ($=0$): Divergence-free / Incompressible flow.

   $$\nabla \cdot \vec{V} = \frac{\partial v_x}{\partial x} + \frac{\partial v_y}{\partial y} + \frac{\partial v_z}{\partial z}$$

2. **Curl ($\nabla \times \vec{V}$)**: Measures rotational spinning or vorticity around a point. If you placed a tiny paddlewheel in the fluid, curl describes how fast and around which axis the wheel would spin.

---

### 1. Tornado Vortex Field
* **Type**: Atmospheric Helical Vortex (Divergence-Free)
* **Velocity Equation**:
  $$\vec{V}(x, y, z) = \begin{pmatrix} -1.2 \, y \\ 1.2 \, x \\ 0.5 \sin(0.5x) \cos(0.5y) \end{pmatrix}$$
* **Calculus Characteristics**:
  - **Divergence**: $\nabla \cdot \vec{V} = 0$
  - **Curl**: $\nabla \times \vec{V} = \begin{pmatrix} -0.25 \sin(0.5x)\sin(0.5y) \\ -0.25 \cos(0.5x)\cos(0.5y) \\ 2.4 \end{pmatrix}$
* **Code Implementation**:
  ```javascript
  vx = -y * 1.2;
  vy = x * 1.2;
  vz = 0.5 * Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2.0;
  ```
* **Explanation**: The $x$ and $y$ velocity components create rigid rotation around the vertical $Z$-axis (like a spinning column of air), while the $z$ component adds a sinusoidal vertical lift force, producing atmospheric tornadic spirals.

---

### 2. Dipole Field (Source & Sink)
* **Type**: Electrostatic Flow (Source + Sink)
* **Velocity Equation**:
  $$\vec{V}(\vec{r}) = q \left[ \frac{\vec{r} - \vec{r}_1}{|\vec{r} - \vec{r}_1|^3} - \frac{\vec{r} - \vec{r}_2}{|\vec{r} - \vec{r}_2|^3} \right]$$
  where $\vec{r}_1 = (+2.5, 0, 0)$ is the Source and $\vec{r}_2 = (-2.5, 0, 0)$ is the Sink.
* **Calculus Characteristics**:
  - **Divergence**: $\nabla \cdot \vec{V} = 4\pi q [ \delta(\vec{r}-\vec{r}_1) - \delta(\vec{r}-\vec{r}_2) ]$
  - **Curl**: $\nabla \times \vec{V} = \vec{0}$ (Irrotational)
* **Code Implementation**:
  ```javascript
  const dx1 = x - 2.5, dy1 = y, dz1 = z;
  const r1_sq = dx1*dx1 + dy1*dy1 + dz1*dz1 + 0.3; // +0.3 avoids divide-by-zero
  const r1_cube = Math.pow(r1_sq, 1.5);

  const dx2 = x - (-2.5), dy2 = y, dz2 = z;
  const r2_sq = dx2*dx2 + dy2*dy2 + dz2*dz2 + 0.3;
  const r2_cube = Math.pow(r2_sq, 1.5);

  vx = (dx1 / r1_cube - dx2 / r2_cube) * 6.0;
  vy = (dy1 / r1_cube - dy2 / r2_cube) * 6.0;
  vz = (dz1 / r1_cube - dz2 / r2_cube) * 6.0;
  ```
* **Explanation**: Models electric charges or magnetic poles. Flow violently pushes out from the positive source point and curves through space before being pulled into the negative sink point.

---

### 3. Saddle Point Field
* **Type**: Hyperbolic Equilibrium Flow
* **Velocity Equation**:
  $$\vec{V}(x, y, z) = \begin{pmatrix} 0.6 \, x \\ -0.6 \, y \\ -0.3 \, z \end{pmatrix}$$
* **Calculus Characteristics**:
  - **Divergence**: $\nabla \cdot \vec{V} = 0.6 - 0.6 - 0.3 = -0.3$
  - **Curl**: $\nabla \times \vec{V} = \vec{0}$
* **Code Implementation**:
  ```javascript
  vx = x * 0.6;
  vy = -y * 0.6;
  vz = -z * 0.3;
  ```
* **Explanation**: Demonstrates an unstable hyperbolic saddle point. Streamlines are compressed inward along the $Y$ and $Z$ axes toward the origin $(0,0,0)$, and shoots rapidly outward along the $X$-axis.

---

### 4. ABC Chaotic Flow (Arnold-Beltrami-Childress)
* **Type**: Solenoidal 3D Fluid Chaos (Beltrami Flow)
* **Velocity Equation**:
  $$\vec{V}(x, y, z) = \begin{pmatrix} A \sin(z) + C \cos(y) \\ B \sin(x) + A \cos(z) \\ C \sin(y) + B \cos(x) \end{pmatrix}$$
* **Calculus Characteristics**:
  - **Divergence**: $\nabla \cdot \vec{V} = 0$
  - **Curl**: $\nabla \times \vec{V} = \vec{V}$ (Velocity is an exact eigenvector of curl!)
* **Code Implementation**:
  ```javascript
  const kx = x * 0.5, ky = y * 0.5, kz = z * 0.5;
  vx = (Math.sin(kz) + Math.cos(ky)) * 1.5;
  vy = (Math.sin(kx) + Math.cos(kz)) * 1.5;
  vz = (Math.sin(ky) + Math.cos(kx)) * 1.5;
  ```
* **Explanation**: The ABC flow is famous in fluid dynamics and astrophysics. Because the velocity vector is parallel to its own curl vector, particles trace out fascinating, non-repeating 3D chaotic trajectories.

---

### 5. Spiral Accretion Sink
* **Type**: Helical Accretion Vortex
* **Velocity Equation**:
  $$\vec{V}(x, y, z) = \begin{pmatrix} -0.5 \, x - 1.2 \, y \\ 1.2 \, x - 0.5 \, y \\ -0.4 \, z \end{pmatrix}$$
* **Calculus Characteristics**:
  - **Divergence**: $\nabla \cdot \vec{V} = -0.5 - 0.5 - 0.4 = -1.4$ (Net inward attraction)
  - **Curl**: $\nabla \times \vec{V} = \begin{pmatrix} 0 \\ 0 \\ 2.4 \end{pmatrix}$
* **Code Implementation**:
  ```javascript
  vx = -0.5 * x - 1.2 * y;
  vy = 1.2 * x - 0.5 * y;
  vz = -0.4 * z;
  ```
* **Explanation**: Combines centripetal sink attraction $(-0.5x, -0.5y)$ with swirling vortex rotation $(-1.2y, +1.2x)$. Models black hole accretion disks and oceanic whirlpool drains.

---

### 6. Toroidal Ring Vortex
* **Type**: Donut-Shaped Vortex Ring (Poloidal & Toroidal Flow)
* **Velocity Equation**: Evaluates radial distance $\rho = \sqrt{x^2+y^2}$ relative to torus ring core radius $R_0 = 3.0$:
  $$\vec{V}(x,y,z) = \begin{pmatrix} \frac{-y z - x(\rho - R_0)}{(\rho - R_0)^2 + z^2 + a^2} \\[4pt] \frac{x z - y(\rho - R_0)}{(\rho - R_0)^2 + z^2 + a^2} \\[4pt] \frac{\rho (\rho - R_0)}{(\rho - R_0)^2 + z^2 + a^2} \end{pmatrix}$$
* **Code Implementation**:
  ```javascript
  const R0 = 3.0;
  const rho = Math.sqrt(x * x + y * y) + 0.0001;
  const drho = rho - R0;
  const denom = drho * drho + z * z + 0.8;

  const v_poloidal_r = -z / denom;
  const v_poloidal_z = drho / denom;
  const v_toroidal_theta = 1.2 / Math.sqrt(denom);

  const cosTheta = x / rho;
  const sinTheta = y / rho;

  vx = (cosTheta * v_poloidal_r - sinTheta * v_toroidal_theta) * 3.0;
  vy = (sinTheta * v_poloidal_r + cosTheta * v_toroidal_theta) * 3.0;
  vz = v_poloidal_z * 3.0;
  ```
* **Explanation**: Recreates the physics of smoke rings and plasma confinement in tokamak reactors. Particles roll continuously through the donut hole and circulate around the ring core.

---

### 7. Quadrupole Strain Field
* **Type**: 4-Pole Electrostatic Lens / Hyperbolic Stagnation Field
* **Velocity Equation**:
  $$\vec{V}(x, y, z) = \begin{pmatrix} 0.25 (x^2 - y^2) \\ -0.5 \, x \, y \\ -0.3 \, z \end{pmatrix}$$
* **Calculus Characteristics**:
  - **Divergence**: $\nabla \cdot \vec{V} = 0.5x - 0.5x - 0.3 = -0.3$
  - **Curl**: $\nabla \times \vec{V} = \vec{0}$
* **Code Implementation**:
  ```javascript
  vx = 0.25 * (x * x - y * y);
  vy = -0.5 * x * y;
  vz = -0.3 * z;
  ```
* **Explanation**: Models electric quadrupole lenses used in particle accelerators to focus charged particle beams. Creates a symmetrical four-lobed flow pattern with stagnation lines along diagonal axes.

---

## 5. UI Architecture & Glassmorphic Design System

The visualizer's UI overlay uses a **modern glassmorphic design system**:

* **Backdrop Blur**: Utilizes CSS `-webkit-backdrop-filter: blur(16px)` and translucent variable backgrounds (`var(--panel-bg)`).
* **CSS Modules**: Every component has an isolated module (e.g. `Header.module.css`, `FieldDynamicsPanel.module.css`, `App.module.css`) to prevent global style leakage.
* **Responsive Control Dock**:
  - **Desktop (≥ 768px)**: Floating glass side panels render mathematical formulas and simulation sliders side-by-side.
  - **Mobile (< 768px)**: Floating bottom action dock bar allows users to open slide-up drawer sheets for math and controls, keeping the main 3D canvas viewport clean and unobstructed.
