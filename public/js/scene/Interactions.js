/**
 * ELITE ELECTION — Interactions
 * Raycasting for hover and click detection on 3D models.
 */

/* global THREE */

class Interactions {
  constructor(scene, camera, canvas) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.onClick = null;

    canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    canvas.addEventListener('click', (e) => this._onMouseClick(e));
    canvas.style.cursor = 'default';
    this.canvas = canvas;
  }

  _onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // UI Parallax Effect for 3D interface feeling
    const infoOverlay = document.getElementById('info-overlay');
    const chatPanel = document.getElementById('chat-panel');
    
    // Calculate tilt based on mouse position relative to center (max 10 degrees)
    const tiltX = -this.mouse.y * 10;
    const tiltY = this.mouse.x * 10;
    
    if (infoOverlay && infoOverlay.classList.contains('visible')) {
      infoOverlay.style.transform = `perspective(1000px) translateX(0) rotateX(${tiltX * 0.5}deg) rotateY(${5 + tiltY * 0.5}deg)`;
    }
    
    if (chatPanel && chatPanel.classList.contains('open')) {
      chatPanel.style.transform = `perspective(1000px) translateY(0) rotateX(${-2 + tiltX * 0.3}deg) rotateY(${-5 + tiltY * 0.3}deg)`;
    }
  }

  _onMouseClick() {
    if (this.hoveredObject && this.onClick) {
      this.onClick(this.hoveredObject);
    }
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (this.hoveredObject !== obj) {
        // Restore previous
        if (this.hoveredObject && this.hoveredObject._origScale) {
          this.hoveredObject.scale.copy(this.hoveredObject._origScale);
        }
        this.hoveredObject = obj;
        // Scale up slightly
        obj._origScale = obj.scale.clone();
        obj.scale.multiplyScalar(1.05);
        this.canvas.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredObject && this.hoveredObject._origScale) {
        this.hoveredObject.scale.copy(this.hoveredObject._origScale);
      }
      this.hoveredObject = null;
      this.canvas.style.cursor = 'default';
    }
  }
}

window.Interactions = Interactions;
