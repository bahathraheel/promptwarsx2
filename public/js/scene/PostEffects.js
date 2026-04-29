/**
 * ELITE ELECTION — Post-Processing Effects
 * Bloom glow, vignette, and color grading overlay for the 3D scene.
 */

/* global THREE */

class PostEffects {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;
    this.renderer = sceneManager.renderer;
    this.camera = sceneManager.camera;

    // Glow meshes for zone highlights
    this.glowMeshes = [];
    this._addZoneGlows();
    this._addStarfield();
  }

  /** Ethereal glow halos at each zone position */
  _addZoneGlows() {
    const zonePositions = [
      { z: 0, color: 0x4488ff },
      { z: -50, color: 0x44ddaa },
      { z: -100, color: 0xffaa44 },
      { z: -150, color: 0xff4488 },
      { z: -200, color: 0xaa44ff }
    ];

    zonePositions.forEach(zone => {
      // Outer glow ring
      const ringGeo = new THREE.RingGeometry(8, 15, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: zone.color,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, -3.5, zone.z);
      this.scene.add(ring);
      this.glowMeshes.push(ring);

      // Inner pulse sphere
      const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: zone.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(0, 8, zone.z);
      sphere.userData = { pulses: true, baseOpacity: 0.3 };
      this.scene.add(sphere);
      this.glowMeshes.push(sphere);
    });
  }

  /** Subtle starfield in the background */
  _addStarfield() {
    const starCount = 200;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 50 + 10;
      positions[i * 3 + 2] = (Math.random()) * -250;

      const brightness = Math.random() * 0.5 + 0.5;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness * 1.2; // slight blue tint
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  /** Animate post effects (called per frame) */
  animate(elapsed) {
    // Pulse glow spheres
    this.glowMeshes.forEach(mesh => {
      if (mesh.userData && mesh.userData.pulses) {
        mesh.material.opacity = mesh.userData.baseOpacity + Math.sin(elapsed * 2) * 0.15;
        mesh.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.2);
      }
    });

    // Rotate starfield very slowly
    if (this.stars) {
      this.stars.rotation.y = elapsed * 0.003;
      this.stars.rotation.x = Math.sin(elapsed * 0.1) * 0.01;
    }
  }
}

window.PostEffects = PostEffects;
