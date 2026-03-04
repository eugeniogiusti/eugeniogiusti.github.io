(function () {
  if (typeof THREE === 'undefined') return;

  const wrap = document.getElementById('services-network-wrap');
  if (!wrap) return;

  let initialized = false;
  let renderer, camera, scene;
  let nodePositions, nodeVelocities, nodeGeo;
  let lineGeo, linePositions;

  const N = window.innerWidth < 768 ? 18 : 28;
  const SPREAD = 160;
  const MAX_DIST = 70;
  const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
  const MAX_LINES = (N * (N - 1)) / 2;

  function init() {
    if (initialized) return;
    initialized = true;

    const canvas = document.getElementById('services-network');
    if (!canvas) return;

    const w = wrap.clientWidth || window.innerWidth;
    const h = wrap.clientHeight || 320;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    camera.position.z = 200;

    // Nodes
    nodePositions = new Float32Array(N * 3);
    nodeVelocities = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      nodePositions[i * 3]     = (Math.random() - 0.5) * SPREAD;
      nodePositions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.5;
      nodePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      nodeVelocities[i * 3]     = (Math.random() - 0.5) * 0.08;
      nodeVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      nodeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }

    nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0x658DF2,
      size: 4,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });
    scene.add(new THREE.Points(nodeGeo, nodeMat));

    // Lines
    linePositions = new Float32Array(MAX_LINES * 6);
    lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x658DF2,
      transparent: true,
      opacity: 0.18
    });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    animate(w, h);

    window.addEventListener('resize', function () {
      const nw = wrap.clientWidth;
      const nh = wrap.clientHeight;
      if (nw && nh) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    });
  }

  function animate(w, h) {
    requestAnimationFrame(function () { animate(w, h); });

    // Move nodes, bounce off walls
    for (let i = 0; i < N; i++) {
      nodePositions[i * 3]     += nodeVelocities[i * 3];
      nodePositions[i * 3 + 1] += nodeVelocities[i * 3 + 1];
      nodePositions[i * 3 + 2] += nodeVelocities[i * 3 + 2];

      const hx = SPREAD / 2, hy = SPREAD * 0.25, hz = 30;
      if (Math.abs(nodePositions[i * 3])     > hx) nodeVelocities[i * 3]     *= -1;
      if (Math.abs(nodePositions[i * 3 + 1]) > hy) nodeVelocities[i * 3 + 1] *= -1;
      if (Math.abs(nodePositions[i * 3 + 2]) > hz) nodeVelocities[i * 3 + 2] *= -1;
    }
    nodeGeo.attributes.position.needsUpdate = true;

    // Update lines
    let lIdx = 0;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = nodePositions[i * 3]     - nodePositions[j * 3];
        const dy = nodePositions[i * 3 + 1] - nodePositions[j * 3 + 1];
        const dz = nodePositions[i * 3 + 2] - nodePositions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < MAX_DIST_SQ) {
          linePositions[lIdx++] = nodePositions[i * 3];
          linePositions[lIdx++] = nodePositions[i * 3 + 1];
          linePositions[lIdx++] = nodePositions[i * 3 + 2];
          linePositions[lIdx++] = nodePositions[j * 3];
          linePositions[lIdx++] = nodePositions[j * 3 + 1];
          linePositions[lIdx++] = nodePositions[j * 3 + 2];
        } else {
          linePositions[lIdx++] = 0; linePositions[lIdx++] = 0; linePositions[lIdx++] = 0;
          linePositions[lIdx++] = 0; linePositions[lIdx++] = 0; linePositions[lIdx++] = 0;
        }
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, lIdx / 3);

    renderer.render(scene, camera);
  }

  // Init when #services becomes active
  document.querySelectorAll('a.inner-link[href="#services"]').forEach(function (link) {
    link.addEventListener('click', function () { setTimeout(init, 60); });
  });

  // Init immediately if already active on load
  if (document.querySelector('#services.active')) {
    setTimeout(init, 100);
  }
})();
