/**
 * ELITE ELECTION — Zone Builder
 * Creates procedural low-poly 3D models for each election zone.
 */

/* global THREE */

class ZoneBuilder {
  constructor(scene) {
    this.scene = scene;
    this.zones = {};
    this.zonePositions = {
      welcome: new THREE.Vector3(0, 0, 0),
      registration: new THREE.Vector3(0, 0, -50),
      timeline: new THREE.Vector3(0, 0, -100),
      polling: new THREE.Vector3(0, 0, -150),
      results: new THREE.Vector3(0, 0, -200)
    };
    this.buildAll();
  }

  buildAll() {
    this.zones.welcome = this._buildWelcomeGlobe();
    this.zones.registration = this._buildIdCard();
    this.zones.timeline = this._buildCalendar();
    this.zones.polling = this._buildBallotBox();
    this.zones.results = this._buildPodium();
  }

  /** Zone 1: Spinning globe with election markers */
  _buildWelcomeGlobe() {
    const group = new THREE.Group();
    const pos = this.zonePositions.welcome;

    // Globe
    const globeGeo = new THREE.IcosahedronGeometry(4, 2);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x2244cc, flatShading: true, transparent: true, opacity: 0.85
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globe.castShadow = true;
    group.add(globe);

    // Glowing edges for globe
    const edges = new THREE.EdgesGeometry(globeGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x44ccff, transparent: true, opacity: 0.5 }));
    globe.add(line);

    // Ring
    const ringGeo = new THREE.TorusGeometry(5.5, 0.15, 8, 32);
    const ringMat = new THREE.MeshPhongMaterial({ color: 0x44aaff, flatShading: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);

    // Markers on globe
    for (let i = 0; i < 8; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 8);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const markerGeo = new THREE.OctahedronGeometry(0.2, 0);
      const markerMat = new THREE.MeshPhongMaterial({ color: 0x44ff88, emissive: 0x22aa44, flatShading: true });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.setFromSphericalCoords(4.2, phi, theta);
      group.add(marker);
    }

    group.position.copy(pos);
    group.position.y = 3;
    group.userData = { type: 'welcome', animate: true };
    this.scene.add(group);
    return group;
  }

  /** Zone 2: Stylized ID card + clipboard */
  _buildIdCard() {
    const group = new THREE.Group();
    const pos = this.zonePositions.registration;

    // Clipboard body
    const boardGeo = new THREE.BoxGeometry(5, 7, 0.3);
    const boardMat = new THREE.MeshPhongMaterial({ color: 0x8B4513, flatShading: true });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.castShadow = true;
    group.add(board);

    // Glowing edges for board
    const boardEdges = new THREE.EdgesGeometry(boardGeo);
    const boardLines = new THREE.LineSegments(boardEdges, new THREE.LineBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.5 }));
    board.add(boardLines);

    // Paper
    const paperGeo = new THREE.BoxGeometry(4.2, 5.5, 0.05);
    const paperMat = new THREE.MeshPhongMaterial({ color: 0xfafafa, flatShading: true });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(0, -0.3, 0.2);
    group.add(paper);

    // Clip
    const clipGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 6);
    const clipMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true });
    const clip = new THREE.Mesh(clipGeo, clipMat);
    clip.position.set(0, 3.7, 0.2);
    clip.rotation.x = Math.PI / 2;
    group.add(clip);

    // Check marks on paper
    for (let i = 0; i < 3; i++) {
      const checkGeo = new THREE.BoxGeometry(0.4, 0.4, 0.1);
      const checkMat = new THREE.MeshPhongMaterial({ color: 0x22cc66, emissive: 0x116633, flatShading: true });
      const check = new THREE.Mesh(checkGeo, checkMat);
      check.position.set(-1.2, 1.5 - i * 1.5, 0.3);
      group.add(check);
    }

    group.position.copy(pos);
    group.position.y = 3;
    group.rotation.y = -0.2;
    group.userData = { type: 'registration', animate: true };
    this.scene.add(group);
    return group;
  }

  /** Zone 3: Calendar with animated milestones */
  _buildCalendar() {
    const group = new THREE.Group();
    const pos = this.zonePositions.timeline;

    // Calendar body
    const calGeo = new THREE.BoxGeometry(6, 5, 0.4);
    const calMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true });
    const cal = new THREE.Mesh(calGeo, calMat);
    cal.castShadow = true;
    group.add(cal);

    // Glowing edges for calendar
    const calEdges = new THREE.EdgesGeometry(calGeo);
    const calLines = new THREE.LineSegments(calEdges, new THREE.LineBasicMaterial({ color: 0x8844ff, transparent: true, opacity: 0.5 }));
    cal.add(calLines);

    // Header
    const headerGeo = new THREE.BoxGeometry(6, 1.2, 0.45);
    const headerMat = new THREE.MeshPhongMaterial({ color: 0xdd3344, flatShading: true });
    const header = new THREE.Mesh(headerGeo, headerMat);
    header.position.set(0, 1.9, 0.05);
    group.add(header);

    // Grid cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const cellGeo = new THREE.BoxGeometry(0.9, 0.7, 0.1);
        const isHighlight = (r === 1 && c === 3) || (r === 3 && c === 1);
        const cellMat = new THREE.MeshPhongMaterial({
          color: isHighlight ? 0x4488ff : 0xdddddd,
          emissive: isHighlight ? 0x2244aa : 0x000000,
          flatShading: true
        });
        const cell = new THREE.Mesh(cellGeo, cellMat);
        cell.position.set(-1.8 + c * 0.95, 0.8 - r * 0.85, 0.3);
        group.add(cell);
      }
    }

    group.position.copy(pos);
    group.position.y = 3;
    group.userData = { type: 'timeline', animate: true };
    this.scene.add(group);
    return group;
  }

  /** Zone 4: Ballot box + voting booth */
  _buildBallotBox() {
    const group = new THREE.Group();
    const pos = this.zonePositions.polling;

    // Box body
    const boxGeo = new THREE.BoxGeometry(4, 3, 3);
    const boxMat = new THREE.MeshPhongMaterial({ color: 0x2244aa, flatShading: true });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = true;
    group.add(box);

    // Glowing edges for ballot box
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxLines = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x44ffaa, transparent: true, opacity: 0.5 }));
    box.add(boxLines);

    // Slot
    const slotGeo = new THREE.BoxGeometry(2.5, 0.15, 0.5);
    const slotMat = new THREE.MeshPhongMaterial({ color: 0x111133, flatShading: true });
    const slot = new THREE.Mesh(slotGeo, slotMat);
    slot.position.set(0, 1.55, 0);
    group.add(slot);

    // Ballot paper (floating above)
    const ballotGeo = new THREE.BoxGeometry(1.8, 2.5, 0.05);
    const ballotMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
    const ballot = new THREE.Mesh(ballotGeo, ballotMat);
    ballot.position.set(0, 3.5, 0);
    ballot.rotation.z = 0.1;
    ballot.userData = { floats: true };
    group.add(ballot);

    // Star on box
    const starGeo = new THREE.OctahedronGeometry(0.5, 0);
    const starMat = new THREE.MeshPhongMaterial({ color: 0xffdd44, emissive: 0xaa8800, flatShading: true });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(0, 0, 1.55);
    group.add(star);

    // Legs
    for (let x of [-1.5, 1.5]) {
      for (let z of [-1, 1]) {
        const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 6);
        const legMat = new THREE.MeshPhongMaterial({ color: 0x666688, flatShading: true });
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(x, -2.5, z);
        group.add(leg);
      }
    }

    group.position.copy(pos);
    group.position.y = 3;
    group.userData = { type: 'polling', animate: true };
    this.scene.add(group);
    return group;
  }

  /** Zone 5: Podium with data visualization */
  _buildPodium() {
    const group = new THREE.Group();
    const pos = this.zonePositions.results;

    // Podium steps
    const steps = [
      { w: 2.5, h: 4, d: 2, y: 0, color: 0xccaa00 },    // 1st (gold)
      { w: 2.5, h: 3, d: 2, y: -0.5, color: 0xaaaaaa },  // 2nd (silver)
      { w: 2.5, h: 2, d: 2, y: -1, color: 0xbb6633 }     // 3rd (bronze)
    ];

    steps.forEach((s, i) => {
      const geo = new THREE.BoxGeometry(s.w, s.h, s.d);
      const mat = new THREE.MeshPhongMaterial({ color: s.color, flatShading: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-3 + i * 3, s.y, 0);
      mesh.castShadow = true;
      group.add(mesh);
      
      const stepEdges = new THREE.EdgesGeometry(geo);
      const stepLines = new THREE.LineSegments(stepEdges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
      mesh.add(stepLines);
    });

    // Bar chart behind podium
    const barColors = [0x4488ff, 0x44dd88, 0xff6644, 0xaa44ff, 0xffaa44];
    for (let i = 0; i < 5; i++) {
      const h = 1 + Math.random() * 4;
      const barGeo = new THREE.BoxGeometry(0.8, h, 0.3);
      const barMat = new THREE.MeshPhongMaterial({ color: barColors[i], emissive: barColors[i], emissiveIntensity: 0.2, flatShading: true });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-3.5 + i * 1.8, h / 2 + 2.5, -2.5);
      group.add(bar);
    }

    // Trophy on top podium
    const trophyBaseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.4, 8);
    const trophyMat = new THREE.MeshPhongMaterial({ color: 0xffdd00, emissive: 0xaa8800, flatShading: true });
    const trophyBase = new THREE.Mesh(trophyBaseGeo, trophyMat);
    trophyBase.position.set(-3, 2.3, 0);
    group.add(trophyBase);

    const cupGeo = new THREE.CylinderGeometry(0.6, 0.3, 1, 8, 1, true);
    const cup = new THREE.Mesh(cupGeo, trophyMat);
    cup.position.set(-3, 3, 0);
    group.add(cup);

    group.position.copy(pos);
    group.position.y = 1;
    group.userData = { type: 'results', animate: true };
    this.scene.add(group);
    return group;
  }

  /** Animate zones (called per frame) */
  animate(elapsed) {
    // Welcome globe rotation
    if (this.zones.welcome) {
      this.zones.welcome.rotation.y = elapsed * 0.3;
      this.zones.welcome.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'TorusGeometry') {
          child.rotation.z = elapsed * 0.2;
        }
      });
    }

    // Registration clipboard hover
    if (this.zones.registration) {
      this.zones.registration.position.y = 3 + Math.sin(elapsed * 1.5) * 0.3;
    }

    // Calendar date pulse
    if (this.zones.timeline) {
      this.zones.timeline.rotation.y = Math.sin(elapsed * 0.5) * 0.1;
    }

    // Ballot float
    if (this.zones.polling) {
      const ballot = this.zones.polling.children.find(c => c.userData && c.userData.floats);
      if (ballot) {
        ballot.position.y = 3.5 + Math.sin(elapsed * 2) * 0.5;
        ballot.rotation.z = 0.1 + Math.sin(elapsed * 1.5) * 0.05;
      }
    }

    // Podium trophy spin
    if (this.zones.results) {
      this.zones.results.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'CylinderGeometry' && child.material.emissive) {
          child.rotation.y = elapsed * 0.8;
        }
      });
    }
  }
}

window.ZoneBuilder = ZoneBuilder;
