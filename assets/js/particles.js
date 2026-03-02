(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const N = window.innerWidth < 768 ? 40 : 80;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 180;

  const ptPos = new Float32Array(N * 3);
  const ptVel = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    ptPos[i * 3]     = (Math.random() - 0.5) * 350;
    ptPos[i * 3 + 1] = (Math.random() - 0.5) * 350;
    ptPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    ptVel[i * 3]     = (Math.random() - 0.5) * 0.1;
    ptVel[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    ptVel[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
  }

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));

  const ptMat = new THREE.PointsMaterial({
    color: 0x658DF2,
    size: 3.5,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });
  scene.add(new THREE.Points(ptGeo, ptMat));

  const MAX_LINES = (N * (N - 1)) / 2;
  const linePos = new Float32Array(MAX_LINES * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x658DF2, transparent: true, opacity: 0.15 });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  const MAX_DIST_SQ = 75 * 75;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < N; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;
      ptPos[ix] += ptVel[ix];
      ptPos[iy] += ptVel[iy];
      ptPos[iz] += ptVel[iz];
      if (Math.abs(ptPos[ix]) > 175) ptVel[ix] *= -1;
      if (Math.abs(ptPos[iy]) > 175) ptVel[iy] *= -1;
      if (Math.abs(ptPos[iz]) > 60)  ptVel[iz] *= -1;
    }
    ptGeo.attributes.position.needsUpdate = true;

    let idx = 0;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = ptPos[i*3]   - ptPos[j*3];
        const dy = ptPos[i*3+1] - ptPos[j*3+1];
        const dz = ptPos[i*3+2] - ptPos[j*3+2];
        if (dx*dx + dy*dy + dz*dz < MAX_DIST_SQ) {
          linePos[idx++] = ptPos[i*3];   linePos[idx++] = ptPos[i*3+1]; linePos[idx++] = ptPos[i*3+2];
          linePos[idx++] = ptPos[j*3];   linePos[idx++] = ptPos[j*3+1]; linePos[idx++] = ptPos[j*3+2];
        }
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, idx / 3);

    camera.position.x += (mouseX * 25 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 25 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
