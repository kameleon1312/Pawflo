'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const MODEL_URL = '/models/chihuahua.glb';

/** Height of the dog in world units; the camera is framed around this. */
const DOG_HEIGHT = 1;
/** Seconds the dog needs to cross the whole viewport width */
const CROSSING_SECONDS = 11;
/**
 * The model is expected to face +X (see public/models/README.md). If an exported model faces
 * another way, fix it here instead of re-exporting.
 */
const MODEL_YAW = 0;
/** Camera framed so the dog fills ~70% of the canvas height and its feet sit ~8% above the bottom */
const CAMERA_Y = 0.58;
const CAMERA_Z = 3.7;
const CAMERA_FOV = 22;

function createShadowTexture(): THREE.CanvasTexture {
  // Soft contact shadow texture (cheap, no shadow maps needed)
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(27,20,17,0.55)');
    g.addColorStop(1, 'rgba(27,20,17,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m) => m.dispose());
  });
}

/**
 * Plain three.js on purpose (no react-three-fiber): fewer bytes in the lazy chunk, no extra
 * dependency, and no React-types clash in this monorepo (mobile pulls @types/react 19).
 */
export default function DogScene({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let disposed = false;
    let frame = 0;
    let loaded: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;pointer-events:none';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50);
    camera.position.set(0, CAMERA_Y, CAMERA_Z);
    camera.lookAt(0, CAMERA_Y, 0);

    // Warm studio light: soft sky/ground fill, a key from the front-left, a rim to lift the fur edge
    scene.add(new THREE.HemisphereLight('#FFF3E2', '#8A6A55', 0.9));
    const key = new THREE.DirectionalLight('#FFE9CF', 2.2);
    key.position.set(-3, 4, 4);
    const rim = new THREE.DirectionalLight('#FFD2B0', 1.1);
    rim.position.set(3, 2, -3);
    scene.add(key, rim);

    const dog = new THREE.Group();
    dog.rotation.y = MODEL_YAW;
    scene.add(dog);

    const shadowTexture = createShadowTexture();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, DOG_HEIGHT * 0.35),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    shadow.visible = false;
    scene.add(shadow);

    let dogWidth = 1;

    const loader = new GLTFLoader();
    // Meshopt-compressed exports are far smaller than plain GLB; Draco is intentionally not wired
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        // Normalise any exported model: feet on y=0, centred on x/z, scaled to DOG_HEIGHT
        const root = gltf.scene;
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const s = DOG_HEIGHT / Math.max(size.y, 0.0001);
        const holder = new THREE.Group();
        holder.scale.setScalar(s);
        holder.position.set(-center.x * s, -box.min.y * s, -center.z * s);
        holder.add(root);
        dog.add(holder);
        loaded = holder;

        dogWidth = size.x * s;
        shadow.scale.x = dogWidth * 1.4;
        shadow.visible = true;

        // Prefer a clip that is obviously the run cycle, otherwise the first one
        const clip = gltf.animations.find((c) => /run|gallop|bieg/i.test(c.name)) ?? gltf.animations[0];
        if (clip) {
          mixer = new THREE.AnimationMixer(root);
          const action = mixer.clipAction(clip);
          action.play();
          if (reducedMotion) {
            // Calm static pose: a quarter into the cycle, no playback
            action.time = clip.duration * 0.25;
            action.paused = true;
            mixer.update(0);
          }
        }
        renderOnce();
      },
      undefined,
      () => {
        // A missing or broken model must never break the page: leave the canvas empty
      },
    );

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    const clock = new THREE.Clock();
    let travel = 0;

    const visibleWidth = () => 2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * CAMERA_Z * camera.aspect;

    function renderOnce() {
      dog.position.x = 0;
      shadow.position.x = 0;
      renderer.render(scene, camera);
    }

    function tick() {
      frame = requestAnimationFrame(tick);
      // Paused while off screen: no clock advance, no draw calls
      if (!activeRef.current || reducedMotion) {
        clock.getDelta();
        return;
      }
      const dt = Math.min(clock.getDelta(), 0.05);
      mixer?.update(dt);
      travel = (travel + dt / CROSSING_SECONDS) % 1;
      // Enter and leave outside the viewport edge, then loop
      const vw = visibleWidth();
      const x = -vw / 2 - dogWidth + travel * (vw + dogWidth * 2);
      dog.position.x = x;
      shadow.position.x = x;
      renderer.render(scene, camera);
    }
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mixer?.stopAllAction();
      if (loaded) disposeObject(loaded);
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
      shadowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion]);

  return <div ref={host} className="w-full h-full" aria-hidden="true" />;
}
