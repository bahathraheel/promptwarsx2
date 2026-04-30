/**
 * ELITE ELECTION — Scroll Controller
 * GSAP ScrollTrigger-based camera animation between zones.
 */

/* global THREE, gsap, ScrollTrigger */

class ScrollController {
  constructor(camera, onZoneChange) {
    this.camera = camera;
    this.onZoneChange = onZoneChange;
    this.currentZone = 0;
    this.zones = ["welcome", "registration", "timeline", "polling", "results"];

    this.cameraPositions = [
      { x: 0, y: 5, z: 30, lookY: 0, lookZ: 0 },
      { x: 5, y: 5, z: -20, lookY: 0, lookZ: -50 },
      { x: -5, y: 6, z: -70, lookY: 0, lookZ: -100 },
      { x: 4, y: 4, z: -120, lookY: 0, lookZ: -150 },
      { x: 0, y: 8, z: -170, lookY: 0, lookZ: -200 },
    ];

    gsap.registerPlugin(ScrollTrigger);
    this._setupScrollTriggers();
  }

  _setupScrollTriggers() {
    const totalSections = this.zones.length;

    this.zones.forEach((zone, index) => {
      const start = (index / totalSections) * 100;
      const end = ((index + 1) / totalSections) * 100;
      const camPos = this.cameraPositions[index];

      ScrollTrigger.create({
        trigger: "#scroll-spacer",
        start: `${start}% top`,
        end: `${end}% top`,
        onEnter: () => this._onEnterZone(index),
        onEnterBack: () => this._onEnterZone(index),
        onUpdate: (self) => this._onUpdateProgress(index, self.progress),
      });

      // Animate camera position
      gsap.to(this.camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "#scroll-spacer",
          start: `${start}% top`,
          end: `${end}% top`,
          scrub: 1,
        },
      });
    });
  }

  _onEnterZone(index) {
    if (this.currentZone !== index) {
      this.currentZone = index;
      const camPos = this.cameraPositions[index];
      this.camera.lookAt(new THREE.Vector3(0, camPos.lookY, camPos.lookZ));

      if (this.onZoneChange) {
        this.onZoneChange(this.zones[index], index);
      }
    }
  }

  _onUpdateProgress(index, progress) {
    // Smooth camera lookAt interpolation
    if (index < this.cameraPositions.length - 1) {
      const currLook = this.cameraPositions[index];
      const nextLook = this.cameraPositions[index + 1];
      const lookZ =
        currLook.lookZ + (nextLook.lookZ - currLook.lookZ) * progress;
      this.camera.lookAt(new THREE.Vector3(0, currLook.lookY, lookZ));
    }
  }

  /** Programmatically scroll to a zone */
  scrollToZone(zoneIndex) {
    const totalSections = this.zones.length;
    const targetScroll =
      (zoneIndex / totalSections) *
      document.getElementById("scroll-spacer").offsetHeight;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }

  /** Get zone index by name */
  getZoneIndex(name) {
    return this.zones.indexOf(name);
  }
}

window.ScrollController = ScrollController;
