import * as THREE from "three";

/**
 * The studio reflections every scene uses (four light panels, prefiltered for physical materials).
 *
 * Built once per WebGL context and shared by all scenes, instead of one drei <Environment> per scene. Building
 * it compiles several shaders; three.js would otherwise wait for each of them on the main thread (a 100–300 ms
 * freeze the first time a scene appears). Here every shader is compiled in parallel first (compileAsync /
 * KHR_parallel_shader_compile) and the panels are only rendered once the programs are ready.
 */
const SIZE = 64; // cube face resolution, as the old <Environment resolution={64}>
const PANELS: { form: "rect" | "ring"; intensity: number; color: string; position: [number, number, number]; scale: [number, number, number]; rotY: number }[] = [
  // colours match HEX.white / HEX.gold / HEX.champagne in kit.tsx
  { form: "rect", intensity: 3, color: "#F3EAD8", position: [0, 5, 2], scale: [8, 2, 1], rotY: 0 },
  { form: "rect", intensity: 4, color: "#C9A24B", position: [-6, 0, 2], scale: [2, 8, 1], rotY: Math.PI / 2 },
  { form: "rect", intensity: 4, color: "#F2DA8C", position: [6, 0, 2], scale: [2, 8, 1], rotY: -Math.PI / 2 },
  { form: "ring", intensity: 2, color: "#F3EAD8", position: [0, -4, 4], scale: [3, 3, 3], rotY: 0 },
];

const envs = new WeakMap<THREE.WebGLRenderer, Promise<THREE.Texture | null>>();

/** Resolves with the shared environment texture (null if it could not be built; scenes then use their lights only). */
export function getStudioEnv(gl: THREE.WebGLRenderer): Promise<THREE.Texture | null> {
  let p = envs.get(gl);
  if (!p) {
    p = build(gl).catch(() => null);
    envs.set(gl, p);
  }
  return p;
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function build(gl: THREE.WebGLRenderer): Promise<THREE.Texture> {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const disposables: { dispose: () => void }[] = [];
  for (const p of PANELS) {
    // the same meshes drei's <Lightformer> makes: unlit, double-sided, colour scaled by intensity
    const geo = p.form === "ring" ? new THREE.RingGeometry(0.25, 0.5, 64) : new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color).multiplyScalar(p.intensity), toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...p.position);
    mesh.scale.set(...p.scale);
    mesh.rotation.y = p.rotY;
    scene.add(mesh);
    disposables.push(geo, mat);
  }
  const cube = new THREE.WebGLCubeRenderTarget(SIZE);
  cube.texture.type = THREE.HalfFloatType;
  const cubeCamera = new THREE.CubeCamera(0.1, 1000, cube);
  const pmrem = new THREE.PMREMGenerator(gl);

  // 1. compile the panel materials for the cube target, and the prefilter shaders, without blocking
  const prev = gl.getRenderTarget();
  gl.setRenderTarget(cube);
  const waits: Promise<unknown>[] = [gl.compileAsync(scene, cubeCamera.children[0] as THREE.Camera)];
  gl.setRenderTarget(prev);
  waits.push(warmPrefilter(gl, pmrem));
  await Promise.all(waits);
  await frame();

  // 2. render the panels into the cube and prefilter it (every program is ready, so this is quick)
  const autoClear = gl.autoClear;
  gl.autoClear = true;
  cubeCamera.update(gl, scene);
  gl.autoClear = autoClear;
  const target = pmrem.fromCubemap(cube.texture);

  pmrem.dispose();
  cube.dispose();
  disposables.forEach((d) => d.dispose());
  return target.texture;
}

/**
 * PMREMGenerator compiles its prefilter shaders and uses them in the same call, which blocks. Ask it to create
 * them early, then compile them in parallel against a render target of the same kind it will draw into, so the
 * real pass finds them ready in three.js's program cache. Relies on PMREMGenerator internals (three r186); if
 * those change, this quietly does nothing and the prefilter simply compiles the slow way.
 */
async function warmPrefilter(gl: THREE.WebGLRenderer, pmrem: THREE.PMREMGenerator) {
  const p = pmrem as unknown as {
    _setSize?: (size: number) => void;
    _allocateTargets?: () => THREE.WebGLRenderTarget;
    _pingPongRenderTarget?: THREE.WebGLRenderTarget | null;
    _ggxMaterial?: THREE.Material | null;
    _cubemapMaterial?: THREE.Material | null;
  };
  if (typeof p._setSize !== "function" || typeof p._allocateTargets !== "function") return;
  p._setSize(SIZE);
  const scratch = p._allocateTargets();
  pmrem.compileCubemapShader(); // creates the cube → prefilter-layout material
  const materials = [p._ggxMaterial, p._cubemapMaterial].filter((m): m is THREE.Material => !!m);
  const target = p._pingPongRenderTarget ?? scratch;
  if (!materials.length || !target) { scratch.dispose(); return; }
  const camera = new THREE.OrthographicCamera();
  const geometry = new THREE.BufferGeometry();
  const prev = gl.getRenderTarget();
  gl.setRenderTarget(target);
  const waits = materials.map((m) => gl.compileAsync(new THREE.Mesh(geometry, m), camera));
  gl.setRenderTarget(prev);
  scratch.dispose();
  await Promise.all(waits);
}
