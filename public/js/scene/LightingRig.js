/**
 * ELITE ELECTION — Lighting Rig
 * Ambient + directional + per-zone point lights.
 */

/* global THREE */

class LightingRig {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};

    // Ambient fill
    this.ambient = new THREE.AmbientLight(0x334466, 0.4);
    scene.add(this.ambient);

    // Key light (directional)
    this.directional = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directional.position.set(10, 20, 10);
    this.directional.castShadow = true;
    this.directional.shadow.mapSize.width = 1024;
    this.directional.shadow.mapSize.height = 1024;
    scene.add(this.directional);

    // Zone accent lights
    const zoneColors = {
      welcome: 0x4488ff,
      registration: 0x44ddaa,
      timeline: 0xffaa44,
      polling: 0xff4488,
      results: 0xaa44ff
    };

    const zonePositions = [
      [0, 6, 0],      // welcome
      [0, 6, -50],    // registration
      [0, 6, -100],   // timeline
      [0, 6, -150],   // polling
      [0, 6, -200]    // results
    ];

    const zoneNames = ['welcome', 'registration', 'timeline', 'polling', 'results'];

    zoneNames.forEach((name, i) => {
      const light = new THREE.PointLight(zoneColors[name], 0.6, 40);
      light.position.set(...zonePositions[i]);
      scene.add(light);
      this.lights[name] = light;
    });
  }

  /** Highlight a specific zone's light */
  highlightZone(zoneName) {
    Object.entries(this.lights).forEach(([name, light]) => {
      light.intensity = name === zoneName ? 1.2 : 0.3;
    });
  }
}

window.LightingRig = LightingRig;
