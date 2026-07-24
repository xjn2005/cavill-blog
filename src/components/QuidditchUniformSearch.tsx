import { OrbitControls, Line } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

export const PITCH_LENGTH = 500;
export const PITCH_WIDTH = 180;
const GOAL_POST_HEIGHT = 50;
const HOOP_RADIUS = 13;
const PITCH_SEMI_LENGTH = PITCH_LENGTH / 2;
const PITCH_SEMI_WIDTH = PITCH_WIDTH / 2;

const pitchEdgeX = (z: number) =>
  PITCH_SEMI_LENGTH * Math.sqrt(1 - (z / PITCH_SEMI_WIDTH) ** 2);

const goalPosts = [-1, 1].flatMap(side =>
  [-45, 0, 45].map(z => ({ x: side * pitchEdgeX(z), z }))
);

const pitchOutline = Array.from({ length: 97 }, (_, index) => {
  const angle = (index / 96) * Math.PI * 2;
  return [
    PITCH_SEMI_LENGTH * Math.cos(angle),
    0.8,
    PITCH_SEMI_WIDTH * Math.sin(angle),
  ] as [number, number, number];
});

const centerCircle = Array.from({ length: 33 }, (_, index) => {
  const angle = (index / 32) * Math.PI * 2;
  return [2 * Math.cos(angle), 0.9, 2 * Math.sin(angle)] as [
    number,
    number,
    number,
  ];
});

const probabilityPoints = [-180, -90, 0, 90, 180].flatMap(x =>
  [-55, -18, 18, 55].flatMap(z =>
    [15, 45, 75]
      .map(y => ({ x, y, z }))
      .filter(({ x, z }) => (x / 230) ** 2 + (z / 76) ** 2 <= 1)
  )
);

export function GoalPosts() {
  return (
    <>
      {goalPosts.map(({ x, z }) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh
            receiveShadow
            position={[0, 0.35, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[3.6, 24]} />
            <meshStandardMaterial
              color="#8b5e1a"
              metalness={0.82}
              roughness={0.34}
            />
          </mesh>
          <mesh castShadow position={[0, GOAL_POST_HEIGHT / 2, 0]}>
            <cylinderGeometry args={[1.1, 1.3, GOAL_POST_HEIGHT, 16]} />
            <meshStandardMaterial
              color="#bd7f2a"
              metalness={0.92}
              roughness={0.3}
            />
          </mesh>
          <mesh
            castShadow
            position={[0, GOAL_POST_HEIGHT, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[HOOP_RADIUS, 1.25, 12, 40]} />
            <meshStandardMaterial
              color="#edc56a"
              emissive="#6f4614"
              emissiveIntensity={0.08}
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function Pitch() {
  return (
    <>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[PITCH_LENGTH / PITCH_WIDTH, 1, 1]}
      >
        <circleGeometry args={[PITCH_WIDTH / 2, 96]} />
        <meshStandardMaterial
          color="#1a5c3e"
          roughness={0.72}
          metalness={0.04}
        />
      </mesh>
      <Line points={pitchOutline} color="#b6e3a1" lineWidth={1} />
      <Line points={centerCircle} color="#d8f3c8" lineWidth={1} />
    </>
  );
}

function UniformDistribution() {
  return (
    <group>
      {probabilityPoints.map(({ x, y, z }) => (
        <mesh key={`${x}-${y}-${z}`} position={[x, y, z]}>
          <sphereGeometry args={[2.25, 16, 16]} />
          <meshStandardMaterial
            color="#ffe6a7"
            emissive="#9a5c13"
            emissiveIntensity={0.28}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <hemisphereLight args={["#ffffff", "#527866", 1.65]} />
      <directionalLight
        castShadow
        position={[120, 260, 160]}
        intensity={2.1}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        color="#f8c35a"
        intensity={950}
        distance={420}
        position={[0, 120, 0]}
      />
      <Pitch />
      <GoalPosts />
      <UniformDistribution />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.6}
        maxPolarAngle={1.35}
        minAzimuthAngle={-1.1}
        maxAzimuthAngle={1.1}
        target={[0, 22, 0]}
      />
    </>
  );
}

export default function QuidditchUniformSearch() {
  const [sceneKey, setSceneKey] = useState(0);

  return (
    <section
      className="not-prose relative my-8 h-112 overflow-hidden"
      aria-label="魁地奇球场的均匀概率分布；拖动可改变视角"
    >
      <Canvas
        key={sceneKey}
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 310, 430], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
      <button
        type="button"
        title="重置视角"
        aria-label="重置视角"
        className="focus-visible:outline-accent absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full bg-white/70 text-lg text-amber-900 shadow-sm backdrop-blur hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => setSceneKey(key => key + 1)}
      >
        ↺
      </button>
    </section>
  );
}
