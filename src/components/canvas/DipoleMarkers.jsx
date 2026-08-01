import React from 'react';

/**
 * Visual Field Node Markers (Dipole Charges, Sink Core, Toroidal Ring Core)
 */
export default function DipoleMarkers({ mode, isDarkMode }) {
  if (mode === 'dipole') {
    return (
      <group>
        {/* Source (+ Charge / Outflow) at (2.5, 0, 0) */}
        <mesh position={[2.5, 0, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial color={isDarkMode ? "#ef4444" : "#dc2626"} transparent opacity={0.85} />
        </mesh>
        {/* Sink (- Charge / Inflow) at (-2.5, 0, 0) */}
        <mesh position={[-2.5, 0, 0]}>
          <sphereGeometry args={[-0.35, 32, 32]} />
          <meshBasicMaterial color={isDarkMode ? "#3b82f6" : "#2563eb"} transparent opacity={0.85} />
        </mesh>
      </group>
    );
  }

  if (mode === 'spiral_sink') {
    return (
      <group>
        {/* Central Accretion Sink Node at Origin (0,0,0) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshBasicMaterial color={isDarkMode ? "#a855f7" : "#7e22ce"} transparent opacity={0.8} />
        </mesh>
      </group>
    );
  }

  if (mode === 'toroidal') {
    return (
      <group>
        {/* Toroidal Vortex Core Ring at R0 = 3.0 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.0, 0.04, 16, 64]} />
          <meshBasicMaterial color={isDarkMode ? "#38bdf8" : "#0284c7"} transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }

  return null;
}
