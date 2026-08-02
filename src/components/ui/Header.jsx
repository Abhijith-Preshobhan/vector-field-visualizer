import React, { useState, useRef, useEffect } from 'react';
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
  Moon,
  ChevronDown,
  Check
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const modeItems = [
    { id: 'tornado', name: 'Tornado', type: 'Vortex', icon: Compass },
    { id: 'dipole', name: 'Dipole', type: 'Source & Sink', icon: Activity },
    { id: 'saddle', name: 'Saddle', type: 'Hyperbolic', icon: Layers },
    { id: 'abc', name: 'ABC Chaos', type: 'Beltrami Flow', icon: Wind },
    { id: 'spiral_sink', name: 'Spiral Sink', type: 'Accretion Vortex', icon: Disc },
    { id: 'toroidal', name: 'Toroidal Ring', type: 'Poloidal Ring', icon: CircleDot },
    { id: 'quadrupole', name: 'Quadrupole', type: '4-Pole Lens', icon: Crosshair },
  ];

  const activeModeItem = modeItems.find(item => item.id === mode) || modeItems[0];
  const ActiveIcon = activeModeItem.icon;

  // Handle click outside & escape key to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        {/* Responsive Custom Vector Field Dropdown Selector */}
        <div className={styles.selectorWrapper} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`${styles.selectorTrigger} ${isOpen ? styles.selectorTriggerOpen : ''}`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            title="Select Vector Field Preset"
          >
            <div className={styles.triggerActiveInfo}>
              <ActiveIcon size={16} className={styles.activeIcon} />
              <span className={styles.triggerLabel}>{activeModeItem.name}</span>
            </div>
            <ChevronDown
              size={14}
              className={`${styles.chevronIcon} ${isOpen ? styles.chevronRotated : ''}`}
            />
          </button>

          {/* Floating Dropdown Popover Menu */}
          {isOpen && (
            <div className={styles.dropdownMenu} role="listbox">
              <div className={styles.dropdownHeader}>Select Vector Field</div>
              {modeItems.map((item) => {
                const Icon = item.icon;
                const isActive = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setMode(item.id);
                      setIsOpen(false);
                    }}
                    className={`${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`}
                  >
                    <div className={styles.itemLeft}>
                      <div className={`${styles.itemIconContainer} ${isActive ? styles.itemIconActive : ''}`}>
                        <Icon size={15} />
                      </div>
                      <div className={styles.itemTextGroup}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemType}>{item.type}</span>
                      </div>
                    </div>
                    {isActive && <Check size={14} className={styles.checkIcon} />}
                  </button>
                );
              })}
            </div>
          )}
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
