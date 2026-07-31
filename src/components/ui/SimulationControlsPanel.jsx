import React from 'react';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Palette,
  RotateCw,
  X
} from 'lucide-react';
import {
  COLOR_PALETTES_LIGHT,
  COLOR_PALETTES_DARK
} from '../../constants/fieldConstants';
import styles from './SimulationControlsPanel.module.css';

/**
 * Bottom-right Simulation Controls & Sliders Panel
 */
export default function SimulationControlsPanel({
  particleCount,
  setParticleCount,
  flowSpeed,
  setFlowSpeed,
  tailLength,
  setTailLength,
  colorPaletteKey,
  setColorPaletteKey,
  showBoundingBox,
  setShowBoundingBox,
  autoRotate,
  setAutoRotate,
  isPaused,
  setIsPaused,
  isDarkMode,
  onClose
}) {
  const activePalettes = isDarkMode ? COLOR_PALETTES_DARK : COLOR_PALETTES_LIGHT;

  return (
    <div className={styles.panelContainer}>
      {/* Panel Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <Sliders size={16} color="var(--accent-color)" />
          <span>Simulation Parameters</span>
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={styles.iconButton}
            title={isPaused ? "Play Simulation" : "Pause Simulation"}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={() => {
              setFlowSpeed(1.0);
              setTailLength(1.0);
              setParticleCount(7500);
            }}
            className={styles.iconButton}
            title="Reset Parameters"
          >
            <RotateCcw size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={styles.closeButton}
              title="Close Panel"
              aria-label="Close Panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Slider Controls Grid */}
      <div className={styles.slidersGrid}>
        {/* Particle Count Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabelRow}>
            <span>Particle Count</span>
            <span className={styles.sliderValue}>{particleCount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="2500"
            max="10000"
            step="500"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        {/* Flow Speed Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabelRow}>
            <span>Flow Speed</span>
            <span className={styles.sliderValue}>{flowSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={flowSpeed}
            onChange={(e) => setFlowSpeed(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        {/* Tail Length Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabelRow}>
            <span>Tail Scale</span>
            <span className={styles.sliderValue}>{tailLength.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={tailLength}
            onChange={(e) => setTailLength(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>
      </div>

      {/* Palette & Toggle Controls */}
      <div className={styles.footerRow}>
        {/* Color Palette Selector */}
        <div className={styles.paletteGroup}>
          <Palette size={14} color="var(--text-muted)" />
          <span className={styles.paletteLabel}>Palette:</span>
          {Object.keys(activePalettes).map((key) => (
            <button
              key={key}
              onClick={() => setColorPaletteKey(key)}
              className={`${styles.paletteButton} ${colorPaletteKey === key ? styles.paletteButtonActive : ''}`}
            >
              {activePalettes[key].name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className={styles.togglesGroup}>
          <button
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className={`${styles.toggleButton} ${showBoundingBox ? styles.toggleButtonActive : ''}`}
          >
            Box
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`${styles.toggleButton} ${autoRotate ? styles.toggleButtonActive : ''}`}
          >
            <RotateCw size={12} className={autoRotate ? styles.spinAnimation : ''} />
            <span>Auto-Rotate: {autoRotate ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

