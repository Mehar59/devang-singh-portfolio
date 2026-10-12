/* Hero — Plan 01 extruded live in WebGL (three.js r149, classic build). */
(function () {
  const canvas = document.getElementById('hero3d');
  if (!canvas || !window.THREE) return;
  const P = window.PLAN;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // phones get a lighter render: lower pixel ratio, smaller shadow map, ~30fps
  const lite = matchMedia('(max-width: 860px), (pointer: coarse)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { document.documentElement.classList.add('no-webgl'); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const BG = 0x0d0c0b;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 110, 230);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 600);

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x15110d, 0.35));
  const sun = new THREE.DirectionalLight(0xffd6a0, 1.9);
  sun.position.set(-38, 62, 26);
  sun.castShadow = true;
  sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 200 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x8fb7c0, 0.45);
  rim.position.set(40, 20, -40);
  scene.add(rim);

  // ---------- materials ----------
  const M = {
    ground: new THREE.MeshStandardMaterial({ color: 0x0b0a09, roughness: 1 }),
    slab: new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.92 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xd8cfc1, roughness: 0.9 }),
    edge: new THREE.LineBasicMaterial({ color: 0xc8a46e, transparent: true, opacity: 0.55 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fc6ca, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.28 }),
    bed: new THREE.MeshStandardMaterial({ color: 0xd8d1c5, roughness: 0.9 }),
    sofa: new THREE.MeshStandardMaterial({ color: 0x4f8a8b, roughness: 0.8 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.6 }),
    chair: new THREE.MeshStandardMaterial({ color: 0x8d8780, roughness: 0.9 }),
    stone: new THREE.MeshStandardMaterial({ color: 0xbdb5a8, roughness: 0.35 }),
    stair: new THREE.MeshStandardMaterial({ color: 0xf1ece4, roughness: 0.7 }),
    line: new THREE.LineBasicMaterial({ color: 0xc8a46e, transparent: true, opacity: 0.35 })
  };

  const model = new THREE.Group();
  model.position.set(-P.size[0] / 2, 0, -P.size[1] / 2);
  scene.add(model);

  // ground + subtle grid
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), M.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.62;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(220, 110, 0x3a3128, 0x1f1b17);
  grid.position.y = -0.6;
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  scene.add(grid);

  // slab
  const slab = new THREE.Mesh(new THREE.BoxGeometry(P.size[0] + 1, 0.6, P.size[1] + 1), M.slab);
  slab.position.set(P.size[0] / 2, -0.3, P.size[1] / 2);
  slab.receiveShadow = true;
  model.add(slab);

  // ---------- walls ----------
  const WALL_H = 10, WALL_T = 0.55;
  const rising = []; // meshes that grow from the floor
  function addWall(seg, mat, h, t, withEdges) {
    const [x1, z1, x2, z2] = seg;
    const len = Math.hypot(x2 - x1, z2 - z1) + t;
    const geo = new THREE.BoxGeometry(len, h, t);
    geo.translate(0, h / 2, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
    mesh.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    mesh.castShadow = mat !== M.glass;
    mesh.receiveShadow = true;
    if (withEdges) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), M.edge));
    mesh.scale.y = 0.02;
    model.add(mesh);
    rising.push({ mesh, order: (z1 + z2) / 2 + Math.random() * 6 });
    return mesh;
  }
  P.walls.forEach(w => addWall(w, M.wall, WALL_H, WALL_T, true));
  P.glass.forEach(w => addWall(w, M.glass, WALL_H * 0.85, 0.15, false));

  // ---------- furniture ----------
  const props = [];
  function addBox(x, z, w, d, h, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    geo.translate(0, h / 2, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, z);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.scale.y = 0.02;
    model.add(mesh);
    props.push(mesh);
    return mesh;
  }
  P.furniture.forEach(([x, z, w, d, h, kind]) => addBox(x, z, w, d, h, M[kind] || M.wood));
  P.rounds.forEach(([x, z, r, h]) => {
    const geo = new THREE.CylinderGeometry(r, r, h, 40);
    geo.translate(0, h / 2, 0);
    const mesh = new THREE.Mesh(geo, M.stone);
    mesh.position.set(x, 0, z);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.scale.y = 0.02;
    model.add(mesh);
    props.push(mesh);
  });
  // pillows on beds
  [[8.5, 5.2], [24.5, 44.2]].forEach(([x, z]) => {
    addBox(x - 1.5, z, 2.4, 1.1, 2.2, M.stair);
    addBox(x + 1.5, z, 2.4, 1.1, 2.2, M.stair);
  });

  // dog-leg stair: flight A runs west along the south edge, landing, flight B runs east
  const RISE = 0.56;
  for (let i = 0; i < 9; i++) addBox(11 - i * 0.82, 36.6, 0.82, 2.6, (i + 1) * RISE, M.stair);
  addBox(2.0, 33.8, 3.0, 8.2, 9 * RISE + RISE, M.stair);
  for (let i = 0; i < 8; i++) addBox(4.0 + i * 0.9, 31.0, 0.9, 2.6, (10 + i + 1) * RISE, M.stair);

  // ---------- floor annotations ----------
  function textTexture(name, sub) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 300;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(236,230,220,0.92)';
    g.textAlign = 'center';
    g.font = '600 92px "Inter Tight", Arial, sans-serif';
    g.fillText(name, 512, 130);
    g.fillStyle = 'rgba(200,164,110,0.95)';
    g.font = '400 64px "JetBrains Mono", monospace';
    g.fillText(sub, 512, 232);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.encoding = THREE.sRGBEncoding;
    return t;
  }
  const labels = [];
  function addLabel(name, sub, x, z, w, rot) {
    const mat = new THREE.MeshBasicMaterial({ map: textTexture(name, sub), transparent: true, opacity: 0, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 300 / 1024), mat);
    mesh.rotation.x = -Math.PI / 2;
    if (rot) mesh.rotation.z = rot;
    mesh.position.set(x, 0.03, z);
    mesh.renderOrder = 2;
    model.add(mesh);
    labels.push(mat);
  }

  // void markers (OTS / double height) and dimension lines
  const lp = [];
  P.voids.forEach(([x1, z1, x2, z2]) => {
    lp.push(x1, 0.04, z1, x2, 0.04, z1, x2, 0.04, z1, x2, 0.04, z2, x2, 0.04, z2, x1, 0.04, z2, x1, 0.04, z2, x1, 0.04, z1,
      x1, 0.04, z1, x2, 0.04, z2, x2, 0.04, z1, x1, 0.04, z2);
  });
  const D = -3.2, R = P.size[0] + 3.2;
  lp.push(0, 0, D, 40, 0, D, 0, 0, D - 0.8, 0, 0, D + 0.8, 40, 0, D - 0.8, 40, 0, D + 0.8);
  lp.push(R, 0, 0, R, 0, 55, R - 0.8, 0, 0, R + 0.8, 0, 0, R - 0.8, 0, 55, R + 0.8, 0, 55);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  const annot = new THREE.LineSegments(lineGeo, M.line);
  model.add(annot);

  // labels are created once fonts are ready so the canvas text uses the real typefaces
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => {
    P.rooms.forEach(([n, s, x, z, w]) => addLabel(n, s, x, z, w));
    addLabel("40'-0\"", 'PLOT WIDTH', 20, D - 2.2, 8);
    addLabel("55'-0\"", 'PLOT DEPTH', R + 2.4, 27.5, 8, Math.PI / 2);
    addLabel('ENTRY', '▲', 11.5, 54, 4);
    if (state.built) labels.forEach(m => (m.opacity = 0.9));
  });

  // ---------- camera rig ----------
  const state = {
    radius: 150, polar: 0.0001, azimuth: 0, // starts as a top-down plan view
    mx: 0, my: 0, tx: 0, ty: 0,
    scroll: 0, idle: 0, built: false
  };
  const target = new THREE.Vector3(0, 2.5, 0);

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // shift the model to the right on wide screens so the headline has room
    camera.filmOffset = w > 860 ? -6 : 0;
    // on portrait screens, push the model into the upper half above the headline
    if (camera.aspect < 1) camera.setViewOffset(w, h, 0, h * (camera.aspect < 0.6 ? 0.2 : 0.1), w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    state.fit = camera.aspect < 1 ? Math.max(1.3, 0.78 / Math.max(camera.aspect, 0.4)) : 1;
  }
  layout();
  window.addEventListener('resize', layout);

  window.addEventListener('pointermove', e => {
    state.tx = (e.clientX / window.innerWidth) * 2 - 1;
    state.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---------- render loop (paused when off-screen) ----------
  let visible = true, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    if (lite && now - last < 30) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    state.mx += (state.tx - state.mx) * 0.045;
    state.my += (state.ty - state.my) * 0.045;
    if (state.built && !reduce) state.idle += dt * 0.035;

    const s = state.scroll;
    const az = state.azimuth + state.idle + state.mx * 0.32 * (state.built ? 1 : 0) + s * 0.6;
    const pol = Math.min(1.35, state.polar + state.my * 0.08 * (state.built ? 1 : 0) + s * 0.2);
    const rad = state.radius * (state.fit || 1) * (1 - s * 0.32);

    camera.position.set(
      rad * Math.sin(pol) * Math.sin(az),
      rad * Math.cos(pol) + target.y,
      rad * Math.sin(pol) * Math.cos(az)
    );
    camera.lookAt(target);
    scene.fog.near = rad * 0.75;
    scene.fog.far = rad * 1.8;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  // ---------- public API used by main.js ----------
  window.Hero3D = {
    build() {
      const g = window.gsap;
      if (!g || reduce) {
        rising.forEach(r => (r.mesh.scale.y = 1));
        props.forEach(p => (p.scale.y = 1));
        labels.forEach(m => (m.opacity = 0.9));
        Object.assign(state, { radius: 150, polar: 0.9, azimuth: 0.62, built: true });
        return;
      }
      const tl = g.timeline();
      tl.to(labels, { opacity: 0.9, duration: 1, stagger: 0.04, ease: 'power2.out' }, 0);
      tl.to(state, { radius: 150, polar: 0.9, azimuth: 0.62, duration: 3.2, ease: 'power3.inOut' }, 0.5);
      rising.sort((a, b) => a.order - b.order);
      tl.to(rising.map(r => r.mesh.scale), { y: 1, duration: 1.6, ease: 'expo.out', stagger: 0.035 }, 1.0);
      tl.to(props.map(p => p.scale), { y: 1, duration: 1.2, ease: 'back.out(1.6)', stagger: 0.02 }, 2.0);
      tl.add(() => { state.built = true; }, 2.6);
      return tl;
    },
    setScroll(p) { state.scroll = p; }
  };
})();
