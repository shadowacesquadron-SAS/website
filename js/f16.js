// ============================================================
// SAS PLAYBOY F-16C — lofted low-poly Viper, all-black livery
// Single-mesh fuselage lofted from cross-section rings, LERX,
// cropped-delta wings, bubble canopy, underslung intake, tail
// with squadron art. Nose faces -Z. Length ~9.4 units.
// ============================================================
import * as THREE from "three";

export function buildF16({ tailTexture = null } = {}) {
  const g = new THREE.Group();

  const paint = new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.45, roughness: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0a0c10, metalness: 0.5, roughness: 0.55 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x27200c, metalness: 1.0, roughness: 0.06 });
  const tailMat = tailTexture
    ? new THREE.MeshStandardMaterial({ map: tailTexture, metalness: 0.45, roughness: 0.5 })
    : paint;

  // ---------- fuselage loft ----------
  // stations: [z, halfWidth, halfHeight, yCenter, bottomFlat]
  const ST = [
    [0.0, 0.02, 0.02, 0.00, 0],
    [0.9, 0.15, 0.15, 0.00, 0],
    [2.1, 0.30, 0.30, 0.03, 0],
    [3.3, 0.42, 0.38, 0.07, 0.1],
    [4.6, 0.50, 0.42, 0.09, 0.25],
    [6.0, 0.60, 0.46, 0.05, 0.45],
    [7.5, 0.70, 0.50, 0.00, 0.55],
    [9.0, 0.75, 0.52, -0.02, 0.55],
    [10.5, 0.72, 0.50, 0.00, 0.5],
    [12.0, 0.62, 0.46, 0.02, 0.35],
    [13.4, 0.50, 0.42, 0.04, 0.15],
    [14.5, 0.35, 0.34, 0.04, 0],
    [15.0, 0.31, 0.30, 0.04, 0],
  ];
  const SEG = 14; // points per ring
  const verts = [], idx = [];
  for (let i = 0; i < ST.length; i++) {
    const [z, w, h, yc, flat] = ST[i];
    for (let j = 0; j < SEG; j++) {
      const a = (j / SEG) * Math.PI * 2;
      let x = Math.cos(a) * w;
      let y = Math.sin(a) * h;
      if (y < 0) y *= (1 - flat * 0.55);           // flatten belly
      verts.push(x, y + yc, z);
    }
  }
  for (let i = 0; i < ST.length - 1; i++) {
    for (let j = 0; j < SEG; j++) {
      const a = i * SEG + j, b = i * SEG + ((j + 1) % SEG);
      const c = (i + 1) * SEG + j, d = (i + 1) * SEG + ((j + 1) % SEG);
      idx.push(a, c, b, b, c, d);
    }
  }
  const fusGeo = new THREE.BufferGeometry();
  fusGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  fusGeo.setIndex(idx);
  fusGeo.computeVertexNormals();
  const fus = new THREE.Mesh(fusGeo, paint);
  g.add(fus);

  // nozzle
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.34, 0.7, 14, 1, true), dark);
  noz.rotation.x = Math.PI / 2;
  noz.position.set(0, 0.04, 15.2);
  g.add(noz);

  // ---------- underslung intake ----------
  const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.34, 4.6, 12), dark);
  intake.rotation.x = Math.PI / 2;
  intake.scale.set(1, 1, 0.75);
  intake.position.set(0, -0.5, 7.2);
  g.add(intake);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.045, 8, 14), paint);
  lip.position.set(0, -0.5, 4.9);
  lip.scale.set(1, 0.75, 1);
  g.add(lip);

  // ---------- bubble canopy ----------
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 16), canopyMat);
  canopy.scale.set(0.82, 0.72, 2.1);
  canopy.position.set(0, 0.46, 3.6);
  g.add(canopy);

  // ---------- LERX strakes ----------
  const lerxShape = new THREE.Shape();
  lerxShape.moveTo(0.38, 3.6);
  lerxShape.lineTo(0.55, 4.6);
  lerxShape.lineTo(0.95, 6.6);
  lerxShape.lineTo(1.15, 7.6);
  lerxShape.lineTo(0.55, 7.6);
  lerxShape.lineTo(0.38, 6.0);
  lerxShape.closePath();
  const lerxGeo = new THREE.ExtrudeGeometry(lerxShape, { depth: 0.06, bevelEnabled: false });
  lerxGeo.rotateX(Math.PI / 2);
  const lerxL = new THREE.Mesh(lerxGeo, paint);
  lerxL.position.set(0, 0.1, 0);
  g.add(lerxL);
  const lerxR = lerxL.clone(); lerxR.scale.x = -1; g.add(lerxR);

  // ---------- wings: cropped delta, 40° LE sweep ----------
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.60, 7.2);
  wingShape.lineTo(4.85, 11.35);   // leading edge
  wingShape.lineTo(4.85, 12.05);   // tip chord
  wingShape.lineTo(0.70, 12.55);   // trailing edge
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.09, bevelEnabled: false });
  wingGeo.rotateX(Math.PI / 2);
  const wingL = new THREE.Mesh(wingGeo, paint);
  wingL.position.set(0, 0.06, 0);
  g.add(wingL);
  const wingR = wingL.clone(); wingR.scale.x = -1; g.add(wingR);

  // wingtip missile rails + AIM-9 bodies (signature Viper look)
  for (const sx of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 1.6), dark);
    rail.position.set(sx * 4.85, 0.02, 11.7);
    g.add(rail);
    const msl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0x9a9da6, metalness: 0.7, roughness: 0.35 }));
    msl.rotation.x = Math.PI / 2;
    msl.position.set(sx * 4.85, -0.06, 11.5);
    g.add(msl);
    const mtip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.3, 8), dark);
    mtip.rotation.x = -Math.PI / 2;
    mtip.position.set(sx * 4.85, -0.06, 10.1);
    g.add(mtip);
  }

  // ---------- vertical tail (with squadron art) ----------
  const tailShape = new THREE.Shape();
  tailShape.moveTo(11.4, 0);
  tailShape.lineTo(12.6, 0);
  tailShape.lineTo(13.55, 2.9);
  tailShape.lineTo(14.55, 2.9);
  tailShape.lineTo(15.0, 0.0);
  tailShape.closePath();
  const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.07, bevelEnabled: false });
  // UVs: map shape bounding box (11.4..15.0 z, 0..2.9 y) to 0..1
  {
    const uv = tailGeo.attributes.uv;
    const pos = tailGeo.attributes.position;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (pos.getX(i) - 11.4) / 3.6, pos.getY(i) / 2.9);
    }
  }
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.rotation.y = -Math.PI / 2;
  tail.position.set(0.035, 0.42, 0);
  // note: rotation.y=-90° maps shape x->world z correctly for our nose-at-0 frame
  g.add(tail);

  // ---------- stabilators ----------
  const stabShape = new THREE.Shape();
  stabShape.moveTo(0.55, 13.0);
  stabShape.lineTo(2.55, 14.15);
  stabShape.lineTo(2.55, 14.75);
  stabShape.lineTo(0.6, 15.1);
  stabShape.closePath();
  const stabGeo = new THREE.ExtrudeGeometry(stabShape, { depth: 0.06, bevelEnabled: false });
  stabGeo.rotateX(Math.PI / 2);
  const stabL = new THREE.Mesh(stabGeo, paint);
  stabL.position.set(0, 0.05, 0);
  stabL.rotation.z = -0.12;
  g.add(stabL);
  const stabR = stabL.clone(); stabR.scale.x = -1; stabR.rotation.z = 0.12; g.add(stabR);

  // ---------- ventral fins ----------
  const vfShape = new THREE.Shape();
  vfShape.moveTo(0, 0); vfShape.lineTo(1.6, -0.55); vfShape.lineTo(1.9, -0.55);
  vfShape.lineTo(2.0, 0); vfShape.closePath();
  const vfGeo = new THREE.ExtrudeGeometry(vfShape, { depth: 0.05, bevelEnabled: false });
  vfGeo.rotateY(-Math.PI / 2);  // shape x -> +z, local origin at fin root
  for (const sx of [-1, 1]) {
    const vf = new THREE.Mesh(vfGeo, dark);
    vf.rotation.z = sx * 0.3;   // cant outward around its own root
    vf.position.set(sx * 0.28, -0.4, 11.6);
    g.add(vf);
  }

  // ---------- afterburner ----------
  const burners = [];
  const burnerLight = new THREE.PointLight(0xff9040, 5, 24, 1.8);
  burnerLight.position.set(0, 0.04, 15.9);
  g.add(burnerLight);
  g.userData = { burners, burnerLight, nozzleTip: new THREE.Vector3(0, 0.04, 15.7) };

  // center & scale: nose z=0..15 -> centered, ~9.4 long, nose -z
  const inner = new THREE.Group();
  while (g.children.length) inner.add(g.children[0]);
  inner.position.z = -7.5;
  const out = new THREE.Group();
  out.add(inner);
  out.scale.setScalar(0.63);
  out.userData = g.userData;
  return out;
}
