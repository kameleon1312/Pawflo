'use client';

import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
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

function Dog({ reducedMotion }: { reducedMotion: boolean }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    // Meshopt-compressed exports are far smaller than plain GLB; Draco is intentionally not wired
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const viewport = useThree((s) => s.viewport);
  const group = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);

  // Normalise any exported model: feet on y=0, centred on x/z, scaled to DOG_HEIGHT
  const { scene, offset, scale, width } = useMemo(() => {
    const root = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = DOG_HEIGHT / Math.max(size.y, 0.0001);
    return {
      scene: root,
      scale: s,
      width: size.x * s,
      offset: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    };
  }, [gltf]);

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  useEffect(() => {
    // Prefer a clip that is obviously the run cycle, otherwise the first one
    const clip =
      gltf.animations.find((c) => /run|gallop|bieg/i.test(c.name)) ?? gltf.animations[0];
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.play();
    if (reducedMotion) {
      // Calm static pose: a quarter into the cycle, no playback
      action.time = clip.duration * 0.25;
      action.paused = true;
      mixer.update(0);
    }
    return () => {
      mixer.stopAllAction();
    };
  }, [gltf, mixer, reducedMotion]);

  useEffect(
    () => () => {
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      });
    },
    [scene],
  );

  // Soft contact shadow texture (cheap, no shadow maps needed)
  const shadowTexture = useMemo(() => {
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
  }, []);

  useFrame((state, delta) => {
    if (!reducedMotion) mixer.update(Math.min(delta, 0.05));
    const g = group.current;
    if (!g) return;
    if (reducedMotion) {
      g.position.x = 0;
    } else {
      // Enter and leave outside the viewport edge, then loop
      const span = viewport.width + width * 2;
      const t = (state.clock.elapsedTime / CROSSING_SECONDS) % 1;
      g.position.x = -viewport.width / 2 - width + t * span;
    }
    if (shadow.current) shadow.current.position.x = g.position.x;
  });

  return (
    <>
      <group ref={group} rotation={[0, MODEL_YAW, 0]}>
        <group position={offset} scale={scale}>
          <primitive object={scene} />
        </group>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[width * 1.4, DOG_HEIGHT * 0.35]} />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} />
      </mesh>
    </>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    // A broken or missing model must never break the page
    return this.state.failed ? null : this.props.children;
  }
}

export default function DogScene({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  return (
    <SceneBoundary>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        // Framed so the dog fills ~70% of the canvas height and its feet sit ~8% above the bottom edge
        camera={{ position: [0, 0.58, 3.7], fov: 22 }}
        onCreated={({ gl, camera }) => {
          // r3f aims the default camera at the origin; look straight ahead so the ground stays near the bottom edge
          camera.lookAt(0, 0.58, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        style={{ pointerEvents: 'none' }}
        aria-hidden="true"
      >
        {/* Warm studio light: soft sky/ground fill, a key from the front-left, a rim to lift the fur edge */}
        <hemisphereLight args={['#FFF3E2', '#8A6A55', 0.9]} />
        <directionalLight position={[-3, 4, 4]} intensity={2.2} color="#FFE9CF" />
        <directionalLight position={[3, 2, -3]} intensity={1.1} color="#FFD2B0" />
        <Suspense fallback={null}>
          <Dog reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
