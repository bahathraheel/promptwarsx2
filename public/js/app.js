/**
 * ELITE ELECTION — Main Application Entry Point
 * Wires together scene, zones, scroll, particles, chat.
 */

(function () {
  'use strict';

  let sceneManager, zoneBuilder, lightingRig, particles, postEffects, scrollController, interactions, assistantUI;
  let zonesData = [];

  // ─── Loading ───
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const loadingText = document.getElementById('loading-text');
  let loadProgress = 0;

  function updateLoading(percent, text) {
    loadProgress = percent;
    if (loadingBar) loadingBar.style.width = percent + '%';
    if (loadingText) loadingText.textContent = text;
  }

  // ─── Fetch Zone Data ───
  async function fetchZones() {
    try {
      const res = await fetch('/api/zones');
      const data = await res.json();
      if (data.success) return data.data;
    } catch (e) { /* offline */ }
    return [];
  }

  async function fetchZoneDetail(id) {
    try {
      const res = await fetch(`/api/zones/${id}`);
      const data = await res.json();
      if (data.success) return data.data;
    } catch (e) { /* offline */ }
    return null;
  }

  // ─── Zone Change Handler ───
  async function onZoneChange(zoneName, index) {
    // Update zone dots
    document.querySelectorAll('.zone-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Update nav links
    document.querySelectorAll('.nav-link[data-zone]').forEach(link => {
      link.classList.toggle('active', link.dataset.zone === zoneName);
    });

    // Hide hero on scroll past welcome
    const hero = document.getElementById('hero-overlay');
    if (hero) hero.classList.toggle('hidden', index > 0);

    // Zone label
    const zoneLabel = document.getElementById('zone-label');
    const zoneLabelIcon = document.getElementById('zone-label-icon');
    const zoneLabelText = document.getElementById('zone-label-text');

    // Fetch zone detail for info card & chat
    const detail = await fetchZoneDetail(zoneName);
    if (detail && index > 0) {
      zoneLabel.classList.add('visible');
      zoneLabelIcon.textContent = detail.icon;
      zoneLabelText.textContent = detail.name;

      // Info overlay
      const infoOverlay = document.getElementById('info-overlay');
      document.getElementById('info-icon').textContent = detail.icon;
      document.getElementById('info-title').textContent = detail.name;
      document.getElementById('info-tagline').textContent = detail.tagline;
      document.getElementById('info-desc').textContent = detail.description;

      const factsList = document.getElementById('info-facts');
      factsList.innerHTML = '';
      (detail.key_facts || []).forEach(f => {
        const li = document.createElement('li');
        li.textContent = f;
        factsList.appendChild(li);
      });

      infoOverlay.classList.add('visible');

      // Update chat context
      if (assistantUI) {
        assistantUI.setZone(zoneName, detail);
      }
    } else {
      zoneLabel.classList.remove('visible');
      document.getElementById('info-overlay').classList.remove('visible');
    }

    // Update scroll progress
    const progress = document.getElementById('scroll-progress');
    if (progress) {
      const pct = ((index + 1) / 5) * 100;
      progress.style.width = pct + '%';
      progress.setAttribute('aria-valuenow', pct);
    }

    // Lighting
    if (lightingRig) lightingRig.highlightZone(zoneName);
  }

  // ─── Init ───
  async function init() {
    updateLoading(10, 'Loading zone data…');
    zonesData = await fetchZones();

    updateLoading(25, 'Initializing 3D scene…');
    sceneManager = new SceneManager('three-canvas');

    updateLoading(40, 'Building lighting…');
    lightingRig = new LightingRig(sceneManager.scene);

    updateLoading(55, 'Creating election zones…');
    zoneBuilder = new ZoneBuilder(sceneManager.scene);

    updateLoading(70, 'Spawning particles…');
    particles = new ParticleSystem(sceneManager.scene, 400);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(200, 500);
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0x0a0a1e, flatShading: true, side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -4, -100);
    ground.receiveShadow = true;
    sceneManager.addToScene(ground);

    updateLoading(78, 'Adding visual effects…');
    postEffects = new PostEffects(sceneManager);

    updateLoading(80, 'Setting up scroll…');
    scrollController = new ScrollController(sceneManager.camera, onZoneChange);

    updateLoading(85, 'Enabling interactions…');
    interactions = new Interactions(sceneManager.scene, sceneManager.camera, sceneManager.canvas);

    updateLoading(90, 'Loading assistant…');
    assistantUI = new AssistantUI();

    // ─── Animation Loop ───
    sceneManager.onAnimate((delta, elapsed) => {
      zoneBuilder.animate(elapsed);
      particles.animate(elapsed);
      postEffects.animate(elapsed);
      interactions.update();
    });

    // ─── Nav & Dot Clicks ───
    document.querySelectorAll('[data-zone]').forEach(el => {
      el.addEventListener('click', () => {
        const zone = el.dataset.zone;
        const idx = scrollController.getZoneIndex(zone);
        if (idx >= 0) scrollController.scrollToZone(idx);
      });
    });

    // ─── Scroll Progress ───
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.getElementById('scroll-spacer').offsetHeight - window.innerHeight;
      const pct = Math.min((scrolled / total) * 100, 100);
      const progress = document.getElementById('scroll-progress');
      if (progress) {
        progress.style.width = pct + '%';
        progress.setAttribute('aria-valuenow', Math.round(pct));
      }
    });

    updateLoading(100, 'Ready!');

    // Start
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      sceneManager.start();
    }, 600);
  }

  // ─── Boot ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
