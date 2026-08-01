import React, { useState } from 'react';
import { Info, ChevronRight, X, BookOpen, Sigma } from 'lucide-react';
import { MODE_DESCRIPTIONS } from '../../constants/fieldConstants';
import MathFormula from './MathFormula';
import styles from './FieldDynamicsPanel.module.css';

/**
 * Bottom-left Mathematical Field Dynamics & Calculus Information Panel
 */
export default function FieldDynamicsPanel({ mode, onClose }) {
  const [showMath, setShowMath] = useState(true);
  const [showOperators, setShowOperators] = useState(false);

  const currentInfo = MODE_DESCRIPTIONS[mode] || MODE_DESCRIPTIONS.tornado;

  return (
    <div className={styles.panelContainer}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <Sigma size={16} color="var(--accent-color)" />
          <span>Field Calculus & Dynamics</span>
        </div>
        <div className={styles.headerControls}>
          <button
            onClick={() => setShowMath(!showMath)}
            className={styles.toggleButton}
            title={showMath ? "Collapse Math View" : "Expand Math View"}
          >
            {showMath ? 'Hide Math' : 'Show Math'}
            <ChevronRight
              size={12}
              className={`${styles.chevronIcon} ${showMath ? styles.chevronRotated : ''}`}
            />
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

      {/* Mode Title & Category */}
      <div>
        <div className={styles.modeTitle}>{currentInfo.title}</div>
        <div className={styles.modeType}>{currentInfo.type}</div>
      </div>

      {/* Main LaTeX Equation Section */}
      {showMath && (
        <div className={styles.mathSection}>
          {/* Vector Velocity Field Formula */}
          <div className={styles.formulaWrapper}>
            <div className={styles.formulaHeader}>
              <span className={styles.formulaLabel}>Velocity Field Equation</span>
            </div>
            <div className={styles.equationBox}>
              <MathFormula math={currentInfo.equation} display={true} />
            </div>
          </div>

          {/* Divergence & Curl Badges */}
          <div className={styles.operatorsRow}>
            <div className={styles.operatorBadge} title="Divergence (Flux Rate)">
              <span className={styles.badgeLabel}>Divergence</span>
              <MathFormula math={currentInfo.divergence} display={false} />
            </div>
            <div className={styles.operatorBadge} title="Curl (Vorticity Vector)">
              <span className={styles.badgeLabel}>Curl</span>
              <MathFormula math={currentInfo.curl} display={false} />
            </div>
          </div>

          {/* Description */}
          <p className={styles.descriptionText}>
            {currentInfo.desc}
          </p>

          {/* Collapsible Reference for Differential Operators */}
          <div className={styles.referenceContainer}>
            <button
              onClick={() => setShowOperators(!showOperators)}
              className={styles.referenceToggle}
            >
              <BookOpen size={13} />
              <span>Calculus Operator Definitions</span>
              <ChevronRight
                size={12}
                className={`${styles.chevronIcon} ${showOperators ? styles.chevronRotated : ''}`}
              />
            </button>

            {showOperators && (
              <div className={styles.operatorsDetailBox}>
                <div className={styles.operatorDetailItem}>
                  <span className={styles.operatorDetailName}>Vector Field:</span>
                  <MathFormula math="\vec{V}(x,y,z) = v_x \hat{i} + v_y \hat{j} + v_z \hat{k}" display={true} />
                </div>

                <div className={styles.operatorDetailItem}>
                  <span className={styles.operatorDetailName}>Divergence (Flux Expansion):</span>
                  <MathFormula math="\nabla \cdot \vec{V} = \frac{\partial v_x}{\partial x} + \frac{\partial v_y}{\partial y} + \frac{\partial v_z}{\partial z}" display={true} />
                </div>

                <div className={styles.operatorDetailItem}>
                  <span className={styles.operatorDetailName}>Curl (Vorticity Axis):</span>
                  <MathFormula math="\nabla \times \vec{V} = \begin{vmatrix} \hat{i} & \hat{j} & \hat{k} \\[2pt] \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\[4pt] v_x & v_y & v_z \end{vmatrix}" display={true} />
                </div>

                <div className={styles.operatorDetailItem}>
                  <span className={styles.operatorDetailName}>Euler Integration Step:</span>
                  <MathFormula math="\vec{r}_{t+\Delta t} = \vec{r}_t + \vec{V}(\vec{r}_t) \Delta t" display={true} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
