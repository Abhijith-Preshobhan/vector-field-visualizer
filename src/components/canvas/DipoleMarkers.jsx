import React from 'react';

/**
 * Source & Sink Spheres for Dipole Vector Field
 */
export default function DipoleMarkers({ mode, isDarkMode }) {
  if (mode !== 'dipole') return null;
  return (
    <group>
      {/* Source (+ Charge / Outflow) at (2.5, 0, 0) */}
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={isDarkMode ? "#ef4444" : "#dc2626"} transparent opacity={0.85} />
      </mesh>
      {/* Sink (- Charge / Inflow) at (-2.5, 0, 0) */}
      <mesh position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={isDarkMode ? "#3b82f6" : "#2563eb"} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
