import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Play, Pause, Info, Sliders, Layers } from 'lucide-react';

import VectorFieldParticles from './components/canvas/VectorFieldParticles';
import SlicePlaneMesh from './components/canvas/SlicePlaneMesh';
import BoundingCube from './components/canvas/BoundingCube';
import DipoleMarkers from './components/canvas/DipoleMarkers';

import Header from './components/ui/Header';
import FieldDynamicsPanel from './components/ui/FieldDynamicsPanel';
import SimulationControlsPanel from './components/ui/SimulationControlsPanel';
import SliceControlsPanel from './components/ui/SliceControlsPanel';

import styles from './styles/App.module.css';

/**
 * Main Application Composition Root
 */
export default function App() {
  const [mode, setMode] = useState('tornado'); // 'tornado' | 'dipole' | 'saddle' | 'abc' | 'spiral_sink' | 'toroidal' | 'quadrupole'
  const [particleCount, setParticleCount] = useState(7500);
  const [flowSpeed, setFlowSpeed] = useState(1.0);
  const [tailLength, setTailLength] = useState(1.0);
  const [colorPaletteKey, setColorPaletteKey] = useState('viridis');
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fps, setFps] = useState(60);

  // 2D Slice Analytics State
  const [isSliceActive, setIsSliceActive] = useState(false);
  const [slicePreset, setSlicePreset] = useState('xy'); // 'xy' | 'xz' | 'yz' | 'custom'
  const [sliceOffset, setSliceOffset] = useState(0.0);
  const [slicePitch, setSlicePitch] = useState(0);
  const [sliceYaw, setSliceYaw] = useState(0);
  const [sliceThickness, setSliceThickness] = useState(0.4);
  const [slicePhantomOpacity, setSlicePhantomOpacity] = useState(0.05);
  const [showSliceGrid, setShowSliceGrid] = useState(true);
  const [sliceGridDensity, setSliceGridDensity] = useState(12);

  // Desktop active right tab: 'controls' | 'slice'
  const [desktopTab, setDesktopTab] = useState('controls');

  // Mobile menu sheet active state: 'none' | 'dynamics' | 'controls' | 'slice'
  const [activeMobileTab, setActiveMobileTab] = useState('none');

  const toggleMobileTab = (tab) => {
    setActiveMobileTab((prev) => (prev === tab ? 'none' : tab));
  };

  const handleToggleSliceActive = (activeState) => {
    setIsSliceActive(activeState);
    if (activeState) {
      setDesktopTab('slice');
    }
  };

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

        {/* Dynamic Vector Field Particle Streamlines */}
        <VectorFieldParticles
          mode={mode}
          particleCount={particleCount}
          flowSpeed={flowSpeed}
          tailLength={tailLength}
          colorPaletteKey={colorPaletteKey}
          isPaused={isPaused}
          isDarkMode={isDarkMode}
          onFpsUpdate={setFps}
          isSliceActive={isSliceActive}
          slicePreset={slicePreset}
          sliceOffset={sliceOffset}
          slicePitch={slicePitch}
          sliceYaw={sliceYaw}
          sliceThickness={sliceThickness}
          slicePhantomOpacity={slicePhantomOpacity}
        />

        {/* 2D Slicing Plane & Vector Grid Overlay */}
        <SlicePlaneMesh
          mode={mode}
          isSliceActive={isSliceActive}
          slicePreset={slicePreset}
          sliceOffset={sliceOffset}
          slicePitch={slicePitch}
          sliceYaw={sliceYaw}
          showSliceGrid={showSliceGrid}
          sliceGridDensity={sliceGridDensity}
          colorPaletteKey={colorPaletteKey}
          isDarkMode={isDarkMode}
        />

        {/* Spatial Bounding Box & Source/Sink Markers */}
        <BoundingCube showBox={showBoundingBox} isDarkMode={isDarkMode} />
        <DipoleMarkers mode={mode} isDarkMode={isDarkMode} />

        {/* Camera OrbitControls */}
        <OrbitControls
          makeDefault
          autoRotate={autoRotate && !isSliceActive}
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

        {/* Desktop Side-by-Side Floating Panels (≥768px) */}
        <div className={styles.desktopPanels}>
          <FieldDynamicsPanel mode={mode} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '28rem', pointerEvents: 'auto' }}>
            {/* Desktop Right Panel Selector Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              padding: '0.25rem',
              background: 'var(--panel-bg)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--panel-border)',
              borderRadius: '0.75rem',
              boxShadow: 'var(--panel-shadow)'
            }}>
              <button
                onClick={() => setDesktopTab('controls')}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  background: desktopTab === 'controls' ? 'var(--accent-bg)' : 'transparent',
                  color: desktopTab === 'controls' ? 'var(--accent-color)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sliders size={13} />
                <span>Simulation Controls</span>
              </button>
              <button
                onClick={() => setDesktopTab('slice')}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  background: desktopTab === 'slice' ? 'var(--accent-bg)' : 'transparent',
                  color: desktopTab === 'slice' ? 'var(--accent-color)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Layers size={13} />
                <span>2D Slice {isSliceActive ? '• ACTIVE' : ''}</span>
              </button>
            </div>

            {/* Active Panel View */}
            {desktopTab === 'controls' ? (
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
            ) : (
              <SliceControlsPanel
                isSliceActive={isSliceActive}
                setIsSliceActive={handleToggleSliceActive}
                slicePreset={slicePreset}
                setSlicePreset={setSlicePreset}
                sliceOffset={sliceOffset}
                setSliceOffset={setSliceOffset}
                slicePitch={slicePitch}
                setSlicePitch={setSlicePitch}
                sliceYaw={sliceYaw}
                setSliceYaw={setSliceYaw}
                sliceThickness={sliceThickness}
                setSliceThickness={setSliceThickness}
                slicePhantomOpacity={slicePhantomOpacity}
                setSlicePhantomOpacity={setSlicePhantomOpacity}
                showSliceGrid={showSliceGrid}
                setShowSliceGrid={setShowSliceGrid}
                sliceGridDensity={sliceGridDensity}
                setSliceGridDensity={setSliceGridDensity}
              />
            )}
          </div>
        </div>

        {/* Mobile Backdrop overlay to dismiss active sheet on tap outside */}
        {activeMobileTab !== 'none' && (
          <div
            className={styles.mobileBackdrop}
            onClick={() => setActiveMobileTab('none')}
          />
        )}

        {/* Mobile Slide-Up Drawer Sheet (<768px) */}
        {activeMobileTab === 'dynamics' && (
          <div className={styles.mobileDrawerSheet}>
            <FieldDynamicsPanel
              mode={mode}
              onClose={() => setActiveMobileTab('none')}
            />
          </div>
        )}

        {activeMobileTab === 'controls' && (
          <div className={styles.mobileDrawerSheet}>
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
              onClose={() => setActiveMobileTab('none')}
            />
          </div>
        )}

        {activeMobileTab === 'slice' && (
          <div className={styles.mobileDrawerSheet}>
            <SliceControlsPanel
              isSliceActive={isSliceActive}
              setIsSliceActive={handleToggleSliceActive}
              slicePreset={slicePreset}
              setSlicePreset={setSlicePreset}
              sliceOffset={sliceOffset}
              setSliceOffset={setSliceOffset}
              slicePitch={slicePitch}
              setSlicePitch={setSlicePitch}
              sliceYaw={sliceYaw}
              setSliceYaw={setSliceYaw}
              sliceThickness={sliceThickness}
              setSliceThickness={setSliceThickness}
              slicePhantomOpacity={slicePhantomOpacity}
              setSlicePhantomOpacity={setSlicePhantomOpacity}
              showSliceGrid={showSliceGrid}
              setShowSliceGrid={setShowSliceGrid}
              sliceGridDensity={sliceGridDensity}
              setSliceGridDensity={setSliceGridDensity}
              onClose={() => setActiveMobileTab('none')}
            />
          </div>
        )}

        {/* Mobile Floating Action Dock (<768px) */}
        <div className={styles.mobileDockBar}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={styles.mobileDockButton}
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            <span>{isPaused ? "Play" : "Pause"}</span>
          </button>

          <button
            onClick={() => toggleMobileTab('dynamics')}
            className={`${styles.mobileDockButton} ${activeMobileTab === 'dynamics' ? styles.mobileDockButtonActive : ''}`}
            title="Field Dynamics"
          >
            <Info size={18} />
            <span>Math</span>
          </button>

          <button
            onClick={() => toggleMobileTab('controls')}
            className={`${styles.mobileDockButton} ${activeMobileTab === 'controls' ? styles.mobileDockButtonActive : ''}`}
            title="Simulation Controls"
          >
            <Sliders size={18} />
            <span>Controls</span>
          </button>

          <button
            onClick={() => toggleMobileTab('slice')}
            className={`${styles.mobileDockButton} ${activeMobileTab === 'slice' || isSliceActive ? styles.mobileDockButtonActive : ''}`}
            title="2D Slice Analytics"
          >
            <Layers size={18} />
            <span>2D Slice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
