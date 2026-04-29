/**
 * ELITE ELECTION — Particle System
 * Ambient floating particles for atmosphere.
 */

/* global THREE */

class ParticleSystem {
  constructor(scene, count = 500) {
    this.count = count;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random()) * -250;

      const hue = Math.random() * 0.2 + 0.55; // blue-ish
      const color = new THREE.Color().setHSL(hue, 0.7, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geo, mat);
    scene.add(this.points);
    this.positions = positions;
  }

  animate(elapsed) {
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3 + 1] += Math.sin(elapsed + i) * 0.003;
      this.positions[i * 3] += Math.cos(elapsed * 0.5 + i * 0.1) * 0.002;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.rotation.y = elapsed * 0.01;
  }
}

window.ParticleSystem = ParticleSystem;
