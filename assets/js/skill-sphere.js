(function () {
  if (typeof THREE === 'undefined') return;

  const wrap = document.getElementById('skill-sphere-wrap');
  if (!wrap) return;

  const skills = [
    'Linux', 'Bash', 'PHP', 'AWS', 'MySQL', 'JavaScript',
    'Apache', 'Git', 'Nginx', 'Zabbix', 'pfSense',
    'Laravel', 'WordPress', 'Ubuntu', 'Networking', 'Cloud',
    'DevOps', 'VPN', 'PowerShell', 'Python', 'Security', 'SQL'
  ];

  let initialized = false;
  let renderer, camera;
  const group = new THREE.Group();
  const spriteData = [];

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function makeSprite(text) {
    const tw = 256, th = 64;
    const tc = document.createElement('canvas');
    tc.width = tw;
    tc.height = th;
    const ctx = tc.getContext('2d');

    ctx.fillStyle = 'rgba(101,141,242,0.12)';
    roundRect(ctx, 2, 2, tw - 4, th - 4, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(101,141,242,0.6)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 2, 2, tw - 4, th - 4, 10);
    ctx.stroke();

    ctx.fillStyle = '#dde8ff';
    ctx.font = 'bold 26px Ubuntu, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, tw / 2, th / 2);

    return new THREE.CanvasTexture(tc);
  }

  function init() {
    if (initialized) return;
    initialized = true;

    const canvas = document.getElementById('skill-sphere');
    if (!canvas) return;

    const w = wrap.clientWidth || window.innerWidth - 120;
    const h = wrap.clientHeight || 400;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);

    const scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, w / h, 1, 2000);
    camera.position.z = 260;

    const R = 100;
    const n = skills.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    skills.forEach(function (skill, i) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / n);
      const phi = 2 * Math.PI * i / goldenRatio;

      const texture = makeSprite(skill);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);

      sprite.position.set(
        R * Math.sin(theta) * Math.cos(phi),
        R * Math.sin(theta) * Math.sin(phi),
        R * Math.cos(theta)
      );
      sprite.scale.set(50, 12.5, 1);

      group.add(sprite);
      spriteData.push({ sprite: sprite, mat: mat });
    });

    scene.add(group);

    var isHover = false;
    var mouseX = 0, mouseY = 0;
    var tmp = new THREE.Vector3();

    wrap.addEventListener('mouseenter', function () { isHover = true; });
    wrap.addEventListener('mouseleave', function () { isHover = false; });
    wrap.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      mouseX = (e.clientX - r.left - w / 2) / w;
      mouseY = (e.clientY - r.top  - h / 2) / h;
    });

    function animate() {
      requestAnimationFrame(animate);

      var speed = isHover ? 0.0015 : 0.004;
      group.rotation.y += speed + (isHover ? mouseX * 0.006 : 0);
      group.rotation.x += 0.001  + (isHover ? -mouseY * 0.006 : 0);

      spriteData.forEach(function (d) {
        d.sprite.getWorldPosition(tmp);
        tmp.project(camera);
        var depth = (tmp.z + 1) / 2;
        d.mat.opacity = 0.2 + depth * 0.8;
      });

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
      var nw = wrap.clientWidth;
      var nh = wrap.clientHeight;
      if (nw && nh) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    });
  }

  // Init when #about_me becomes active via nav click
  document.querySelectorAll('a.inner-link[href="#about_me"]').forEach(function (link) {
    link.addEventListener('click', function () { setTimeout(init, 60); });
  });

  // Init immediately if already active on load
  if (document.querySelector('#about_me.active')) {
    setTimeout(init, 100);
  }
})();
