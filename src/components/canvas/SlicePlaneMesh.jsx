import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  evaluateVectorField,
  calculatePlaneNormal,
  calculatePlaneBasis
} from '../../utils/fieldEquations';
import {
  BOX_SIZE,
  HALF_BOX,
  COLOR_PALETTES_LIGHT,
  COLOR_PALETTES_DARK
} from '../../constants/fieldConstants';

/**
 * 3D Slice Plane Mesh with Translucent Quad, Border Outline, Subgrid, and 2D Vector Grid Arrows Overlay
 */
export default function SlicePlaneMesh({
  mode,
  isSliceActive,
  slicePreset,
  sliceOffset,
  slicePitch,
  sliceYaw,
  showSliceGrid = true,
  sliceGridDensity = 12,
  colorPaletteKey = 'viridis',
  isDarkMode = false
}) {
  if (!isSliceActive) return null;

  const activePalettes = isDarkMode ? COLOR_PALETTES_DARK : COLOR_PALETTES_LIGHT;
  const palette = activePalettes[colorPaletteKey] || activePalettes.viridis;

  // Compute plane normal vector
  const normal = useMemo(() => {
    return calculatePlaneNormal(slicePreset, slicePitch, sliceYaw);
  }, [slicePreset, slicePitch, sliceYaw]);

  // Compute plane basis and orientation quaternion
  const { uBasis, vBasis, quaternion } = useMemo(() => {
    return calculatePlaneBasis(normal);
  }, [normal]);

  // World position of plane center
  const planePosition = useMemo(() => {
    return normal.clone().multiplyScalar(sliceOffset);
  }, [normal, sliceOffset]);

  // Inverse quaternion to map world velocity vectors into local plane space
  const invQuaternion = useMemo(() => {
    return quaternion.clone().invert();
  }, [quaternion]);

  // Generate 2D analytical vector field arrows grid in local plane coordinates (u, v, 0)
  const { linePositions, lineColors } = useMemo(() => {
    if (!showSliceGrid) {
      return { linePositions: new Float32Array(0), lineColors: new Float32Array(0) };
    }

    const density = Math.min(Math.max(sliceGridDensity, 6), 24);
    const span = BOX_SIZE * 0.92;
    const step = span / (density - 1);
    const halfSpan = span / 2;

    const positionsArr = [];
    const colorsArr = [];

    const cSlow = palette.slow;
    const cMid = palette.mid;
    const cFast = palette.fast;

    for (let i = 0; i < density; i++) {
      const u = -halfSpan + i * step;
      for (let j = 0; j < density; j++) {
        const v = -halfSpan + j * step;

        // Calculate world coordinates for field evaluation
        const wx = planePosition.x + u * uBasis.x + v * vBasis.x;
        const wy = planePosition.y + u * uBasis.y + v * vBasis.y;
        const wz = planePosition.z + u * uBasis.z + v * vBasis.z;

        // Exclude arrows outside bounding box
        if (Math.abs(wx) > HALF_BOX || Math.abs(wy) > HALF_BOX || Math.abs(wz) > HALF_BOX) {
          continue;
        }

        // Evaluate analytical 3D field at world position
        const { vx, vy, vz, speed } = evaluateVectorField(mode, wx, wy, wz);

        if (speed < 0.001) continue;

        // Transform 3D world velocity into plane local coordinate system
        const worldVec = new THREE.Vector3(vx, vy, vz);
        const localVec = worldVec.clone().applyQuaternion(invQuaternion);

        const normSpeed = Math.min(speed / 4.5, 1.0);

        // Normalized local direction
        const localSpeed = localVec.length();
        if (localSpeed < 0.0001) continue;

        const dirU = localVec.x / localSpeed;
        const dirV = localVec.y / localSpeed;
        const dirN = localVec.z / localSpeed; // Out-of-plane component

        // Scale arrow length based on magnitude
        const arrowLength = Math.min(0.55, 0.2 + normSpeed * 0.35);

        const endU = u + dirU * arrowLength;
        const endV = v + dirV * arrowLength;
        const endN = dirN * arrowLength * 0.5; // Slight Z displacement for 3D vector orientation

        // Speed magnitude color interpolation
        let r = 0, g = 0, b = 0;
        if (normSpeed < 0.5) {
          const t = normSpeed * 2.0;
          r = THREE.MathUtils.lerp(cSlow.r, cMid.r, t);
          g = THREE.MathUtils.lerp(cSlow.g, cMid.g, t);
          b = THREE.MathUtils.lerp(cSlow.b, cMid.b, t);
        } else {
          const t = (normSpeed - 0.5) * 2.0;
          r = THREE.MathUtils.lerp(cMid.r, cFast.r, t);
          g = THREE.MathUtils.lerp(cMid.g, cFast.g, t);
          b = THREE.MathUtils.lerp(cMid.b, cFast.b, t);
        }

        // Main Arrow Shaft Line (Local Base (u,v,0) -> Tip (endU, endV, endN))
        positionsArr.push(u, v, 0.01, endU, endV, endN + 0.01);
        colorsArr.push(r, g, b, 0.85, r, g, b, 1.0);

        // Arrowhead Barb Lines
        const headScale = arrowLength * 0.3;
        const perpU = -dirV * headScale * 0.5;
        const perpV = dirU * headScale * 0.5;

        const barb1U = endU - dirU * headScale + perpU;
        const barb1V = endV - dirV * headScale + perpV;

        const barb2U = endU - dirU * headScale - perpU;
        const barb2V = endV - dirV * headScale - perpV;

        positionsArr.push(endU, endV, endN + 0.01, barb1U, barb1V, endN + 0.01);
        colorsArr.push(r, g, b, 1.0, r, g, b, 0.85);

        positionsArr.push(endU, endV, endN + 0.01, barb2U, barb2V, endN + 0.01);
        colorsArr.push(r, g, b, 1.0, r, g, b, 0.85);
      }
    }

    return {
      linePositions: new Float32Array(positionsArr),
      lineColors: new Float32Array(colorsArr)
    };
  }, [mode, planePosition, uBasis, vBasis, invQuaternion, showSliceGrid, sliceGridDensity, palette]);

  // Plane border outline geometry
  const planeBorderGeo = useMemo(() => {
    const s = BOX_SIZE;
    const points = [
      new THREE.Vector3(-s / 2, -s / 2, 0),
      new THREE.Vector3(s / 2, -s / 2, 0),
      new THREE.Vector3(s / 2, s / 2, 0),
      new THREE.Vector3(-s / 2, s / 2, 0),
      new THREE.Vector3(-s / 2, -s / 2, 0)
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group position={planePosition} quaternion={quaternion}>
      {/* Translucent Glass Slicing Quad */}
      <mesh>
        <planeGeometry args={[BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial
          color={isDarkMode ? "#0284c7" : "#0ea5e9"}
          transparent
          opacity={isDarkMode ? 0.22 : 0.16}
          side={THREE.DoubleSide}
          roughness={0.2}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Border Highlight Line */}
      <lineLoop geometry={planeBorderGeo}>
        <lineBasicMaterial
          color={isDarkMode ? "#38bdf8" : "#0284c7"}
          linewidth={2}
        />
      </lineLoop>

      {/* Subtle Inner Grid Lines for Visual Surface Alignment */}
      <gridHelper
        args={[BOX_SIZE, 12, isDarkMode ? "#38bdf8" : "#0284c7", isDarkMode ? "#334155" : "#cbd5e1"]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* 2D Vector Grid Arrows (Rendered in local plane space) */}
      {showSliceGrid && linePositions.length > 0 && (
        <lineSegments key={`${mode}-${sliceGridDensity}-${linePositions.length}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[lineColors, 4]}
            />
          </bufferGeometry>
          <lineBasicMaterial vertexColors transparent depthWrite={false} linewidth={1.5} />
        </lineSegments>
      )}
    </group>
  );
}
