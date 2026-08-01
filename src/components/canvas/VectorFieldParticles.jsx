import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  BOX_SIZE,
  HALF_BOX,
  COLOR_PALETTES_LIGHT,
  COLOR_PALETTES_DARK
} from '../../constants/fieldConstants';
import { FieldShaderMaterial } from '../../shaders/fieldShaders';

/**
 * High-performance 3D Vector Field Particle Simulation Component
 * Supports 7 analytical 3D vector fields with Euler integration and magnitude color scaling.
 */
export default function VectorFieldParticles({
  mode,
  particleCount,
  flowSpeed,
  tailLength,
  colorPaletteKey,
  isPaused,
  isDarkMode,
  onFpsUpdate
}) {
  const geomRef = useRef();

  // Pick light or dark palettes dynamically
  const activePalettes = isDarkMode ? COLOR_PALETTES_DARK : COLOR_PALETTES_LIGHT;
  const palette = activePalettes[colorPaletteKey] || activePalettes.viridis;

  // Initialize raw Float32Arrays once or when particleCount changes
  const { positions, colors, particleMeta } = useMemo(() => {
    const posArr = new Float32Array(particleCount * 2 * 3);
    const colArr = new Float32Array(particleCount * 2 * 4); // RGBA for each vertex
    const metaArr = new Float32Array(particleCount * 4); // Meta: [x, y, z, lifespan]

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * BOX_SIZE;
      const py = (Math.random() - 0.5) * BOX_SIZE;
      const pz = (Math.random() - 0.5) * BOX_SIZE;
      const lifespan = Math.random();

      metaArr[i * 4 + 0] = px;
      metaArr[i * 4 + 1] = py;
      metaArr[i * 4 + 2] = pz;
      metaArr[i * 4 + 3] = lifespan;

      // Head position
      posArr[i * 6 + 0] = px;
      posArr[i * 6 + 1] = py;
      posArr[i * 6 + 2] = pz;

      // Tail position
      posArr[i * 6 + 3] = px - 0.1;
      posArr[i * 6 + 4] = py - 0.1;
      posArr[i * 6 + 5] = pz - 0.1;

      // Initial colors
      for (let v = 0; v < 2; v++) {
        colArr[i * 8 + v * 4 + 0] = palette.slow.r;
        colArr[i * 8 + v * 4 + 1] = palette.slow.g;
        colArr[i * 8 + v * 4 + 2] = palette.slow.b;
        colArr[i * 8 + v * 4 + 3] = 0.0;
      }
    }

    return {
      positions: posArr,
      colors: colArr,
      particleMeta: metaArr
    };
  }, [particleCount]);

  // FPS calculation helper
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Main animation frame update loop
  useFrame((state, delta) => {
    if (!geomRef.current) return;

    // Track FPS
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current >= 500) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      onFpsUpdate(fps);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    if (isPaused) return;

    const posAttr = geomRef.current.attributes.position;
    const colAttr = geomRef.current.attributes.color;

    const posData = posAttr.array;
    const colData = colAttr.array;

    const dt = Math.min(delta, 0.05);

    const cSlow = palette.slow;
    const cMid = palette.mid;
    const cFast = palette.fast;

    for (let i = 0; i < particleCount; i++) {
      let x = particleMeta[i * 4 + 0];
      let y = particleMeta[i * 4 + 1];
      let z = particleMeta[i * 4 + 2];
      let lifespan = particleMeta[i * 4 + 3];

      // Decrease lifespan
      lifespan -= dt * 0.35;

      // Mode-specific absorption checks
      if (mode === 'dipole') {
        const dxSink = x - (-2.5);
        const dySink = y - 0;
        const dzSink = z - 0;
        if (dxSink * dxSink + dySink * dySink + dzSink * dzSink <= 0.25) {
          lifespan = 0;
        }
      } else if (mode === 'spiral_sink') {
        if (x * x + y * y + z * z <= 0.15) {
          lifespan = 0;
        }
      }

      // Respawn check: if dead or out of bounds [-6, 6]
      const outOfBounds = Math.abs(x) > HALF_BOX || Math.abs(y) > HALF_BOX || Math.abs(z) > HALF_BOX;
      if (lifespan <= 0 || outOfBounds) {
        if (mode === 'dipole') {
          if (Math.random() < 0.5) {
            x = 2.5 + (Math.random() - 0.5) * 0.5;
            y = 0.0 + (Math.random() - 0.5) * 0.5;
            z = 0.0 + (Math.random() - 0.5) * 0.5;
          } else {
            x = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
            y = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
            z = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          }
        } else if (mode === 'spiral_sink') {
          // Respawn at outer perimeter boundary
          const angle = Math.random() * Math.PI * 2;
          const radius = 4.5 + Math.random() * 1.2;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
          z = (Math.random() - 0.5) * 8.0;
        } else if (mode === 'toroidal') {
          if (Math.random() < 0.7) {
            // Respawn along ring radius R0 = 3.0
            const theta = Math.random() * Math.PI * 2;
            const rOffset = 3.0 + (Math.random() - 0.5) * 1.5;
            x = Math.cos(theta) * rOffset;
            y = Math.sin(theta) * rOffset;
            z = (Math.random() - 0.5) * 1.5;
          } else {
            x = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
            y = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
            z = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          }
        } else {
          x = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          y = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          z = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
        }
        lifespan = 1.0;
      }

      // Calculate analytical velocity field vector (vx, vy, vz)
      let vx = 0, vy = 0, vz = 0;

      if (mode === 'tornado') {
        vx = -y * 1.2;
        vy = x * 1.2;
        vz = 0.5 * Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2.0;
      } else if (mode === 'dipole') {
        const s1x = 2.5, s1y = 0, s1z = 0;
        const s2x = -2.5, s2y = 0, s2z = 0;

        const dx1 = x - s1x, dy1 = y - s1y, dz1 = z - s1z;
        const r1_sq = dx1 * dx1 + dy1 * dy1 + dz1 * dz1 + 0.3;
        const r1_cube = Math.pow(r1_sq, 1.5);

        const dx2 = x - s2x, dy2 = y - s2y, dz2 = z - s2z;
        const r2_sq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2 + 0.3;
        const r2_cube = Math.pow(r2_sq, 1.5);

        vx = (dx1 / r1_cube - dx2 / r2_cube) * 6.0;
        vy = (dy1 / r1_cube - dy2 / r2_cube) * 6.0;
        vz = (dz1 / r1_cube - dz2 / r2_cube) * 6.0;
      } else if (mode === 'saddle') {
        vx = x * 0.6;
        vy = -y * 0.6;
        vz = -z * 0.3;
      } else if (mode === 'abc') {
        const kx = x * 0.5;
        const ky = y * 0.5;
        const kz = z * 0.5;
        vx = (Math.sin(kz) + Math.cos(ky)) * 1.5;
        vy = (Math.sin(kx) + Math.cos(kz)) * 1.5;
        vz = (Math.sin(ky) + Math.cos(kx)) * 1.5;
      } else if (mode === 'spiral_sink') {
        vx = -0.5 * x - 1.2 * y;
        vy = 1.2 * x - 0.5 * y;
        vz = -0.4 * z;
      } else if (mode === 'toroidal') {
        const R0 = 3.0;
        const rho = Math.sqrt(x * x + y * y) + 0.0001;
        const drho = rho - R0;
        const denom = drho * drho + z * z + 0.8;

        const v_poloidal_r = -z / denom;
        const v_poloidal_z = drho / denom;
        const v_toroidal_theta = 1.2 / Math.sqrt(denom);

        const cosTheta = x / rho;
        const sinTheta = y / rho;

        vx = (cosTheta * v_poloidal_r - sinTheta * v_toroidal_theta) * 3.0;
        vy = (sinTheta * v_poloidal_r + cosTheta * v_toroidal_theta) * 3.0;
        vz = v_poloidal_z * 3.0;
      } else if (mode === 'quadrupole') {
        vx = 0.25 * (x * x - y * y);
        vy = -0.5 * x * y;
        vz = -0.3 * z;
      }

      // Calculate vector speed for color mapping
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

      // Normalize directional vector
      if (speed > 0.0001) {
        vx /= speed;
        vy /= speed;
        vz /= speed;
      } else {
        vx = 0; vy = 0; vz = 0;
      }

      // Advance particle position
      const moveSpeed = flowSpeed * 3.0;
      const nextX = x + vx * dt * moveSpeed;
      const nextY = y + vy * dt * moveSpeed;
      const nextZ = z + vz * dt * moveSpeed;

      // Update particle metadata
      particleMeta[i * 4 + 0] = nextX;
      particleMeta[i * 4 + 1] = nextY;
      particleMeta[i * 4 + 2] = nextZ;
      particleMeta[i * 4 + 3] = lifespan;

      // Head vertex position
      posData[i * 6 + 0] = nextX;
      posData[i * 6 + 1] = nextY;
      posData[i * 6 + 2] = nextZ;

      // Tail vertex position
      const lengthScale = tailLength * 0.25;
      posData[i * 6 + 3] = nextX - vx * lengthScale;
      posData[i * 6 + 4] = nextY - vy * lengthScale;
      posData[i * 6 + 5] = nextZ - vz * lengthScale;

      // Opacity calculation based on lifespan
      const opacity = Math.sin(lifespan * Math.PI);

      // Speed magnitude color interpolation
      const normSpeed = Math.min(speed / 4.5, 1.0);
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

      // RGBA color attributes for Head (vertex 0) and Tail (vertex 1)
      colData[i * 8 + 0] = r;
      colData[i * 8 + 1] = g;
      colData[i * 8 + 2] = b;
      colData[i * 8 + 3] = opacity * 0.95;

      colData[i * 8 + 4] = r;
      colData[i * 8 + 5] = g;
      colData[i * 8 + 6] = b;
      colData[i * 8 + 7] = opacity * 0.3;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 4]}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <primitive object={FieldShaderMaterial} attach="material" />
    </lineSegments>
  );
}
