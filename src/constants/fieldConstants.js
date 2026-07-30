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

// Field mathematical descriptions for info cards
export const MODE_DESCRIPTIONS = {
  tornado: {
    title: 'Tornado Vortex Field',
    type: 'Curl-Heavy / Rotational Flow',
    equation: 'v_x = -1.2y,  v_y = 1.2x,  v_z = 0.5 · sin(0.5x) · cos(0.5y)',
    desc: 'Simulates an atmospheric rotational vortex system with helical vertical displacement and constant streamline speed.'
  },
  dipole: {
    title: 'Dipole Field (Source & Sink)',
    type: 'Divergence-Heavy / Electromagnetic Flow',
    equation: 'V(P) = k · [ (P - S₁) / |P - S₁|³ - (P - S₂) / |P - S₂|³ ]',
    desc: 'Models flow emitting from Source (+2.5,0,0) and absorbing into Sink (-2.5,0,0) with 100% source injection and sink absorption.'
  },
  saddle: {
    title: 'Saddle Point Field',
    type: 'Hyperbolic Equilibrium Flow',
    equation: 'v_x = 0.6x,  v_y = -0.6y,  v_z = -0.3z',
    desc: 'Represents an unstable equilibrium point where flow converges along y and z axes while diverging away along the x axis.'
  }
};
