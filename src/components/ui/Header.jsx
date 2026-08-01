import React from 'react';
import {
  Sparkles,
  Compass,
  Activity,
  Layers,
  Wind,
  Disc,
  CircleDot,
  Crosshair,
  Sun,
  Moon
} from 'lucide-react';
import styles from './Header.module.css';

/**
 * Top Header Navigation & Vector Field Preset Switcher Component
 */
export default function Header({
  mode,
  setMode,
  particleCount,
  fps,
  isDarkMode,
  setIsDarkMode
}) {
  const modeItems = [
    { id: 'tornado', name: 'Tornado', icon: Compass },
    { id: 'dipole', name: 'Dipole', icon: Activity },
    { id: 'saddle', name: 'Saddle', icon: Layers },
    { id: 'abc', name: 'ABC Chaos', icon: Wind },
    { id: 'spiral_sink', name: 'Spiral Sink', icon: Disc },
    { id: 'toroidal', name: 'Toroidal Ring', icon: CircleDot },
    { id: 'quadrupole', name: 'Quadrupole', icon: Crosshair },
  ];

  return (
    <div className={styles.headerContainer}>
      {/* Title & Telemetry Badge */}
      <div className={styles.brandBadge}>
        <div className={styles.brandIcon}>
          <Sparkles size={18} />
        </div>
        <div className={styles.brandContent}>
          <h1 className={styles.titleText}>
            <span className={styles.titleFull}>3D Vector Field Visualizer</span>
            <span className={styles.titleCompact}>Vector Field 3D</span>
            <span className={styles.tagBadge}>Eulerian Flow</span>
          </h1>
          <p className={styles.subtitleText}>
            {particleCount.toLocaleString()} Streamlines • {fps} FPS
          </p>
        </div>
      </div>

      {/* Controls Group */}
      <div className={styles.controlsGroup}>
        {/* Mode Switcher Scrollable Bar */}
        <div className={styles.modeSwitcher}>
          {modeItems.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`${styles.modeButton} ${isActive ? styles.modeButtonActive : ''}`}
                title={item.name}
              >
                <Icon size={14} color={isActive ? 'var(--accent-color)' : undefined} />
                <span className={styles.modeName}>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={styles.themeButton}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun size={16} color="#fbbf24" />
          ) : (
            <Moon size={16} color="#475569" />
          )}
          <span className={styles.themeLabel}>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </div>
  );
}
