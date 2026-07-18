// ============================================================
// SAS PLAYBOY Viper — loads the CC-BY F-16 GLB (credit: 42manako),
// normalizes scale/orientation (nose -Z, ~9.4 units long, centered),
// and retints to the all-black SAS PLAYBOY scheme.
// ============================================================
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export function loadViper({ url = "assets/f16.glb", length = 9.4, retint = true, yaw = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const draco = new DRACOLoader();
    draco.setDecoderPath("js/vendor/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(url, (gltf) => {
      const model = gltf.scene;

      // --- normalize: center, longest axis -> Z, scale to `length` ---
      model.updateMatrixWorld(true);
      let box = new THREE.Box3().setFromObject(model);
      let size = box.getSize(new THREE.Vector3());
      const wrap = new THREE.Group();
      wrap.add(model);
      if (size.x > size.z && size.x > size.y) model.rotation.y = Math.PI / 2; // long axis x -> z
      model.rotation.y += yaw; // flip nose direction if needed (pass Math.PI)
      model.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(model);
      size = box.getSize(new THREE.Vector3());
      const s = length / size.z;
      model.scale.setScalar(s);
      model.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // --- retint: black SAS PLAYBOY scheme, keep texture detail ---
      if (retint) {
        model.traverse((o) => {
          if (!o.isMesh || !o.material) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) {
            const name = (m.name || "").toLowerCase();
            if (name.includes("glass") || name.includes("canopy") || name.includes("cockpit")) {
              m.color = new THREE.Color(0x1a1206);
              m.metalness = 1.0;
              m.roughness = 0.06;
            } else {
              // multiply the diffuse map toward gunmetal — panel lines survive,
              // sunset rim light has something to catch
              if (m.color) m.color.setRGB(0.46, 0.47, 0.52);
              if ("metalness" in m) m.metalness = Math.max(m.metalness ?? 0, 0.5);
              if ("roughness" in m) m.roughness = Math.min(m.roughness ?? 1, 0.45);
            }
            m.needsUpdate = true;
          }
        });
      }

      wrap.userData.size = size.clone().multiplyScalar(s);
      resolve(wrap);
    }, undefined, reject);
  });
}
