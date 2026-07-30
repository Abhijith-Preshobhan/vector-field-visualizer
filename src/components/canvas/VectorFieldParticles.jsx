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
    // 2 vertices per particle (Head and Tail for line segment)
    const posArr = new Float32Array(particleCount * 2 * 3);
    const colArr = new Float32Array(particleCount * 2 * 4); // RGBA for each vertex
    // Meta: [x, y, z, lifespan]
    const metaArr = new Float32Array(particleCount * 4);

    for (let i = 0; i < particleCount; i++) {
      // Random starting positions within [-6, 6]
      const px = (Math.random() - 0.5) * BOX_SIZE;
      const py = (Math.random() - 0.5) * BOX_SIZE;
      const pz = (Math.random() - 0.5) * BOX_SIZE;
      const lifespan = Math.random(); // Initial random offset lifespan (0 to 1)

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

  // Main animation frame update loop (Direct Buffer Mutator)
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

      // Collision check for Dipole Mode: If within 0.5 units of Sink (-2.5, 0, 0), force lifespan to 0
      if (mode === 'dipole') {
        const dxSink = x - (-2.5);
        const dySink = y - 0;
        const dzSink = z - 0;
        if (dxSink * dxSink + dySink * dySink + dzSink * dzSink <= 0.25) {
          lifespan = 0;
        }
      }

      // Respawn check: if dead or out of 12x12x12 bounds [-6, 6]
      const outOfBounds = Math.abs(x) > HALF_BOX || Math.abs(y) > HALF_BOX || Math.abs(z) > HALF_BOX;
      if (lifespan <= 0 || outOfBounds) {
        if (mode === 'dipole') {
          // Force respawn coordinates x, y, z to be exactly at Source (2.5, 0, 0) with a tiny random jitter
          x = 2.5 + (Math.random() - 0.5) * 0.2;
          y = 0.0 + (Math.random() - 0.5) * 0.2;
          z = 0.0 + (Math.random() - 0.5) * 0.2;
        } else {
          // Uniform random bounding box respawn for all other modes
          x = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          y = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
          z = (Math.random() - 0.5) * (BOX_SIZE * 0.95);
        }
        lifespan = 1.0;
      }

      // Calculate analytical velocity field vector (vx, vy, vz)
      let vx = 0, vy = 0, vz = 0;

      if (mode === 'tornado') {
        // Tornado (Curl-heavy)
        vx = -y * 1.2;
        vy = x * 1.2;
        vz = 0.5 * Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2.0;
      } else if (mode === 'dipole') {
        // Dipole (Divergence-heavy): Source at (2.5,0,0), Sink at (-2.5,0,0)
        const s1x = 2.5, s1y = 0, s1z = 0; // Source
        const s2x = -2.5, s2y = 0, s2z = 0; // Sink

        const dx1 = x - s1x, dy1 = y - s1y, dz1 = z - s1z;
        const r1_sq = dx1 * dx1 + dy1 * dy1 + dz1 * dz1 + 0.3;
        const r1_cube = Math.pow(r1_sq, 1.5);

        const dx2 = x - s2x, dy2 = y - s2y, dz2 = z - s2z;
        const r2_sq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2 + 0.3;
        const r2_cube = Math.pow(r2_sq, 1.5);

        // Push away from source, pull into sink
        vx = (dx1 / r1_cube - dx2 / r2_cube) * 6.0;
        vy = (dy1 / r1_cube - dy2 / r2_cube) * 6.0;
        vz = (dz1 / r1_cube - dz2 / r2_cube) * 6.0;
      } else if (mode === 'saddle') {
        // Saddle Point
        vx = x * 0.6;
        vy = -y * 0.6;
        vz = -z * 0.3;
      }

      // 1. Calculate original mathematical vector magnitude (speed)
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

      // 2. Normalize vector so directional vector has a magnitude of 1
      if (speed > 0.0001) {
        vx /= speed;
        vy /= speed;
        vz /= speed;
      } else {
        vx = 0;
        vy = 0;
        vz = 0;
      }

      // 3. Move particle using normalized vector multiplied by baseline speed (dt * flowSpeed * 3.0)
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

      // Tail vertex position scaled by normalized directional vector & tailLength factor
      const lengthScale = tailLength * 0.25;
      posData[i * 6 + 3] = nextX - vx * lengthScale;
      posData[i * 6 + 4] = nextY - vy * lengthScale;
      posData[i * 6 + 5] = nextZ - vz * lengthScale;

      // Opacity calculation based on sine wave of lifespan (smooth fade in/out)
      const opacity = Math.sin(lifespan * Math.PI);

      // 4. Use original raw `speed` variable ONLY to calculate color interpolation
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

      // Set RGBA color attributes for both Head (vertex 0) and Tail (vertex 1)
      colData[i * 8 + 0] = r;
      colData[i * 8 + 1] = g;
      colData[i * 8 + 2] = b;
      colData[i * 8 + 3] = opacity * 0.95; // Head opacity

      colData[i * 8 + 4] = r;
      colData[i * 8 + 5] = g;
      colData[i * 8 + 6] = b;
      colData[i * 8 + 7] = opacity * 0.3; // Tail opacity
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
