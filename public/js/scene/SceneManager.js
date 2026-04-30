/**
 * ELITE ELECTION — Three.js Scene Manager
 * Initializes renderer, scene, camera, and handles resize.
 */

/* global THREE */

class SceneManager {
  constructor(canvasId = "three-canvas") {
    this.canvas = document.getElementById(canvasId);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 5, 30);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a1a, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Clock
    this.clock = new THREE.Clock();
    this.animationCallbacks = [];
    this.isRunning = false;

    // Resize handler
    this._onResize = this._onResize.bind(this);
    window.addEventListener("resize", this._onResize);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  addToScene(object) {
    this.scene.add(object);
  }

  onAnimate(callback) {
    this.animationCallbacks.push(callback);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._animate();
  }

  _animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this._animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    for (const cb of this.animationCallbacks) {
      cb(delta, elapsed);
    }

    this.renderer.render(this.scene, this.camera);
  }

  stop() {
    this.isRunning = false;
  }

  dispose() {
    this.stop();
    window.removeEventListener("resize", this._onResize);
    this.renderer.dispose();
  }
}

window.SceneManager = SceneManager;
