import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sliders,
  Activity,
  Compass,
  Sparkles,
  Info,
  ChevronRight,
  Palette,
  RotateCw
} from 'lucide-react';

// Bounding box size: 12x12x12 (range -6 to +6)
const BOX_SIZE = 12;
const HALF_BOX = BOX_SIZE / 2;

// Custom Shader Material supporting per-vertex color & alpha
const FieldShaderMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    attribute vec4 color;
    varying vec4 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending, // NormalBlending ensures rich high-contrast colors on Light Canvas
});

// Perceptually uniform sequential color scales for magnitude mapping
const COLOR_PALETTES = {
  viridis: {
    name: 'Viridis (Standard)',
    // Low: Dark Purple -> Mid: Teal -> High: Yellow
    slow: new THREE.Color('#440154'),
    mid: new THREE.Color('#21918c'),
    fast: new THREE.Color('#fde725'),
  },
  plasma: {
    name: 'Plasma (High Contrast)',
    // Low: Dark Blue -> Mid: Ruby/Pink -> High: Yellow
    slow: new THREE.Color('#0d0887'),
    mid: new THREE.Color('#cc4678'),
    fast: new THREE.Color('#f0f921'),
  },
  magma: {
    name: 'Magma (Heatmap)',
    // Low: Deep Black/Purple -> Mid: Crimson -> High: Bright Peach/White
    slow: new THREE.Color('#000004'),
    mid: new THREE.Color('#b5367a'),
    fast: new THREE.Color('#fcfdbf'),
  }
};

/**
 * High-performance 3D Vector Field Particle Simulation Component
 */
function VectorFieldParticles({
  mode,
  particleCount,
  flowSpeed,
  tailLength,
  colorPaletteKey,
  isPaused,
  onFpsUpdate
}) {
  const geomRef = useRef();

  // Color objects for dynamic interpolation inside useFrame
  const palette = COLOR_PALETTES[colorPaletteKey] || COLOR_PALETTES.viridis;

  // Initialize raw Float32Arrays once or when particleCount changes
  const { positions, colors, particleMeta } = useMemo(() => {
    // 2 vertices per particle (Head and Tail for line segment)
    const posArr = new Float32Array(particleCount * 2 * 3);
    const colArr = new Float32Array(particleCount * 2 * 4); // RGBA for each vertex
    // Meta: [x, y, z, lifespan]
    const metaArr = new Float32Array(particleCount * 4);

    for (let i = 0; i < particleCount; i++) {
      // Random starting positions within [-6, 6]
      const px = (Math.random() - 0.5) * BOX_SIZE;
      const py = (Math.random() - 0.5) * BOX_SIZE;
      const pz = (Math.random() - 0.5) * BOX_SIZE;
      const lifespan = Math.random(); // Initial random offset lifespan (0 to 1)

      metaArr[i * 4 + 0] = px;
      metaArr[i * 4 + 1] = py;
      metaArr[i * 4 + 2] = pz;
      metaArr[i * 4 + 3] = lifespan;

      // Head position
      posArr[i * 6 + 0] = px;
      posArr[i * 6 + 1] = py;
      posArr[i * 6 + 2] = pz;

      // Tail position
      posArr[i * 6 + 3] = px - 0.1;
      posArr[i * 6 + 4] = py - 0.1;
      posArr[i * 6 + 5] = pz - 0.1;

      // Initial colors
      for (let v = 0; v < 2; v++) {
        colArr[i * 8 + v * 4 + 0] = palette.slow.r;
        colArr[i * 8 + v * 4 + 1] = palette.slow.g;
        colArr[i * 8 + v * 4 + 2] = palette.slow.b;
        colArr[i * 8 + v * 4 + 3] = 0.0;
      }
    }

    return {
      positions: posArr,
      colors: colArr,
      particleMeta: metaArr
    };
  }, [particleCount]);

  // FPS calculation helper
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Main animation frame update loop (Direct Buffer Mutator)
  useFrame((state, delta) => {
    if (!geomRef.current) return;

    // Track FPS
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current >= 500) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      onFpsUpdate(fps);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    if (isPaused) return;

    const posAttr = geomRef.current.attributes.position;
    const colAttr = geomRef.current.attributes.color;

    const posData = posAttr.array;
    const colData = colAttr.array;

    const dt = Math.min(delta, 0.05) * flowSpeed;
    const maxSpeed = 12.0;

    const cSlow = palette.slow;
    const cMid = palette.mid;
    const cFast = palette.fast;

    for (let i = 0; i < particleCount; i++) {
      let x = particleMeta[i * 4 + 0];
      let y = particleMeta[i * 4 + 1];
      let z = particleMeta[i * 4 + 2];
      let lifespan = particleMeta[i * 4 + 3];

      // Decrease lifespan
      lifespan -= dt * 0.35;

      // Respawn check: if dead or out of 12x12x12 bounds [-6, 6]
      const outOfBounds = Math.abs(x) > HALF_BOX || Math.abs(y) > HALF_BOX || Math.abs(z) > HALF_BOX;
      if (lifespan <= 0 || outOfBounds) {
        if (mode === 'dipole' && Math.random() < 0.7) {
          // Fix Dipole Particle Starvation: Force 70% of dead particles to respawn precisely at the Source (2.5, 0, 0) with a slight randomized jitter
          x = 2.5 + (Math.random() - 0.5) * 0.5;
          y = (Math.random() - 0.5) * 0.5;
          z = (Math.random() - 0.5) * 0.5;
        } else {
          // Remaining 30% (or non-dipole modes) spawn randomly in the bounding box
          x = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          y = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          z = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
        }
        lifespan = 1.0;
      }

      // Calculate analytical velocity field vector (vx, vy, vz)
      let vx = 0, vy = 0, vz = 0;

      if (mode === 'tornado') {
        // Tornado (Curl-heavy)
        vx = -y * 1.2;
        vy = x * 1.2;
        vz = 0.5 * Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2.0;
      } else if (mode === 'dipole') {
        // Dipole (Divergence-heavy): Source at (2.5,0,0), Sink at (-2.5,0,0)
        const s1x = 2.5, s1y = 0, s1z = 0; // Source
        const s2x = -2.5, s2y = 0, s2z = 0; // Sink

        const dx1 = x - s1x, dy1 = y - s1y, dz1 = z - s1z;
        const r1_sq = dx1 * dx1 + dy1 * dy1 + dz1 * dz1 + 0.3;
        const r1_cube = Math.pow(r1_sq, 1.5);

        const dx2 = x - s2x, dy2 = y - s2y, dz2 = z - s2z;
        const r2_sq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2 + 0.3;
        const r2_cube = Math.pow(r2_sq, 1.5);

        // Push away from source, pull into sink
        vx = (dx1 / r1_cube - dx2 / r2_cube) * 6.0;
        vy = (dy1 / r1_cube - dy2 / r2_cube) * 6.0;
        vz = (dz1 / r1_cube - dz2 / r2_cube) * 6.0;
      } else if (mode === 'saddle') {
        // Saddle Point
        vx = x * 0.6;
        vy = -y * 0.6;
        vz = -z * 0.3;
      }

      // Speed magnitude calculation & clamping
      let speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (speed > maxSpeed) {
        const factor = maxSpeed / speed;
        vx *= factor;
        vy *= factor;
        vz *= factor;
        speed = maxSpeed;
      }

      // Integrate new position
      const nextX = x + vx * dt;
      const nextY = y + vy * dt;
      const nextZ = z + vz * dt;

      // Update particle metadata
      particleMeta[i * 4 + 0] = nextX;
      particleMeta[i * 4 + 1] = nextY;
      particleMeta[i * 4 + 2] = nextZ;
      particleMeta[i * 4 + 3] = lifespan;

      // Head vertex position
      posData[i * 6 + 0] = nextX;
      posData[i * 6 + 1] = nextY;
      posData[i * 6 + 2] = nextZ;

      // Tail vertex position scaled by velocity vector & tailLength factor
      const lengthScale = tailLength * 0.08;
      posData[i * 6 + 3] = nextX - vx * lengthScale;
      posData[i * 6 + 4] = nextY - vy * lengthScale;
      posData[i * 6 + 5] = nextZ - vz * lengthScale;

      // Opacity calculation based on sine wave of lifespan (smooth fade in/out)
      const opacity = Math.sin(lifespan * Math.PI);

      // Map speed to color spectrum
      const normSpeed = Math.min(speed / 4.5, 1.0);
      let r = 0, g = 0, b = 0;

      if (normSpeed < 0.5) {
        const t = normSpeed * 2.0;
        r = THREE.MathUtils.lerp(cSlow.r, cMid.r, t);
        g = THREE.MathUtils.lerp(cSlow.g, cMid.g, t);
        b = THREE.MathUtils.lerp(cSlow.b, cMid.b, t);
      } else {
        const t = (normSpeed - 0.5) * 2.0;
        r = THREE.MathUtils.lerp(cMid.r, cFast.r, t);
        g = THREE.MathUtils.lerp(cMid.g, cFast.g, t);
        b = THREE.MathUtils.lerp(cMid.b, cFast.b, t);
      }

      // Set RGBA color attributes for both Head (vertex 0) and Tail (vertex 1)
      colData[i * 8 + 0] = r;
      colData[i * 8 + 1] = g;
      colData[i * 8 + 2] = b;
      colData[i * 8 + 3] = opacity * 0.95; // Head opacity

      colData[i * 8 + 4] = r;
      colData[i * 8 + 5] = g;
      colData[i * 8 + 6] = b;
      colData[i * 8 + 7] = opacity * 0.3; // Tail opacity
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 4]}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <primitive object={FieldShaderMaterial} attach="material" />
    </lineSegments>
  );
}

/**
 * Subtle Bounding Box Wireframe for Scientific Light Theme
 */
function BoundingCube({ showBox }) {
  if (!showBox) return null;
  return (
    <group>
      <mesh>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshBasicMaterial color="#64748b" wireframe transparent opacity={0.2} />
      </mesh>
      {/* Corner indicator dots */}
      {[
        [-6, -6, -6], [6, -6, -6], [-6, 6, -6], [6, 6, -6],
        [-6, -6, 6], [6, -6, 6], [-6, 6, 6], [6, 6, 6]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Dipole Source/Sink Markers
 */
function DipoleMarkers({ mode }) {
  if (mode !== 'dipole') return null;
  return (
    <group>
      {/* Source (+ Charge / Outflow) */}
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.85} />
      </mesh>
      {/* Sink (- Charge / Inflow) */}
      <mesh position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Main Application Component
 */
export default function App() {
  const [mode, setMode] = useState('tornado'); // 'tornado' | 'dipole' | 'saddle'
  const [particleCount, setParticleCount] = useState(7500);
  const [flowSpeed, setFlowSpeed] = useState(1.0);
  const [tailLength, setTailLength] = useState(1.0);
  const [colorPaletteKey, setColorPaletteKey] = useState('viridis');
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(60);
  const [showInfo, setShowInfo] = useState(false);

  // Field mathematical descriptions for info cards
  const modeDescriptions = {
    tornado: {
      title: 'Tornado Vortex Field',
      type: 'Curl-Heavy / Rotational Flow',
      equation: 'v_x = -1.2y,  v_y = 1.2x,  v_z = 0.5 · sin(0.5x) · cos(0.5y)',
      desc: 'Simulates an atmospheric rotational vortex system with helical vertical displacement based on spatial trig functions.'
    },
    dipole: {
      title: 'Dipole Field (Source & Sink)',
      type: 'Divergence-Heavy / Electromagnetic Flow',
      equation: 'V(P) = k · [ (P - S₁) / |P - S₁|³ - (P - S₂) / |P - S₂|³ ]',
      desc: 'Models flow emitting from Source (+2.5,0,0) and absorbing into Sink (-2.5,0,0) with 70% continuous source injection.'
    },
    saddle: {
      title: 'Saddle Point Field',
      type: 'Hyperbolic Equilibrium Flow',
      equation: 'v_x = 0.6x,  v_y = -0.6y,  v_z = -0.3z',
      desc: 'Represents an unstable equilibrium point where flow converges along y and z axes while diverging away along the x axis.'
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
      {/* R3F 3D Canvas with Scientific Light Background */}
      <Canvas
        camera={{ position: [12, 10, 14], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="w-full h-full bg-slate-50"
      >
        <color attach="background" args={['#f8fafc']} />

        <ambientLight intensity={0.8} />

        {/* Spatial Axis Helper at Center (Origin) */}
        <axesHelper args={[8]} />

        {/* Spatial Engineering Grid at Bottom of Bounding Box (Y = -6) */}
        <Grid
          position={[0, -6, 0]}
          args={[12, 12]}
          cellSize={1}
          cellThickness={1}
          cellColor="#cbd5e1"
          sectionSize={3}
          sectionThickness={1.5}
          sectionColor="#64748b"
          fadeDistance={30}
          infiniteGrid={false}
        />

        <VectorFieldParticles
          mode={mode}
          particleCount={particleCount}
          flowSpeed={flowSpeed}
          tailLength={tailLength}
          colorPaletteKey={colorPaletteKey}
          isPaused={isPaused}
          onFpsUpdate={setFps}
        />

        <BoundingCube showBox={showBoundingBox} />
        <DipoleMarkers mode={mode} />

        {/* Camera OrbitControls */}
        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
          maxDistance={35}
          minDistance={3}
        />
      </Canvas>

      {/* Tailwind UI Overlay Container (pointer-events-none lets OrbitControls receive clicks) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10">

        {/* Top Bar: Title & Stats HUD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="pointer-events-auto glass-panel px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/30 text-sky-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-wide text-slate-900 flex items-center gap-2">
                3D Vector Field Visualizer
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider bg-sky-500/15 text-sky-700 px-2 py-0.5 rounded-full border border-sky-500/30">
                  Eulerian Flow
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {particleCount.toLocaleString()} Streamlines • {fps} FPS
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="pointer-events-auto glass-panel p-1.5 rounded-2xl flex items-center gap-1 shadow-xl">
            {[
              { id: 'tornado', name: 'Tornado', icon: Compass },
              { id: 'dipole', name: 'Dipole', icon: Activity },
              { id: 'saddle', name: 'Saddle Point', icon: Layers },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = mode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'glass-button-active font-semibold shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : ''}`} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Control Drawer & Equation Info */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">

          {/* Left Panel: Equation HUD & Info Toggle */}
          <div className="pointer-events-auto glass-panel p-4 rounded-2xl max-w-sm w-full shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Info className="w-4 h-4 text-sky-600" />
                <span>Field Dynamics</span>
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-[11px] font-mono text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                {showInfo ? 'Hide Math' : 'Show Math'}
                <ChevronRight className={`w-3 h-3 transition-transform ${showInfo ? 'rotate-90' : ''}`} />
              </button>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900">
                {modeDescriptions[mode].title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {modeDescriptions[mode].type}
              </div>
            </div>

            {showInfo && (
              <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs animate-fadeIn">
                <div className="bg-slate-100/90 p-2.5 rounded-xl font-mono text-[11px] text-sky-800 border border-slate-200 overflow-x-auto">
                  {modeDescriptions[mode].equation}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {modeDescriptions[mode].desc}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Sliders & Toggles */}
          <div className="pointer-events-auto glass-panel p-4 md:p-5 rounded-2xl max-w-md w-full shadow-xl space-y-4">

            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Sliders className="w-4 h-4 text-sky-600" />
                <span>Simulation Parameters</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
                  title={isPaused ? "Play Simulation" : "Pause Simulation"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setFlowSpeed(1.0);
                    setTailLength(1.0);
                    setParticleCount(7500);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
                  title="Reset Parameters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slider Controls Grid */}
            <div className="space-y-3 text-xs">

              {/* Particle Count Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Particle Count</span>
                  <span className="font-mono text-sky-600">{particleCount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="10000"
                  step="500"
                  value={particleCount}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                  className="w-full accent-sky-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Flow Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Flow Speed</span>
                  <span className="font-mono text-sky-600">{flowSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={flowSpeed}
                  onChange={(e) => setFlowSpeed(Number(e.target.value))}
                  className="w-full accent-sky-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Tail Length Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Tail Scale</span>
                  <span className="font-mono text-sky-600">{tailLength.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.1"
                  value={tailLength}
                  onChange={(e) => setTailLength(Number(e.target.value))}
                  className="w-full accent-sky-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

            </div>

            {/* Palette & Toggle Controls */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">

              {/* Color Palette Selector */}
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-500">Palette:</span>
                {Object.keys(COLOR_PALETTES).map((key) => (
                  <button
                    key={key}
                    onClick={() => setColorPaletteKey(key)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                      colorPaletteKey === key
                        ? 'bg-sky-500/20 text-sky-700 border border-sky-500/40 font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {COLOR_PALETTES[key].name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBoundingBox(!showBoundingBox)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                    showBoundingBox
                      ? 'bg-sky-500/15 text-sky-700 border border-sky-500/40'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Box
                </button>
                
                {/* Functional & Prominent Auto-Rotate Toggle Button */}
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    autoRotate
                      ? 'bg-sky-500/15 text-sky-700 border border-sky-500/40 font-semibold shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  <span>Auto-Rotate: {autoRotate ? 'ON' : 'OFF'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
