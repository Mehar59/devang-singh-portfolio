/* Material library — one canvas, one sphere, re-rendered into each .mat__ball's rectangle (scissor). */
(function () {
  const canvas = document.getElementById('materials3d');
  const balls = Array.from(document.querySelectorAll('.mat'));
  const TEX = window.MATERIAL_TEX || {};
  if (!canvas || !balls.length) return;

  const fallback = () => {
    document.documentElement.classList.add('no-webgl');
    balls.forEach(b => { b.querySelector('.mat__ball').style.backgroundImage = `url(${TEX[b.dataset.mat]})`; });
  };
  if (!window.THREE) return fallback();

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { return fallback(); }

  const lite = matchMedia('(max-width: 860px), (pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  camera.position.set(0, 0, 4.4);

  // a small procedural "studio" for reflections (softboxes on a dark room)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x1a1714);
  const box = (w, h, x, y, z, c, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); studio.add(m);
  };
  box(6, 3, -5, 4, 3, 0xfff1dc, 5);
  box(3, 6, 6, 1, 2, 0xffe2b8, 2.5);
  box(8, 2, 0, -2, -7, 0x9fc6ca, 1.2);
  box(10, 10, 0, 9, 0, 0xffffff, 0.8);
  scene.environment = pmrem.fromScene(studio, 0.03).texture;

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xfff0dc, 2.2);
  key.position.set(-3, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc8a46e, 1.4);
  rim.position.set(4, 1, -3);
  scene.add(rim);

  const loader = new THREE.TextureLoader();
  const tex = k => {
    const t = loader.load(TEX[k]);
    t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
    t.repeat.set(2, 1);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const spec = {
    statuario: { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 },
    walnut: { roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 },
    teal: { roughness: 0.95, sheen: 1, sheenColor: new THREE.Color(0x9fd2d2), sheenRoughness: 0.5 },
    onyx: { roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02 },
    travertine: { roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.2 },
    stone: { roughness: 0.85 },
    fluted: { roughness: 0.6, bump: true }
  };
  const mats = {};
  Object.keys(spec).forEach(k => {
    const s = Object.assign({}, spec[k]);
    const bump = s.bump; delete s.bump;
    const m = new THREE.MeshPhysicalMaterial(Object.assign({ map: tex(k), envMapIntensity: 0.9 }, s));
    if (bump) { m.bumpMap = m.map; m.bumpScale = 0.02; }
    mats[k] = m;
  });

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, lite ? 64 : 96, lite ? 40 : 64), mats.statuario);
  scene.add(sphere);

  const items = balls.map((el, i) => ({
    el: el.querySelector('.mat__ball'), key: el.dataset.mat,
    rot: i * 0.9, speed: 0.25, targetSpeed: 0.25, scale: 1, targetScale: 1, tilt: 0, targetTilt: 0
  }));
  items.forEach(it => {
    it.el.addEventListener('pointerenter', () => { it.targetSpeed = 2.2; it.targetScale = 1.08; });
    it.el.addEventListener('pointerleave', () => { it.targetSpeed = 0.25; it.targetScale = 1; it.targetTilt = 0; });
    it.el.addEventListener('pointermove', e => {
      const r = it.el.getBoundingClientRect();
      it.targetTilt = ((e.clientY - r.top) / r.height - 0.5) * 0.8;
      it.targetSpeed = ((e.clientX - r.left) / r.width - 0.5) * 6;
    });
  });

  let visible = false, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(canvas);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    resize();
    const cr = canvas.getBoundingClientRect();
    renderer.setScissor(0, 0, cr.width, cr.height);
    renderer.clear();
    items.forEach(it => {
      it.speed += (it.targetSpeed - it.speed) * 0.08;
      it.scale += (it.targetScale - it.scale) * 0.1;
      it.tilt += (it.targetTilt - it.tilt) * 0.08;
      it.rot += it.speed * dt;
      const r = it.el.getBoundingClientRect();
      if (r.bottom < cr.top || r.top > cr.bottom || r.width < 2) return;
      const left = r.left - cr.left, bottom = cr.bottom - r.bottom;
      // render into a slightly larger square so the hover-scaled ball isn't clipped
      const pad = r.width * 0.12;
      renderer.setViewport(left - pad, bottom - pad, r.width + pad * 2, r.height + pad * 2);
      renderer.setScissor(left - pad, bottom - pad, r.width + pad * 2, r.height + pad * 2);
      camera.aspect = 1; camera.updateProjectionMatrix();
      sphere.material = mats[it.key];
      sphere.rotation.set(it.tilt, it.rot, 0);
      sphere.scale.setScalar(it.scale * 0.86);
      renderer.render(scene, camera);
    });
  }
  requestAnimationFrame(frame);
})();
