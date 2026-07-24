import { Line, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import {
  GoalPosts,
  PITCH_LENGTH,
  PITCH_WIDTH,
  Pitch,
} from "./QuidditchUniformSearch";

type Vector3 = [number, number, number];
type ScalarKey = "seed" | "steps" | "deltaT" | "sigma";
type VectorKey = "initialPosition" | "initialVelocity";

type Parameters = {
  seed: number;
  steps: number;
  deltaT: number;
  sigma: number;
  initialPosition: Vector3;
  initialVelocity: Vector3;
};

const defaults: Parameters = {
  seed: 42,
  steps: 36,
  deltaT: 0.5,
  sigma: 2.5,
  initialPosition: [0, 30, 0],
  initialVelocity: [8, 0.8, 2],
};

const MIN_HEIGHT = 4;
const PITCH_X_RADIUS = PITCH_LENGTH / 2;
const PITCH_Z_RADIUS = PITCH_WIDTH / 2;
const scalarLimits: Record<ScalarKey, [number, number]> = {
  seed: [0, 4294967295],
  steps: [1, 100],
  deltaT: [0.1, 2],
  sigma: [0, 8],
};

const vectorLimits: Record<VectorKey, [number, number][]> = {
  initialPosition: [
    [-PITCH_X_RADIUS, PITCH_X_RADIUS],
    [MIN_HEIGHT, 150],
    [-PITCH_Z_RADIUS, PITCH_Z_RADIUS],
  ],
  initialVelocity: [
    [-20, 20],
    [-10, 10],
    [-12, 12],
  ],
};

const draftValues = (parameters: Parameters): Record<string, string> => ({
  seed: String(parameters.seed),
  steps: String(parameters.steps),
  deltaT: String(parameters.deltaT),
  sigma: String(parameters.sigma),
  ...Object.fromEntries(
    (["initialPosition", "initialVelocity"] as const).flatMap(key =>
      parameters[key].map((value, axis) => [`${key}-${axis}`, String(value)])
    )
  ),
});

const rangeError = (raw: string, min: number, max: number, integer = false) => {
  const value = Number(raw);
  if (
    raw.trim() === "" ||
    !Number.isFinite(value) ||
    (integer && !Number.isInteger(value)) ||
    value < min ||
    value > max
  ) {
    return `有效范围：${min}–${max}${integer ? "（整数）" : ""}`;
  }
  return undefined;
};

const clampToPitch = ([x, y, z]: Vector3): Vector3 => {
  const ellipse = (x / PITCH_X_RADIUS) ** 2 + (z / PITCH_Z_RADIUS) ** 2;
  const scale = ellipse > 1 ? 1 / Math.sqrt(ellipse) : 1;

  // ponytail: clamps at the pitch edge; reflect velocity if momentum at boundaries matters.
  return [x * scale, Math.max(y, MIN_HEIGHT), z * scale];
};

const mulberry32 = (seed: number) => () => {
  let value = (seed += 0x6d2b79f5);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const gaussian = (random: () => number) => {
  const u = 1 - random();
  const v = 1 - random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const simulateTrajectory = ({
  seed,
  steps,
  deltaT,
  sigma,
  initialPosition,
  initialVelocity,
}: Parameters) => {
  const random = mulberry32(seed);
  const trajectory: Vector3[] = [initialPosition];
  let position = initialPosition;

  for (let step = 0; step < steps; step++) {
    const next = [0, 1, 2].map(
      axis =>
        position[axis] +
        initialVelocity[axis] * deltaT +
        gaussian(random) * sigma
    ) as Vector3;
    position = clampToPitch(next);
    trajectory.push(position);
  }

  return trajectory;
};

function Scene({
  trajectory,
  sigma,
}: {
  trajectory: Vector3[];
  sigma: number;
}) {
  const start = trajectory[0];
  const end = trajectory.at(-1) ?? start;
  const stepIndexes = [
    Math.floor((trajectory.length - 1) / 4),
    Math.floor((trajectory.length - 1) / 2),
    Math.floor(((trajectory.length - 1) * 3) / 4),
  ];

  return (
    <>
      <color attach="background" args={["#08130f"]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[120, 260, 160]} intensity={1.4} />
      <pointLight
        color="#ffd35a"
        intensity={1200}
        distance={500}
        position={end}
      />
      <Pitch />
      <GoalPosts />
      <Line points={trajectory} color="#ffd35a" lineWidth={2.5} />
      {stepIndexes.map(index => (
        <mesh key={index} position={trajectory[index]}>
          <sphereGeometry
            args={[Math.max(sigma * Math.sqrt(index), 1), 24, 24]}
          />
          <meshBasicMaterial
            color="#e5b547"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
      ))}
      <mesh position={start}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshStandardMaterial
          color="#c7d8ff"
          emissive="#5e7dc4"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial
          color="#ffd35a"
          emissive="#d08014"
          emissiveIntensity={1.5}
        />
      </mesh>
      <OrbitControls
        target={[0, 22, 0]}
        enablePan={false}
        minDistance={80}
        maxDistance={700}
      />
    </>
  );
}

export default function GoldenSnitchTrajectory() {
  const [parameters, setParameters] = useState(defaults);
  const [drafts, setDrafts] = useState(() => draftValues(defaults));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const trajectory = useMemo(
    () => simulateTrajectory(parameters),
    [parameters]
  );
  const updateScalar = (key: ScalarKey, raw: string) => {
    setDrafts(current => ({ ...current, [key]: raw }));
    const [min, max] = scalarLimits[key];
    const error = rangeError(raw, min, max, key === "seed" || key === "steps");

    setErrors(current => ({ ...current, [key]: error ?? "" }));
    if (!error) setParameters(current => ({ ...current, [key]: Number(raw) }));
  };

  const updateVector = (key: VectorKey, axis: number, raw: string) => {
    const field = `${key}-${axis}`;
    setDrafts(current => ({ ...current, [field]: raw }));
    const [min, max] = vectorLimits[key][axis];
    let error = rangeError(raw, min, max);
    const value = Number(raw);
    const candidate = parameters[key].map((coordinate, index) =>
      index === axis ? value : coordinate
    ) as Vector3;

    if (
      !error &&
      key === "initialPosition" &&
      (candidate[0] / PITCH_X_RADIUS) ** 2 +
        (candidate[2] / PITCH_Z_RADIUS) ** 2 >
        1
    ) {
      error = "有效范围：x、z 必须位于椭圆球场内";
    }

    setErrors(current => ({ ...current, [field]: error ?? "" }));
    if (!error) {
      setParameters(current => ({
        ...current,
        [key]: candidate,
      }));
    }
  };

  return (
    <section
      className="not-prose my-8"
      aria-label="Golden Snitch 运动轨迹模拟器"
    >
      <details className="mb-3 border-y border-stone-200 py-2 text-sm" open>
        <summary className="cursor-pointer font-medium text-stone-700">
          调整模拟参数
        </summary>
        <p className="mt-2 text-stone-600">
          固定随机种子可复现同一条轨迹；本文没有定义速度更新，因此速度保持恒定。
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
          {(["seed", "steps", "deltaT", "sigma"] as const).map(key => (
            <label key={key} className="grid gap-1 text-stone-600">
              {
                { seed: "随机种子", steps: "步数", deltaT: "Δt", sigma: "σ" }[
                  key
                ]
              }
              <input
                type="text"
                inputMode={
                  key === "seed" || key === "steps" ? "numeric" : "decimal"
                }
                value={drafts[key]}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `${key}-error` : undefined}
                onChange={event => updateScalar(key, event.target.value)}
                className="rounded-md border border-stone-300 bg-white px-2 py-1 tabular-nums outline-none focus:border-stone-500"
              />
              {errors[key] && (
                <span id={`${key}-error`} className="text-xs text-red-700">
                  {errors[key]}
                </span>
              )}
            </label>
          ))}
          {(["initialPosition", "initialVelocity"] as const).flatMap(key =>
            (["x", "y", "z"] as const).map((axisName, axis) => (
              <label
                key={`${key}-${axisName}`}
                className="grid gap-1 text-stone-600"
              >
                {key === "initialPosition" ? "初始位置" : "初始速度"} {axisName}
                <input
                  type="text"
                  inputMode="decimal"
                  value={drafts[`${key}-${axis}`]}
                  aria-invalid={Boolean(errors[`${key}-${axis}`])}
                  aria-describedby={
                    errors[`${key}-${axis}`]
                      ? `${key}-${axis}-error`
                      : undefined
                  }
                  onChange={event =>
                    updateVector(key, axis, event.target.value)
                  }
                  className="rounded-md border border-stone-300 bg-white px-2 py-1 tabular-nums outline-none focus:border-stone-500"
                />
                {errors[`${key}-${axis}`] && (
                  <span
                    id={`${key}-${axis}-error`}
                    className="text-xs text-red-700"
                  >
                    {errors[`${key}-${axis}`]}
                  </span>
                )}
              </label>
            ))
          )}
        </div>
      </details>
      <div className="h-112 overflow-hidden rounded-lg bg-[#08130f]">
        <Canvas
          key={JSON.stringify(parameters)}
          dpr={[1, 1.5]}
          camera={{ position: [0, 310, 430], fov: 35 }}
        >
          <Scene trajectory={trajectory} sigma={parameters.sigma} />
        </Canvas>
      </div>
      <p className="mt-2 text-xs text-stone-500">
        椭圆草地为魁地奇球场；蓝点为起点，金点为终点，半透明球体表示 1σ
        不确定性。
      </p>
    </section>
  );
}
