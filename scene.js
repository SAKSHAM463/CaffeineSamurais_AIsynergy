/* =========================================================
   Beyond the Fort — procedural 3D Gwalior-inspired hill fort
   Three.js scene: plateau + rampart walls + towers with chhatri domes,
   Man Mandir-style palace block, temple shikhara, floating diya lanterns,
   stars, dusk sky. Camera flies along a path driven by page scroll.
   ========================================================= */
import * as THREE from 'three';

const canvas = document.getElementById('scene-canvas');
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a1438, 0.018);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 8, 46);

/* ---------- Sky dome (gradient shader) ---------- */
const skyGeo = new THREE.SphereGeometry(200, 32, 16);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { uTop: { value: new THREE.Color(0x07061a) }, uMid: { value: new THREE.Color(0x2a1d55) }, uBottom: { value: new THREE.Color(0xc4553a) }, uShift: { value: 0 } },
  vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom; uniform float uShift; varying vec3 vPos;
    void main(){ float h = vPos.y + uShift*0.15;
      vec3 c = mix(uBottom, uMid, smoothstep(-0.05, 0.18, h));
      c = mix(c, uTop, smoothstep(0.18, 0.7, h));
      gl_FragColor = vec4(c,1.0); }`
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

/* ---------- Lights ---------- */
scene.add(new THREE.HemisphereLight(0xffc98a, 0x1a1438, 0.55));
const sun = new THREE.DirectionalLight(0xffa860, 2.2);
sun.position.set(-30, 18, -20);
scene.add(sun);
const rim = new THREE.DirectionalLight(0x6a7bff, 0.6);
rim.position.set(30, 20, 30);
scene.add(rim);

/* Moon / sun disc */
const moon = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshBasicMaterial({ color: 0xffd68a, transparent: true, opacity: .9, fog: false }));
moon.position.set(-45, 22, -120);
scene.add(moon);
const halo = new THREE.Mesh(new THREE.CircleGeometry(14, 48), new THREE.MeshBasicMaterial({ color: 0xe8b04a, transparent: true, opacity: .15, fog: false }));
halo.position.copy(moon.position).add(new THREE.Vector3(0, 0, -1));
scene.add(halo);

/* ---------- Materials ---------- */
const sandstone = new THREE.MeshStandardMaterial({ color: 0xd9a86c, roughness: .85, metalness: .05, flatShading: true });
const sandstoneDark = new THREE.MeshStandardMaterial({ color: 0xa8714a, roughness: .9, flatShading: true });
const tile = new THREE.MeshStandardMaterial({ color: 0x2aa198, roughness: .4, metalness: .3, emissive: 0x0b3b38, emissiveIntensity: .4 });
const gold = new THREE.MeshStandardMaterial({ color: 0xe8b04a, roughness: .3, metalness: .8, emissive: 0x5a3a08, emissiveIntensity: .4 });
const rock = new THREE.MeshStandardMaterial({ color: 0x3b2a4a, roughness: 1, flatShading: true });
const windowMat = new THREE.MeshBasicMaterial({ color: 0xffb860 });

const fort = new THREE.Group();
scene.add(fort);

/* ---------- Plateau (hill) ---------- */
const hillGeo = new THREE.CylinderGeometry(22, 30, 7, 28, 4, false);
const hp = hillGeo.attributes.position;
for (let i = 0; i < hp.count; i++) {
  const y = hp.getY(i);
  if (y < 3.4) {
    const n = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    hp.setX(i, hp.getX(i) * (1 + n * 0.08));
    hp.setZ(i, hp.getZ(i) * (1 + n * 0.08));
  }
}
hillGeo.computeVertexNormals();
const hill = new THREE.Mesh(hillGeo, rock);
hill.scale.set(1.5, 1, .55);
hill.position.y = -3.5;
fort.add(hill);

/* ground plane */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 60, 60), new THREE.MeshStandardMaterial({ color: 0x15102a, roughness: 1, flatShading: true }));
const gp = ground.geometry.attributes.position;
for (let i = 0; i < gp.count; i++) gp.setZ(i, Math.sin(gp.getX(i) * .05) * Math.cos(gp.getY(i) * .04) * 1.5);
ground.geometry.computeVertexNormals();
ground.rotation.x = -Math.PI / 2;
ground.position.y = -7;
scene.add(ground);

/* ---------- Builders ---------- */
function chhatri(scale = 1) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .2, 8), sandstone);
  g.add(base);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1, 6), sandstone);
    p.position.set(Math.cos(a) * .7, .6, Math.sin(a) * .7);
    g.add(p);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .15, 8), sandstoneDark);
  cap.position.y = 1.15; g.add(cap);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.75, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), tile);
  dome.position.y = 1.2; g.add(dome);
  const fin = new THREE.Mesh(new THREE.ConeGeometry(.1, .6, 6), gold);
  fin.position.y = 2.1; g.add(fin);
  g.scale.setScalar(scale);
  return g;
}

function tower(h = 5, r = 1.3) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r * .9, r * 1.1, h, 12), sandstone);
  body.position.y = h / 2; g.add(body);
  // decorative band of blue tiles (Man Mandir motif)
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r * .93, r * .93, .35, 12), tile);
  band.position.y = h * .72; g.add(band);
  const c = chhatri(r * .95);
  c.position.y = h; g.add(c);
  return g;
}

function wallSegment(len, h = 2.6) {
  const g = new THREE.Group();
  const w = new THREE.Mesh(new THREE.BoxGeometry(len, h, .9), sandstone);
  w.position.y = h / 2; g.add(w);
  const n = Math.floor(len / .9);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .95), sandstoneDark);
    m.position.set(-len / 2 + .45 + i * .9, h + .25, 0);
    g.add(m);
  }
  // tile band
  const band = new THREE.Mesh(new THREE.BoxGeometry(len, .25, .95), tile);
  band.position.y = h * .7; g.add(band);
  return g;
}

/* ---------- Rampart ring on plateau ---------- */
const topY = 0;
const pts = [];
const RX = 26, RZ = 10;
const N = 14;
for (let i = 0; i < N; i++) {
  const a = (i / N) * Math.PI * 2;
  pts.push(new THREE.Vector3(Math.cos(a) * RX, topY, Math.sin(a) * RZ));
}
for (let i = 0; i < N; i++) {
  const a = pts[i], b = pts[(i + 1) % N];
  const len = a.distanceTo(b);
  const seg = wallSegment(len);
  seg.position.copy(a).lerp(b, .5);
  seg.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
  fort.add(seg);
  const t = tower(4.2 + (i % 3) * .6, 1.25);
  t.position.copy(a);
  fort.add(t);
}

/* ---------- Palace block (Man Mandir inspired) ---------- */
const palace = new THREE.Group();
const pBody = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 4), sandstone);
pBody.position.y = 2.5; palace.add(pBody);
for (let row = 0; row < 2; row++) {
  for (let i = 0; i < 9; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(.6, .9), windowMat);
    win.position.set(-6 + i * 1.5, 1.6 + row * 2, 2.01);
    palace.add(win);
  }
}
const tileBand = new THREE.Mesh(new THREE.BoxGeometry(14.1, .5, 4.1), tile);
tileBand.position.y = 4.4; palace.add(tileBand);
[-7, -2.4, 2.4, 7].forEach((x, i) => {
  const t = tower(6.5 + (i % 2), 1.1);
  t.position.set(x, 0, 2);
  palace.add(t);
});
palace.position.set(-6, 0, 2);
fort.add(palace);

/* ---------- Temple shikhara (Teli ka Mandir / Sas-Bahu hint) ---------- */
function shikhara(h = 9) {
  const g = new THREE.Group();
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), sandstoneDark);
  plinth.position.y = .5; g.add(plinth);
  for (let i = 0; i < 7; i++) {
    const s = 1 - i / 8;
    const tier = new THREE.Mesh(new THREE.BoxGeometry(3.2 * s, h / 8, 3.2 * s), i % 2 ? sandstoneDark : sandstone);
    tier.position.y = 1 + i * (h / 8) + h / 16;
    g.add(tier);
  }
  const amalaka = new THREE.Mesh(new THREE.TorusGeometry(.5, .25, 8, 16), gold);
  amalaka.rotation.x = Math.PI / 2;
  amalaka.position.y = 1 + h * .88; g.add(amalaka);
  const kalash = new THREE.Mesh(new THREE.ConeGeometry(.25, 1, 8), gold);
  kalash.position.y = 1 + h * .95; g.add(kalash);
  return g;
}
const temple1 = shikhara(10); temple1.position.set(12, 0, -2); fort.add(temple1);
const temple2 = shikhara(7); temple2.position.set(17, 0, 3); temple2.rotation.y = .4; fort.add(temple2);

/* scattered small chhatris around the city below */
const city = new THREE.Group();
for (let i = 0; i < 70; i++) {
  const r = 40 + Math.random() * 60;
  const a = Math.random() * Math.PI * 2;
  const h = .8 + Math.random() * 2.5;
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.5 + Math.random() * 2, h, 1.5 + Math.random() * 2), i % 3 ? sandstoneDark : sandstone);
  b.position.set(Math.cos(a) * r, -7 + h / 2, Math.sin(a) * r * .8);
  city.add(b);
  if (Math.random() > .6) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(.35, .5), windowMat);
    l.position.set(b.position.x, b.position.y, b.position.z + 1.2);
    city.add(l);
  }
  if (i % 9 === 0) {
    const c = chhatri(1.1);
    c.position.set(b.position.x, -7 + h, b.position.z);
    city.add(c);
  }
}
scene.add(city);

/* ---------- Stars ---------- */
const starGeo = new THREE.BufferGeometry();
const starCount = isMobile ? 900 : 2000;
const sp = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const r = 150 + Math.random() * 40;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.random() * Math.PI * .45;
  sp[i * 3] = r * Math.sin(ph) * Math.cos(th);
  sp[i * 3 + 1] = r * Math.cos(ph) + 5;
  sp[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xfff1d0, size: .6, sizeAttenuation: true, transparent: true, opacity: .85, fog: false }));
scene.add(stars);

/* ---------- Floating diya lanterns (glowing sprites) ---------- */
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,230,160,1)');
  g.addColorStop(.25, 'rgba(255,170,70,.9)');
  g.addColorStop(.6, 'rgba(196,85,58,.25)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const lanternCount = isMobile ? 160 : 380;
const lg = new THREE.BufferGeometry();
const lp = new Float32Array(lanternCount * 3);
const lseed = new Float32Array(lanternCount);
for (let i = 0; i < lanternCount; i++) {
  lp[i * 3] = (Math.random() - .5) * 120;
  lp[i * 3 + 1] = -6 + Math.random() * 40;
  lp[i * 3 + 2] = (Math.random() - .5) * 90;
  lseed[i] = Math.random() * 100;
}
lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
const lanterns = new THREE.Points(lg, new THREE.PointsMaterial({
  size: isMobile ? 1.6 : 1.3, map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff
}));
scene.add(lanterns);

/* warm point lights inside fort */
const fortLight = new THREE.PointLight(0xffa040, 30, 40, 2);
fortLight.position.set(-6, 4, 6);
scene.add(fortLight);
const templeLight = new THREE.PointLight(0xff7040, 20, 30, 2);
templeLight.position.set(14, 6, 4);
scene.add(templeLight);

/* ---------- Camera path driven by scroll ---------- */
const camPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 8, 52),
  new THREE.Vector3(-28, 12, 34),
  new THREE.Vector3(-36, 6, 6),
  new THREE.Vector3(-18, 16, -26),
  new THREE.Vector3(14, 22, -30),
  new THREE.Vector3(38, 10, -4),
  new THREE.Vector3(30, 5, 26),
  new THREE.Vector3(4, 30, 40),
  new THREE.Vector3(0, 9, 50)
]);
const lookPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3, 0),
  new THREE.Vector3(-6, 3, 2),
  new THREE.Vector3(-6, 4, 0),
  new THREE.Vector3(0, 2, 0),
  new THREE.Vector3(12, 5, 0),
  new THREE.Vector3(14, 4, 0),
  new THREE.Vector3(6, 2, 0),
  new THREE.Vector3(0, -2, 0),
  new THREE.Vector3(0, 3, 0)
]);

let scrollT = 0, smoothT = 0;
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
window.addEventListener('pointermove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollT = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* intro fly-in */
let intro = 0;
const clock = new THREE.Clock();
const tmp = new THREE.Vector3(), look = new THREE.Vector3();

function animate() {
  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;
  intro = Math.min(1, intro + dt * .35);
  const ie = 1 - Math.pow(1 - intro, 3);

  smoothT += (scrollT - smoothT) * Math.min(1, dt * 3);
  mouse.sx += (mouse.x - mouse.sx) * .05;
  mouse.sy += (mouse.y - mouse.sy) * .05;

  camPath.getPointAt(smoothT, tmp);
  lookPath.getPointAt(smoothT, look);
  // intro: start high and far, descend
  tmp.y += (1 - ie) * 30; tmp.z += (1 - ie) * 40;
  camera.position.set(tmp.x + mouse.sx * 2.5, tmp.y - mouse.sy * 1.5, tmp.z);
  camera.lookAt(look);

  // drift lanterns upward
  const arr = lg.attributes.position.array;
  for (let i = 0; i < lanternCount; i++) {
    arr[i * 3 + 1] += dt * (.6 + (lseed[i] % 1) * .8);
    arr[i * 3] += Math.sin(t * .5 + lseed[i]) * dt * .3;
    if (arr[i * 3 + 1] > 38) arr[i * 3 + 1] = -6;
  }
  lg.attributes.position.needsUpdate = true;

  stars.rotation.y = t * .004;
  fortLight.intensity = 26 + Math.sin(t * 7) * 3 + Math.sin(t * 13) * 2;
  templeLight.intensity = 18 + Math.sin(t * 5 + 1) * 3;
  skyMat.uniforms.uShift.value = smoothT;
  moon.position.y = 22 + smoothT * 14;
  halo.position.y = moon.position.y;
  halo.scale.setScalar(1 + Math.sin(t * .8) * .05);
  fort.rotation.y = Math.sin(t * .1) * .02;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
window.dispatchEvent(new CustomEvent('scene:ready'));
window.__sceneReady = true;
