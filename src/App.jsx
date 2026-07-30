import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

import VectorFieldParticles from './components/canvas/VectorFieldParticles';
import BoundingCube from './components/canvas/BoundingCube';
import DipoleMarkers from './components/canvas/DipoleMarkers';

import Header from './components/ui/Header';
import FieldDynamicsPanel from './components/ui/FieldDynamicsPanel';
import SimulationControlsPanel from './components/ui/SimulationControlsPanel';

import styles from './styles/App.module.css';

/**
 * Main Application Composition Root
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fps, setFps] = useState(60);

  return (
    <div className={`${styles.appContainer} ${isDarkMode ? 'dark' : ''}`}>
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [12, 10, 14], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className={styles.canvasWrapper}
      >
        <color attach="background" args={[isDarkMode ? '#090d16' : '#f8fafc']} />

        <ambientLight intensity={isDarkMode ? 0.6 : 0.8} />

        {/* Spatial Axis Helper at Center (Origin) */}
        <axesHelper args={[8]} />

        {/* Spatial Engineering Grid at Bottom of Bounding Box (Y = -6) */}
        <Grid
          position={[0, -6, 0]}
          args={[12, 12]}
          cellSize={1}
          cellThickness={1}
          cellColor={isDarkMode ? '#1e293b' : '#cbd5e1'}
          sectionSize={3}
          sectionThickness={1.5}
          sectionColor={isDarkMode ? '#475569' : '#64748b'}
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
          isDarkMode={isDarkMode}
          onFpsUpdate={setFps}
        />

        <BoundingCube showBox={showBoundingBox} isDarkMode={isDarkMode} />
        <DipoleMarkers mode={mode} isDarkMode={isDarkMode} />

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

      {/* UI Overlay Container */}
      <div className={styles.uiOverlay}>
        <Header
          mode={mode}
          setMode={setMode}
          particleCount={particleCount}
          fps={fps}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        <div className={styles.bottomPanels}>
          <FieldDynamicsPanel mode={mode} />
          <SimulationControlsPanel
            particleCount={particleCount}
            setParticleCount={setParticleCount}
            flowSpeed={flowSpeed}
            setFlowSpeed={setFlowSpeed}
            tailLength={tailLength}
            setTailLength={setTailLength}
            colorPaletteKey={colorPaletteKey}
            setColorPaletteKey={setColorPaletteKey}
            showBoundingBox={showBoundingBox}
            setShowBoundingBox={setShowBoundingBox}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}
