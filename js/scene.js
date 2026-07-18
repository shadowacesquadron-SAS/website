// ============================================================
// Shadow Ace Squadron — cinematic hero scene
// Stylized jet flythrough: night sky, moonlit clouds, afterburner,
// countermeasure flares, lens flare. No external assets — all
// geometry & textures are generated procedurally at runtime.
// ============================================================
import * as THREE from "three";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070d);
scene.fog = new THREE.FogExp2(0x05070d, 0.0048);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 600);

// ---------------- procedural textures ----------------
function radialSpriteTexture(inner, outer, size = 128) {
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
const softWhite = radialSpriteTexture("rgba(255,255,255,1)", "rgba(180,220,255,0.45)");
const cloudTex = radialSpriteTexture("rgba(150,170,205,0.5)", "rgba(90,110,150,0.16)", 256);
const flareTex = radialSpriteTexture("rgba(255,240,200,1)", "rgba(255,150,60,0.5)");
const burnerTex = radialSpriteTexture("rgba(190,230,255,1)", "rgba(80,150,255,0.5)");

// ---------------- lighting ----------------
scene.add(new THREE.AmbientLight(0x1a2438, 0.7));
const moon = new THREE.DirectionalLight(0xbfd4ff, 2.7);
moon.position.set(-40, 60, -30);
scene.add(moon);
const rim = new THREE.DirectionalLight(0x2a70ff, 0.9);
rim.position.set(30, -18, 40);
scene.add(rim);

// ---------------- starfield ----------------
{
  const N = 1600;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 250 + Math.random() * 250;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = Math.abs(r * Math.cos(ph)) * 0.7 - 20;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.5, map: softWhite, transparent: true, opacity: 1,
    depthWrite: false, blending: THREE.AdditiveBlending, color: 0xcfe2ff,
    sizeAttenuation: true, fog: false,
  });
  scene.add(new THREE.Points(geo, mat));
}

// ---------------- moon disc ----------------
{
  const moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialSpriteTexture("rgba(240,248,255,1)", "rgba(190,215,255,0.35)", 256),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95,
  }));
  moonSprite.position.set(-120, 95, -220);
  moonSprite.scale.setScalar(46);
  scene.add(moonSprite);
}

// ---------------- cloud deck (billboard sprites) ----------------
const clouds = new THREE.Group();
{
  for (let i = 0; i < 70; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: cloudTex, transparent: true, depthWrite: false,
      opacity: 0.07 + Math.random() * 0.13, color: 0x8ba3cf,
    }));
    s.position.set(
      (Math.random() - 0.5) * 460,
      -38 - Math.random() * 40,
      (Math.random() - 0.5) * 460
    );
    const sc = 40 + Math.random() * 80;
    s.scale.set(sc, sc * 0.42, 1);
    s.userData.drift = 0.4 + Math.random() * 0.9;
    clouds.add(s);
  }
  scene.add(clouds);
}

// ---------------- stylized jet (F-22-inspired, from primitives) ----------------
function buildJet() {
  const jet = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0x1d2431, metalness: 0.8, roughness: 0.38, flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x10141d, metalness: 0.65, roughness: 0.5, flatShading: true,
  });

  // fuselage — stretched, faceted
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.6, 7.4, 7), hull);
  fus.rotation.x = Math.PI / 2;
  fus.scale.set(1, 1, 0.62); // flatten vertically
  jet.add(fus);

  // nose cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 2.3, 7), hull);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = -4.8;
  nose.scale.set(1, 1, 0.62);
  jet.add(nose);

  // canopy
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0e2438, metalness: 0.9, roughness: 0.1 })
  );
  canopy.scale.set(0.8, 0.55, 1.9);
  canopy.position.set(0, 0.28, -2.4);
  jet.add(canopy);

  // main delta wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(4.4, 2.6);
  wingShape.lineTo(4.4, 3.6);
  wingShape.lineTo(0.4, 2.4);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.1, bevelEnabled: false });
  const wingL = new THREE.Mesh(wingGeo, hull);
  wingL.rotation.x = Math.PI / 2;
  wingL.position.set(0.25, 0, -1.4);
  jet.add(wingL);
  const wingR = wingL.clone();
  wingR.scale.x = -1;
  wingR.position.x = -0.25;
  jet.add(wingR);

  // canted twin tails
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(1.5, 0.4);
  tailShape.lineTo(1.9, 1.7);
  tailShape.lineTo(0.9, 1.5);
  tailShape.closePath();
  const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.08, bevelEnabled: false });
  const tailL = new THREE.Mesh(tailGeo, dark);
  tailL.rotation.y = Math.PI / 2;
  tailL.rotation.z = 0.5;
  tailL.position.set(0.62, 0.1, 1.7);
  jet.add(tailL);
  const tailR = new THREE.Mesh(tailGeo, dark);
  tailR.rotation.y = Math.PI / 2;
  tailR.rotation.z = -0.5;
  tailR.scale.z = -1;
  tailR.position.set(-0.62, 0.1, 1.7);
  jet.add(tailR);

  // horizontal stabs
  const stabShape = new THREE.Shape();
  stabShape.moveTo(0, 0);
  stabShape.lineTo(1.9, 0.9);
  stabShape.lineTo(1.9, 1.5);
  stabShape.lineTo(0.3, 1.1);
  stabShape.closePath();
  const stabGeo = new THREE.ExtrudeGeometry(stabShape, { depth: 0.07, bevelEnabled: false });
  const stabL = new THREE.Mesh(stabGeo, dark);
  stabL.rotation.x = Math.PI / 2;
  stabL.position.set(0.3, 0, 2.2);
  jet.add(stabL);
  const stabR = stabL.clone();
  stabR.scale.x = -1;
  stabR.position.x = -0.3;
  jet.add(stabR);

  // engine nozzles
  for (const sx of [-0.36, 0.36]) {
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.5, 8), dark);
    noz.rotation.x = Math.PI / 2;
    noz.position.set(sx, -0.05, 3.75);
    jet.add(noz);
  }

  // afterburner glow sprites + light
  const burners = [];
  for (const sx of [-0.36, 0.36]) {
    const b = new THREE.Sprite(new THREE.SpriteMaterial({
      map: burnerTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0x9cd2ff,
    }));
    b.position.set(sx, -0.05, 4.15);
    b.scale.setScalar(1.15);
    jet.add(b);
    burners.push(b);
  }
  const burnerLight = new THREE.PointLight(0x66aaff, 6, 26, 1.8);
  burnerLight.position.set(0, 0, 4.4);
  jet.add(burnerLight);

  // nav strobes
  const strobeL = new THREE.Sprite(new THREE.SpriteMaterial({
    map: softWhite, color: 0xff4455, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  strobeL.scale.setScalar(0.5);
  strobeL.position.set(4.55, 0, 1.9);
  jet.add(strobeL);
  const strobeR = strobeL.clone();
  strobeR.material = strobeL.material.clone();
  strobeR.material.color.set(0x44ff88);
  strobeR.position.x = -4.55;
  jet.add(strobeR);

  jet.userData = { burners, burnerLight, strobeL, strobeR };
  return jet;
}

const jet = buildJet();
scene.add(jet);

// wingman, further back
const wingman = buildJet();
wingman.scale.setScalar(0.8);
scene.add(wingman);

// ---------------- countermeasure flares ----------------
const MAX_FLARES = 90;
const flarePool = [];
{
  for (let i = 0; i < MAX_FLARES; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: flareTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0,
    }));
    s.visible = false;
    scene.add(s);
    flarePool.push({ sprite: s, life: 0, vel: new THREE.Vector3() });
  }
}
let flareCursor = 0;
function popFlares(fromJet, count) {
  const origin = new THREE.Vector3();
  fromJet.getWorldPosition(origin);
  const back = new THREE.Vector3(0, 0, 1).applyQuaternion(fromJet.quaternion);
  for (let i = 0; i < count; i++) {
    const f = flarePool[flareCursor];
    flareCursor = (flareCursor + 1) % MAX_FLARES;
    f.life = 1;
    f.sprite.visible = true;
    f.sprite.position.copy(origin).addScaledVector(back, 3.5);
    f.vel.set(
      (Math.random() - 0.5) * 9,
      -3 - Math.random() * 5,
      (Math.random() - 0.5) * 9
    ).addScaledVector(back, 9 + Math.random() * 5);
    f.sprite.scale.setScalar(1.4 + Math.random() * 1.1);
  }
}

// ---------------- lens flare (custom sprite chain on the moon) ----------------
const lensGroup = new THREE.Group();
scene.add(lensGroup);
const lensSprites = [];
{
  const colors = [0xaad4ff, 0x59d7ff, 0xffb454, 0x7dff9b, 0xaad4ff];
  // sprites live ~0.4 units in front of the camera after unproject —
  // scales must be tiny or they veil the whole frame
  const scales = [0.10, 0.048, 0.030, 0.062, 0.022];
  const offsets = [0.35, 0.55, 0.72, 0.9, 1.08];
  for (let i = 0; i < colors.length; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: softWhite, color: colors[i], transparent: true,
      opacity: 0.22, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    }));
    s.scale.setScalar(scales[i]);
    lensGroup.add(s);
    lensSprites.push({ sprite: s, k: offsets[i] });
  }
}
const moonWorld = new THREE.Vector3(-120, 95, -220);
function updateLensFlare() {
  const ndc = moonWorld.clone().project(camera);
  const onScreen = ndc.z < 1 && Math.abs(ndc.x) < 1.15 && Math.abs(ndc.y) < 1.15;
  lensGroup.visible = onScreen;
  if (!onScreen) return;
  for (const { sprite, k } of lensSprites) {
    const p = new THREE.Vector3(ndc.x * (1 - k) , ndc.y * (1 - k), 0.5).unproject(camera);
    sprite.position.copy(p);
  }
}

// ---------------- flight path & camera choreography ----------------
const clock = new THREE.Clock();
let scrollY = 0;
window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

let nextFlareAt = 3.5;
const jetPos = new THREE.Vector3();
const tmp = new THREE.Vector3();

function flightPos(t, out) {
  // lazy figure-8 racetrack
  const R = 26;
  out.set(
    Math.sin(t * 0.21) * R,
    4 + Math.sin(t * 0.13) * 5,
    Math.sin(t * 0.42) * R * 0.55
  );
  return out;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // jet along path, oriented to velocity, banked into turns
  flightPos(t, jetPos);
  flightPos(t + 0.12, tmp);
  jet.position.copy(jetPos);
  const dir = tmp.clone().sub(jetPos);
  jet.lookAt(tmp);
  jet.rotateY(Math.PI); // model faces -z
  const bank = THREE.MathUtils.clamp(-dir.x * 0.35, -1.1, 1.1);
  jet.rotateZ(bank);

  // wingman trails in echelon
  flightPos(t - 0.55, tmp);
  wingman.position.copy(tmp).add(new THREE.Vector3(4.5, -1.4, 0));
  flightPos(t - 0.43, tmp);
  wingman.lookAt(tmp.add(new THREE.Vector3(4.5, -1.4, 0)));
  wingman.rotateY(Math.PI);
  wingman.rotateZ(bank * 0.8);

  // afterburner flicker + strobes
  for (const j of [jet, wingman]) {
    const { burners, burnerLight, strobeL, strobeR } = j.userData;
    const flick = 0.9 + Math.random() * 0.35;
    burners.forEach((b) => b.scale.setScalar(1.05 * flick));
    burnerLight.intensity = 5.2 * flick;
    const blink = Math.sin(t * 9) > 0.94 ? 1 : 0.12;
    strobeL.material.opacity = blink;
    strobeR.material.opacity = blink;
  }

  // periodic countermeasure flares
  if (t > nextFlareAt) {
    popFlares(Math.random() > 0.4 ? jet : wingman, 7 + Math.floor(Math.random() * 6));
    nextFlareAt = t + 4 + Math.random() * 5;
  }
  for (const f of flarePool) {
    if (!f.sprite.visible) continue;
    f.life -= dt * 0.55;
    if (f.life <= 0) { f.sprite.visible = false; continue; }
    f.vel.y -= 7.5 * dt;
    f.vel.multiplyScalar(1 - 0.55 * dt);
    f.sprite.position.addScaledVector(f.vel, dt);
    f.sprite.material.opacity = Math.min(1, f.life * 1.6);
    f.sprite.material.color.setHSL(0.09, 1, 0.5 + f.life * 0.35);
  }

  // clouds drift
  for (const c of clouds.children) {
    c.position.x += c.userData.drift * dt;
    if (c.position.x > 220) c.position.x = -220;
  }

  // camera: cinematic chase with scroll pull-back + mouse parallax
  const scrollK = Math.min(scrollY / (window.innerHeight * 1.4), 1);
  const camDist = 27 + scrollK * 26;
  const camAng = t * 0.06 + scrollK * 1.2;
  camera.position.set(
    jetPos.x + Math.sin(camAng) * camDist + mouse.x * 2.4,
    jetPos.y + 5.5 + scrollK * 9 - mouse.y * 2.0,
    jetPos.z + Math.cos(camAng) * camDist
  );
  // frame the jet right-of-center: aim at a point left of it (screen-space)
  camera.lookAt(jetPos.x, jetPos.y + 1, jetPos.z);
  const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion);
  camera.lookAt(
    jetPos.x + left.x * 7.5,
    jetPos.y + 1 + left.y * 7.5,
    jetPos.z + left.z * 7.5
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

// signal readiness (loader fade handled in main.js). Set a flag too, in
// case main.js hasn't attached its listener yet (module load order race).
window.__sasSceneReady = true;
window.dispatchEvent(new Event("sas-scene-ready"));
