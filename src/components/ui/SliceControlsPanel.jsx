import React from 'react';
import {
  Layers,
  RotateCcw,
  Grid,
  X
} from 'lucide-react';
import styles from './SliceControlsPanel.module.css';

/**
 * Control Panel Component for 2D Slice Analysis
 */
export default function SliceControlsPanel({
  isSliceActive,
  setIsSliceActive,
  slicePreset,
  setSlicePreset,
  sliceOffset,
  setSliceOffset,
  slicePitch,
  setSlicePitch,
  sliceYaw,
  setSliceYaw,
  sliceThickness,
  setSliceThickness,
  slicePhantomOpacity,
  setSlicePhantomOpacity,
  showSliceGrid,
  setShowSliceGrid,
  sliceGridDensity,
  setSliceGridDensity,
  onClose
}) {
  return (
    <div className={styles.panelContainer}>
      {/* Panel Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <Layers size={16} color="var(--accent-color)" />
          <span>2D Slice Analytics</span>
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={() => {
              setSliceOffset(0.0);
              setSlicePitch(0);
              setSliceYaw(0);
              setSliceThickness(0.4);
              setSlicePhantomOpacity(0.05);
            }}
            className={styles.closeButton}
            title="Reset Slice Parameters"
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

      {/* Main Slice Mode Action Toggle Button */}
      <button
        onClick={() => setIsSliceActive(!isSliceActive)}
        className={`${styles.mainAnalyzeButton} ${isSliceActive ? styles.mainAnalyzeButtonActive : ''}`}
      >
        <Layers size={18} />
        <span>{isSliceActive ? "Analyzing 2D Slice (Frozen)" : "Activate 2D Slice Analysis"}</span>
        {isSliceActive && <span className={styles.activeBadge}>FREEZE ON</span>}
      </button>

      {/* Plane Presets */}
      <div className={styles.presetsSection}>
        <span className={styles.sectionLabel}>Slicing Plane Orientation:</span>
        <div className={styles.presetsGrid}>
          {['xy', 'xz', 'yz', 'custom'].map((preset) => (
            <button
              key={preset}
              onClick={() => setSlicePreset(preset)}
              className={`${styles.presetButton} ${slicePreset === preset ? styles.presetButtonActive : ''}`}
            >
              {preset.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Slider Controls */}
      <div className={styles.slidersGrid}>
        {/* Plane Offset Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabelRow}>
            <span>Plane Offset (D)</span>
            <span className={styles.sliderValue}>{sliceOffset > 0 ? `+${sliceOffset.toFixed(1)}` : sliceOffset.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-5.5"
            max="5.5"
            step="0.1"
            value={sliceOffset}
            onChange={(e) => setSliceOffset(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        {/* Pitch & Yaw Sliders (Shown when Custom orientation selected) */}
        {slicePreset === 'custom' && (
          <>
            <div className={styles.sliderRow}>
              <div className={styles.sliderLabelRow}>
                <span>Pitch Angle (Elevation)</span>
                <span className={styles.sliderValue}>{slicePitch}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={slicePitch}
                onChange={(e) => setSlicePitch(Number(e.target.value))}
                className={styles.sliderInput}
              />
            </div>

            <div className={styles.sliderRow}>
              <div className={styles.sliderLabelRow}>
                <span>Yaw Angle (Azimuth)</span>
                <span className={styles.sliderValue}>{sliceYaw}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={sliceYaw}
                onChange={(e) => setSliceYaw(Number(e.target.value))}
                className={styles.sliderInput}
              />
            </div>
          </>
        )}

        {/* Slice Thickness Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabelRow}>
            <span>Interaction Thickness (δ)</span>
            <span className={styles.sliderValue}>{sliceThickness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            value={sliceThickness}
            onChange={(e) => setSliceThickness(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        {/* Outside Phantom Opacity Slider */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabelRow}>
            <span>Background Phantom Opacity</span>
            <span className={styles.sliderValue}>{Math.round(slicePhantomOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.25"
            step="0.01"
            value={slicePhantomOpacity}
            onChange={(e) => setSlicePhantomOpacity(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        {/* Plane Vector Grid Density Slider */}
        {showSliceGrid && (
          <div className={styles.sliderRow}>
            <div className={styles.sliderLabelRow}>
              <span>Plane Vector Grid Density</span>
              <span className={styles.sliderValue}>{sliceGridDensity}x{sliceGridDensity}</span>
            </div>
            <input
              type="range"
              min="8"
              max="20"
              step="2"
              value={sliceGridDensity}
              onChange={(e) => setSliceGridDensity(Number(e.target.value))}
              className={styles.sliderInput}
            />
          </div>
        )}
      </div>

      {/* Footer Toggles */}
      <div className={styles.footerRow}>
        <div className={styles.togglesGroup}>
          <button
            onClick={() => setShowSliceGrid(!showSliceGrid)}
            className={`${styles.toggleButton} ${showSliceGrid ? styles.toggleButtonActive : ''}`}
          >
            <Grid size={13} />
            <span>2D Vector Grid: {showSliceGrid ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
