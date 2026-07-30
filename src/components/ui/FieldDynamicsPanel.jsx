import React, { useState } from 'react';
import { Info, ChevronRight } from 'lucide-react';
import { MODE_DESCRIPTIONS } from '../../constants/fieldConstants';
import styles from './FieldDynamicsPanel.module.css';

/**
 * Bottom-left Mathematical Field Dynamics Information Panel
 */
export default function FieldDynamicsPanel({ mode }) {
  const [showInfo, setShowInfo] = useState(false);
  const currentInfo = MODE_DESCRIPTIONS[mode] || MODE_DESCRIPTIONS.tornado;

  return (
    <div className={styles.panelContainer}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <Info size={16} color="var(--accent-color)" />
          <span>Field Dynamics</span>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={styles.toggleButton}
        >
          {showInfo ? 'Hide Math' : 'Show Math'}
          <ChevronRight
            size={12}
            className={`${styles.chevronIcon} ${showInfo ? styles.chevronRotated : ''}`}
          />
        </button>
      </div>

      <div>
        <div className={styles.modeTitle}>{currentInfo.title}</div>
        <div className={styles.modeType}>{currentInfo.type}</div>
      </div>

      {showInfo && (
        <div className={styles.mathSection}>
          <div className={styles.equationBox}>
            {currentInfo.equation}
          </div>
          <p className={styles.descriptionText}>
            {currentInfo.desc}
          </p>
        </div>
      )}
    </div>
  );
}
