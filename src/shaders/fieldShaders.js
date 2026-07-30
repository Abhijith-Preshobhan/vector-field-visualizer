import * as THREE from 'three';

/**
 * Custom Shader Material supporting per-vertex color & alpha
 */
export const FieldShaderMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    attribute vec4 color;
    varying vec4 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending, // NormalBlending ensures rich high-contrast colors
});
