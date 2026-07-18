// ============================================================
// Shadow Ace Squadron — cinematic hero: GOLDEN HOUR PURSUIT
// A lone jet banks through sunset cloud tops, a missile on its
// six trailing smoke, countermeasure flares blazing. All
// procedural — no external assets.
// ============================================================
import * as THREE from "three";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x8a4a28, 0.0042);

const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 900);

// ---------------- procedural textures ----------------
function radialTex(inner, outer, size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.35, outer);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const softTex = radialTex("rgba(255,255,255,1)", "rgba(255,220,180,0.45)");
const cloudTex = radialTex("rgba(255,225,200,0.55)", "rgba(150,110,110,0.18)", 256);
const smokeTex = radialTex("rgba(235,225,215,0.85)", "rgba(120,100,95,0.30)", 128);
const flareTex = radialTex("rgba(255,245,215,1)", "rgba(255,150,60,0.55)");
const burnTex = radialTex("rgba(255,240,220,1)", "rgba(255,140,70,0.5)");

// ---------------- sky dome (gradient) ----------------
{
  const c = document.createElement("canvas");
  c.width = 4; c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.00, "#131c33");   // zenith — cool indigo
  grad.addColorStop(0.42, "#3c2c47");   // violet transition
  grad.addColorStop(0.60, "#8a4132");   // burnt orange
  grad.addColorStop(0.715, "#e07a35");  // horizon glow
  grad.addColorStop(0.76, "#ffb257");   // sun band
  grad.addColorStop(0.82, "#a04c22");   // below horizon haze
  grad.addColorStop(1.00, "#341a10");   // under-cloud murk
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 512);
  const skyTex = new THREE.CanvasTexture(c);
  skyTex.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 24),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
  );
  scene.add(dome);
}

// ---------------- sun + glow ----------------
const SUN = new THREE.Vector3(-190, 30, -300);
{
  const glow3 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTex("rgba(255,190,120,0.55)", "rgba(255,140,70,0.18)", 256),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
  }));
  glow3.position.copy(SUN); glow3.scale.setScalar(340); scene.add(glow3);
  const glow2 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTex("rgba(255,215,150,0.9)", "rgba(255,160,80,0.35)", 256),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
  }));
  glow2.position.copy(SUN); glow2.scale.setScalar(150); scene.add(glow2);
  const disc = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTex("rgba(255,248,230,1)", "rgba(255,205,130,0.9)", 256),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
  }));
  disc.position.copy(SUN); disc.scale.setScalar(56); scene.add(disc);
}

// ---------------- lighting: teal & orange grade ----------------
scene.add(new THREE.AmbientLight(0x3a2c3e, 1.0));
const sunLight = new THREE.DirectionalLight(0xffa050, 3.2);
sunLight.position.copy(SUN);
scene.add(sunLight);
const coolFill = new THREE.DirectionalLight(0x2e5a6e, 0.8);
coolFill.position.set(190, 60, 300);
scene.add(coolFill);

// ---------------- cloud decks ----------------
const clouds = new THREE.Group();
{
  // low deck — the "floor" of the scene, sun-warmed
  for (let i = 0; i < 85; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: cloudTex, transparent: true, depthWrite: false,
      opacity: 0.12 + Math.random() * 0.16,
      color: new THREE.Color().setHSL(0.05 + Math.random() * 0.04, 0.5, 0.42 + Math.random() * 0.2),
    }));
    s.position.set((Math.random() - 0.5) * 480, -34 - Math.random() * 38, (Math.random() - 0.5) * 480);
    const sc = 42 + Math.random() * 85;
    s.scale.set(sc, sc * 0.38, 1);
    s.userData.drift = 0.5 + Math.random() * 1.0;
    clouds.add(s);
  }
  // distant towers near the sun — dramatic backlit masses
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: cloudTex, transparent: true, depthWrite: false,
      opacity: 0.2 + Math.random() * 0.2, color: 0x5a3040, fog: false,
    }));
    const a = -0.55 - Math.random() * 0.5; // cluster around the sun azimuth
    s.position.set(Math.sin(a) * 330, -8 + Math.random() * 34, Math.cos(a) * -330 + (Math.random() - 0.5) * 60);
    const sc = 60 + Math.random() * 120;
    s.scale.set(sc, sc * 0.55, 1);
    s.userData.drift = 0.15;
    clouds.add(s);
  }
  scene.add(clouds);
}

// ---------------- trail emitter (smoke / vortices) ----------------
class Trail {
  constructor(n, tex, baseColor) {
    this.pool = [];
    this.cursor = 0;
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false, opacity: 0, color: baseColor,
      }));
      s.visible = false;
      scene.add(s);
      this.pool.push({ s, life: 0, maxLife: 1, grow: 0, vel: new THREE.Vector3() });
    }
  }
  emit(pos, scale, life, grow, jitter = 0, vel = null) {
    const p = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % this.pool.length;
    p.life = p.maxLife = life;
    p.grow = grow;
    p.s.visible = true;
    p.s.position.copy(pos);
    if (jitter) p.s.position.add(new THREE.Vector3(
      (Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter));
    p.s.scale.setScalar(scale);
    p.vel.copy(vel || ZERO);
  }
  update(dt) {
    for (const p of this.pool) {
      if (!p.s.visible) continue;
      p.life -= dt;
      if (p.life <= 0) { p.s.visible = false; continue; }
      const k = p.life / p.maxLife;
      p.s.material.opacity = 0.5 * k * k;
      p.s.scale.addScalar(p.grow * dt);
      p.s.position.addScaledVector(p.vel, dt);
    }
  }
}
const ZERO = new THREE.Vector3();
const missileSmoke = new Trail(320, smokeTex, 0xd8cfc6);
const wingVortL = new Trail(70, smokeTex, 0xf0e8e2);
const wingVortR = new Trail(70, smokeTex, 0xf0e8e2);

// ---------------- jet ----------------
function buildJet() {
  const jet = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({ color: 0x252a35, metalness: 0.85, roughness: 0.35, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x12161f, metalness: 0.7, roughness: 0.45, flatShading: true });

  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.6, 7.4, 7), hull);
  fus.rotation.x = Math.PI / 2; fus.scale.set(1, 1, 0.62); jet.add(fus);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 2.3, 7), hull);
  nose.rotation.x = Math.PI / 2; nose.position.z = -4.8; nose.scale.set(1, 1, 0.62); jet.add(nose);
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x35201a, metalness: 0.95, roughness: 0.08 }));
  canopy.scale.set(0.8, 0.55, 1.9); canopy.position.set(0, 0.28, -2.4); jet.add(canopy);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0); wingShape.lineTo(4.4, 2.6); wingShape.lineTo(4.4, 3.6);
  wingShape.lineTo(0.4, 2.4); wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.1, bevelEnabled: false });
  const wingL = new THREE.Mesh(wingGeo, hull);
  wingL.rotation.x = Math.PI / 2; wingL.position.set(0.25, 0, -1.4); jet.add(wingL);
  const wingR = wingL.clone(); wingR.scale.x = -1; wingR.position.x = -0.25; jet.add(wingR);

  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0); tailShape.lineTo(1.5, 0.4); tailShape.lineTo(1.9, 1.7);
  tailShape.lineTo(0.9, 1.5); tailShape.closePath();
  const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.08, bevelEnabled: false });
  const tailL = new THREE.Mesh(tailGeo, dark);
  tailL.rotation.y = Math.PI / 2; tailL.rotation.z = 0.5; tailL.position.set(0.62, 0.1, 1.7); jet.add(tailL);
  const tailR = new THREE.Mesh(tailGeo, dark);
  tailR.rotation.y = Math.PI / 2; tailR.rotation.z = -0.5; tailR.scale.z = -1;
  tailR.position.set(-0.62, 0.1, 1.7); jet.add(tailR);

  const stabShape = new THREE.Shape();
  stabShape.moveTo(0, 0); stabShape.lineTo(1.9, 0.9); stabShape.lineTo(1.9, 1.5);
  stabShape.lineTo(0.3, 1.1); stabShape.closePath();
  const stabGeo = new THREE.ExtrudeGeometry(stabShape, { depth: 0.07, bevelEnabled: false });
  const stabL = new THREE.Mesh(stabGeo, dark);
  stabL.rotation.x = Math.PI / 2; stabL.position.set(0.3, 0, 2.2); jet.add(stabL);
  const stabR = stabL.clone(); stabR.scale.x = -1; stabR.position.x = -0.3; jet.add(stabR);

  for (const sx of [-0.36, 0.36]) {
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.5, 8), dark);
    noz.rotation.x = Math.PI / 2; noz.position.set(sx, -0.05, 3.75); jet.add(noz);
  }
  const burners = [];
  for (const sx of [-0.36, 0.36]) {
    const b = new THREE.Sprite(new THREE.SpriteMaterial({
      map: burnTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0xffc078,
    }));
    b.position.set(sx, -0.05, 4.15); b.scale.setScalar(1.2); jet.add(b);
    burners.push(b);
  }
  const burnerLight = new THREE.PointLight(0xff9040, 5, 24, 1.8);
  burnerLight.position.set(0, 0, 4.4); jet.add(burnerLight);
  jet.userData = { burners, burnerLight };
  return jet;
}
const jet = buildJet();
scene.add(jet);

// ---------------- missile ----------------
const missile = new THREE.Group();
{
  const body = new THREE.MeshStandardMaterial({ color: 0x8a8d94, metalness: 0.85, roughness: 0.3 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.6, 8), body);
  m.rotation.x = Math.PI / 2; missile.add(m);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.55, 8), body);
  tip.rotation.x = Math.PI / 2; tip.position.z = -1.55; missile.add(tip);
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.5), body);
    fin.position.z = 1.05;
    fin.rotation.z = (i * Math.PI) / 2;
    fin.position.x = Math.cos((i * Math.PI) / 2) * 0.25;
    fin.position.y = Math.sin((i * Math.PI) / 2) * 0.25;
    missile.add(fin);
  }
  const exhaust = new THREE.Sprite(new THREE.SpriteMaterial({
    map: burnTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, color: 0xffd9a0,
  }));
  exhaust.position.z = 1.55; exhaust.scale.setScalar(0.9); missile.add(exhaust);
  const mLight = new THREE.PointLight(0xffb060, 2.5, 14, 2);
  mLight.position.z = 1.7; missile.add(mLight);
  scene.add(missile);
}

// ---------------- countermeasure flares ----------------
const MAX_FLARES = 90;
const flarePool = [];
for (let i = 0; i < MAX_FLARES; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: flareTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0,
  }));
  s.visible = false;
  scene.add(s);
  flarePool.push({ sprite: s, life: 0, vel: new THREE.Vector3() });
}
let flareCursor = 0;
const flareLight = new THREE.PointLight(0xffc060, 0, 60, 1.6);
scene.add(flareLight);
function popFlares(count) {
  const origin = new THREE.Vector3();
  jet.getWorldPosition(origin);
  const back = new THREE.Vector3(0, 0, 1).applyQuaternion(jet.quaternion);
  for (let i = 0; i < count; i++) {
    const f = flarePool[flareCursor];
    flareCursor = (flareCursor + 1) % MAX_FLARES;
    f.life = 1.15;
    f.sprite.visible = true;
    f.sprite.position.copy(origin).addScaledVector(back, 3.2);
    f.vel.set((Math.random() - 0.5) * 11, -4 - Math.random() * 6, (Math.random() - 0.5) * 11)
      .addScaledVector(back, 10 + Math.random() * 6);
    f.sprite.scale.setScalar(1.5 + Math.random() * 1.2);
  }
  flareLight.position.copy(origin).addScaledVector(back, 4);
  flareLight.intensity = 46;
}

// ---------------- lens flare ghosts (sun) ----------------
const lensGroup = new THREE.Group();
scene.add(lensGroup);
const lensSprites = [];
{
  const colors = [0xffd9a8, 0xffb257, 0xff8a4a, 0x7fd8d0, 0xffe2c0];
  const scales = [0.11, 0.05, 0.032, 0.065, 0.024];
  const offsets = [0.32, 0.52, 0.7, 0.88, 1.06];
  for (let i = 0; i < colors.length; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: softTex, color: colors[i], transparent: true,
      opacity: 0.2, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false,
    }));
    s.scale.setScalar(scales[i]);
    lensGroup.add(s);
    lensSprites.push({ sprite: s, k: offsets[i] });
  }
}
function updateLensFlare() {
  const ndc = SUN.clone().project(camera);
  const on = ndc.z < 1 && Math.abs(ndc.x) < 1.2 && Math.abs(ndc.y) < 1.2;
  lensGroup.visible = on;
  if (!on) return;
  for (const { sprite, k } of lensSprites) {
    sprite.position.copy(new THREE.Vector3(ndc.x * (1 - k), ndc.y * (1 - k), 0.5).unproject(camera));
  }
}

// ---------------- flight choreography ----------------
const clock = new THREE.Clock();
let scrollY = 0;
window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

const jetPos = new THREE.Vector3();
const tmp = new THREE.Vector3();
const mPos = new THREE.Vector3();
const mAhead = new THREE.Vector3();
let nextFlareAt = 2.2;
let smokeAcc = 0, vortAcc = 0;

function flightPos(t, out) {
  const R = 27;
  out.set(
    Math.sin(t * 0.20) * R,
    5 + Math.sin(t * 0.14) * 5.5,
    Math.sin(t * 0.40) * R * 0.55
  );
  return out;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // --- jet ---
  flightPos(t, jetPos);
  flightPos(t + 0.12, tmp);
  jet.position.copy(jetPos);
  const dir = tmp.clone().sub(jetPos);
  jet.lookAt(tmp);
  jet.rotateY(Math.PI);
  const bank = THREE.MathUtils.clamp(-dir.x * 0.38, -1.15, 1.15);
  jet.rotateZ(bank);
  const { burners, burnerLight } = jet.userData;
  const flick = 0.9 + Math.random() * 0.4;
  burners.forEach((b) => b.scale.setScalar(1.1 * flick));
  burnerLight.intensity = 4.6 * flick;

  // wingtip vortices during hard banking
  vortAcc += dt;
  if (Math.abs(bank) > 0.55 && vortAcc > 0.028) {
    vortAcc = 0;
    const q = jet.quaternion;
    const tipL = new THREE.Vector3(4.5, 0, 1.2).applyQuaternion(q).add(jetPos);
    const tipR = new THREE.Vector3(-4.5, 0, 1.2).applyQuaternion(q).add(jetPos);
    wingVortL.emit(tipL, 0.5, 1.1, 1.4, 0.1);
    wingVortR.emit(tipR, 0.5, 1.1, 1.4, 0.1);
  }

  // --- missile: pursues along the path, weaving, never quite catching ---
  const lag = 0.62 + Math.sin(t * 0.23) * 0.22;         // gains and falls back
  flightPos(t - lag, mPos);
  flightPos(t - lag + 0.1, mAhead);
  const weave = Math.sin(t * 2.1) * 1.6;
  const wv = new THREE.Vector3(Math.cos(t * 0.2), 0.4 * Math.sin(t * 1.3), 0).multiplyScalar(weave * 0.5);
  mPos.add(wv);
  missile.position.copy(mPos);
  missile.lookAt(mAhead.add(wv));
  missile.rotateY(Math.PI);

  smokeAcc += dt;
  if (smokeAcc > 0.022) {
    smokeAcc = 0;
    const back = new THREE.Vector3(0, 0, 1.8).applyQuaternion(missile.quaternion).add(mPos);
    missileSmoke.emit(back, 0.65 + Math.random() * 0.3, 2.6, 2.1, 0.16,
      new THREE.Vector3(0, 0.35, 0));
  }

  missileSmoke.update(dt);
  wingVortL.update(dt);
  wingVortR.update(dt);

  // --- flares ---
  if (t > nextFlareAt) {
    popFlares(8 + Math.floor(Math.random() * 6));
    nextFlareAt = t + 2.6 + Math.random() * 3.4;
  }
  flareLight.intensity *= Math.pow(0.06, dt); // fast decay
  for (const f of flarePool) {
    if (!f.sprite.visible) continue;
    f.life -= dt * 0.6;
    if (f.life <= 0) { f.sprite.visible = false; continue; }
    f.vel.y -= 8 * dt;
    f.vel.multiplyScalar(1 - 0.5 * dt);
    f.sprite.position.addScaledVector(f.vel, dt);
    f.sprite.material.opacity = Math.min(1, f.life * 1.7);
  }

  // --- clouds drift ---
  for (const c of clouds.children) {
    c.position.x += c.userData.drift * dt;
    if (c.position.x > 250) c.position.x = -250;
  }

  // --- camera: side-chase that keeps jet, missile, and sun in play ---
  const scrollK = Math.min(scrollY / (window.innerHeight * 1.4), 1);
  const camDist = 24 + scrollK * 26;
  // camera sits opposite the sun so the jet is backlit and the sun sweeps through frame
  const camAng = 0.55 + Math.sin(t * 0.05) * 0.4 + scrollK * 1.1;
  camera.position.set(
    jetPos.x + Math.sin(camAng) * camDist + mouse.x * 2.6,
    jetPos.y + 5 + scrollK * 9 - mouse.y * 2.2,
    jetPos.z + Math.cos(camAng) * camDist
  );
  camera.lookAt(jetPos.x, jetPos.y + 1, jetPos.z);
  const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion);
  camera.lookAt(
    jetPos.x + left.x * 6.5,
    jetPos.y + 1 + left.y * 6.5,
    jetPos.z + left.z * 6.5
  );
  camera.fov = 56 - scrollK * 9;
  camera.updateProjectionMatrix();

  updateLensFlare();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

window.__sasSceneReady = true;
window.dispatchEvent(new Event("sas-scene-ready"));
