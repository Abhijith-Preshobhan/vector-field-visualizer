import * as THREE from 'three';

/**
 * Evaluates the 3D analytical vector field equation V(x, y, z) at point (x, y, z)
 * Returns { vx, vy, vz, speed }
 */
export function evaluateVectorField(mode, x, y, z) {
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

  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
  return { vx, vy, vz, speed };
}

/**
 * Calculates the unit normal vector n (nx, ny, nz) for a slice plane based on preset or custom pitch/yaw angles.
 */
export function calculatePlaneNormal(preset, pitchDeg, yawDeg) {
  if (preset === 'xy') return new THREE.Vector3(0, 0, 1);
  if (preset === 'xz') return new THREE.Vector3(0, 1, 0);
  if (preset === 'yz') return new THREE.Vector3(1, 0, 0);

  const pitchRad = (pitchDeg * Math.PI) / 180;
  const yawRad = (yawDeg * Math.PI) / 180;

  const nx = Math.cos(pitchRad) * Math.sin(yawRad);
  const ny = Math.sin(pitchRad);
  const nz = Math.cos(pitchRad) * Math.cos(yawRad);

  return new THREE.Vector3(nx, ny, nz).normalize();
}

/**
 * Computes plane orientation quaternion and orthogonal tangent basis vectors (uBasis, vBasis)
 */
export function calculatePlaneBasis(normal) {
  const n = normal.clone().normalize();
  
  // Find a helper vector non-parallel to n
  const helper = Math.abs(n.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  
  const uBasis = new THREE.Vector3().crossVectors(helper, n).normalize();
  const vBasis = new THREE.Vector3().crossVectors(n, uBasis).normalize();

  // Rotation quaternion aligning local (0,0,1) to normal
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);

  return { normal: n, uBasis, vBasis, quaternion };
}
