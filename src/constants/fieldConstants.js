import * as THREE from 'three';

// Bounding box size: 12x12x12 (range -6 to +6)
export const BOX_SIZE = 12;
export const HALF_BOX = BOX_SIZE / 2;

// Perceptually uniform sequential color scales for magnitude mapping in Light Mode
export const COLOR_PALETTES_LIGHT = {
  viridis: {
    name: 'Viridis (Standard)',
    slow: new THREE.Color('#fde725'),
    mid: new THREE.Color('#21918c'),
    fast: new THREE.Color('#440154'),
  },
  plasma: {
    name: 'Plasma (High Contrast)',
    slow: new THREE.Color('#f0f921'),
    mid: new THREE.Color('#cc4678'),
    fast: new THREE.Color('#0d0887'),
  },
  magma: {
    name: 'Magma (Heatmap)',
    slow: new THREE.Color('#fcfdbf'),
    mid: new THREE.Color('#b5367a'),
    fast: new THREE.Color('#000004'),
  }
};

// Vibrant, luminous, high-contrast color scales for Dark Mode
export const COLOR_PALETTES_DARK = {
  viridis: {
    name: 'Solar (Yellow to Red)',
    slow: new THREE.Color('#fef08a'),
    mid: new THREE.Color('#f97316'),
    fast: new THREE.Color('#ef4444'),
  },
  plasma: {
    name: 'Plasma (Neon Glow)',
    slow: new THREE.Color('#22d3ee'),
    mid: new THREE.Color('#f43f5e'),
    fast: new THREE.Color('#facc15'),
  },
  magma: {
    name: 'Magma (Firestorm)',
    slow: new THREE.Color('#ea580c'),
    mid: new THREE.Color('#ef4444'),
    fast: new THREE.Color('#fffbeb'),
  }
};

// Field mathematical descriptions for info cards and LaTeX rendering
export const MODE_DESCRIPTIONS = {
  tornado: {
    id: 'tornado',
    title: 'Tornado Vortex Field',
    type: 'Curl-Heavy / Atmospheric Vortex',
    equation: '\\vec{V}(x,y,z) = \\begin{pmatrix} -1.2 y \\\\ 1.2 x \\\\ 0.5 \\sin(0.5x) \\cos(0.5y) \\end{pmatrix}',
    divergence: '\\nabla \\cdot \\vec{V} = 0',
    curl: '\\nabla \\times \\vec{V} = \\begin{pmatrix} -0.25 \\sin(0.5x)\\sin(0.5y) \\\\ -0.25 \\cos(0.5x)\\cos(0.5y) \\\\ 2.4 \\end{pmatrix}',
    desc: 'Atmospheric helical vortex system with constant rotational velocity around the z-axis and vertical harmonic shear displacement.',
    isDivergenceFree: true,
  },
  dipole: {
    id: 'dipole',
    title: 'Dipole Field (Source & Sink)',
    type: 'Divergence-Heavy / Electrostatic',
    equation: '\\vec{V}(\\vec{r}) = q \\left[ \\frac{\\vec{r} - \\vec{r}_1}{|\\vec{r} - \\vec{r}_1|^3} - \\frac{\\vec{r} - \\vec{r}_2}{|\\vec{r} - \\vec{r}_2|^3} \\right]',
    divergence: '\\nabla \\cdot \\vec{V} = 4\\pi q [ \\delta(\\vec{r}-\\vec{r}_1) - \\delta(\\vec{r}-\\vec{r}_2) ]',
    curl: '\\nabla \\times \\vec{V} = \\vec{0}',
    desc: 'Electrostatic flow emitting from Source node r_1 = (+2.5, 0, 0) and absorbing into Sink node r_2 = (-2.5, 0, 0).',
    isDivergenceFree: false,
  },
  saddle: {
    id: 'saddle',
    title: 'Saddle Point Field',
    type: 'Hyperbolic Equilibrium Flow',
    equation: '\\vec{V}(x,y,z) = \\begin{pmatrix} 0.6 x \\\\ -0.6 y \\\\ -0.3 z \\end{pmatrix}',
    divergence: '\\nabla \\cdot \\vec{V} = -0.3',
    curl: '\\nabla \\times \\vec{V} = \\vec{0}',
    desc: 'Unstable hyperbolic equilibrium point where streamlines converge along the y and z axes and diverge away along the x axis.',
    isDivergenceFree: false,
  },
  abc: {
    id: 'abc',
    title: 'ABC Chaotic Flow',
    type: 'Arnold-Beltrami-Childress / Solenoidal Chaos',
    equation: '\\vec{V}(x,y,z) = \\begin{pmatrix} A \\sin(z) + C \\cos(y) \\\\ B \\sin(x) + A \\cos(z) \\\\ C \\sin(y) + B \\cos(x) \\end{pmatrix}',
    divergence: '\\nabla \\cdot \\vec{V} = 0',
    curl: '\\nabla \\times \\vec{V} = \\vec{V}',
    desc: 'Prototype 3D Beltrami flow where velocity is an exact eigenvector of curl operator (nabla x V = V), generating chaotic streamlines.',
    isDivergenceFree: true,
  },
  spiral_sink: {
    id: 'spiral_sink',
    title: 'Spiral Accretion Sink',
    type: 'Helical Accretion Vortex',
    equation: '\\vec{V}(x,y,z) = \\begin{pmatrix} -0.5 x - 1.2 y \\\\ 1.2 x - 0.5 y \\\\ -0.4 z \\end{pmatrix}',
    divergence: '\\nabla \\cdot \\vec{V} = -1.4',
    curl: '\\nabla \\times \\vec{V} = \\begin{pmatrix} 0 \\\\ 0 \\\\ 2.4 \\end{pmatrix}',
    desc: 'Swirling accretion disk combining centripetal attraction toward the origin with strong azimuthal vortex rotation.',
    isDivergenceFree: false,
  },
  toroidal: {
    id: 'toroidal',
    title: 'Toroidal Ring Vortex',
    type: 'Vortex Ring / Poloidal Field',
    equation: '\\vec{V}(x,y,z) = \\begin{pmatrix} \\frac{-y z - x(\\rho - R_0)}{(\\rho - R_0)^2 + z^2 + a^2} \\\\[4pt] \\frac{x z - y(\\rho - R_0)}{(\\rho - R_0)^2 + z^2 + a^2} \\\\[4pt] \\frac{\\rho (\\rho - R_0)}{(\\rho - R_0)^2 + z^2 + a^2} \\end{pmatrix}, \\quad \\rho = \\sqrt{x^2+y^2}',
    divergence: '\\nabla \\cdot \\vec{V} = 0',
    curl: '\\nabla \\times \\vec{V} \\neq \\vec{0}',
    desc: 'Self-sustaining poloidal and toroidal fluid vortex ring circulating continuously around a ring core of radius R_0 = 3.0.',
    isDivergenceFree: true,
  },
  quadrupole: {
    id: 'quadrupole',
    title: 'Quadrupole Strain Field',
    type: '4-Pole Electrostatic Lens',
    equation: '\\vec{V}(x,y,z) = \\begin{pmatrix} 0.25 (x^2 - y^2) \\\\ -0.5 x y \\\\ -0.3 z \\end{pmatrix}',
    divergence: '\\nabla \\cdot \\vec{V} = -0.3',
    curl: '\\nabla \\times \\vec{V} = \\vec{0}',
    desc: 'Four-lobed symmetrical strain field modeling electric quadrupole lenses and hyperbolic fluid stagnation lines.',
    isDivergenceFree: false,
  }
};
