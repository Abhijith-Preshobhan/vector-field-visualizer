import React from 'react';
import { BOX_SIZE } from '../../constants/fieldConstants';

/**
 * Bounding Cube Wireframe and Corner Spheres
 */
export default function BoundingCube({ showBox, isDarkMode }) {
  if (!showBox) return null;
  const wireframeColor = isDarkMode ? "#475569" : "#64748b";
  const cornerColor = isDarkMode ? "#94a3b8" : "#475569";
  const half = BOX_SIZE / 2;

  const cornerPositions = [
    [-half, -half, -half], [half, -half, -half], [-half, half, -half], [half, half, -half],
    [-half, -half, half], [half, -half, half], [-half, half, half], [half, half, half]
  ];

  return (
    <group>
      <mesh>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshBasicMaterial color={wireframeColor} wireframe transparent opacity={0.2} />
      </mesh>
      {cornerPositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={cornerColor} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}
