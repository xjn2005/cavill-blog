import { useState } from "react";

const MAX_LEVEL = 5;
const CELL_HEIGHT = 42;
const KEY_WIDTH = 34;
const ARRAY_WIDTH = 24;
const NIL_WIDTH = 48;

const nodes = [
  { key: "head", x: 42, height: 5 },
  { key: "3", x: 128, height: 1 },
  { key: "6", x: 198, height: 4 },
  { key: "7", x: 285, height: 1 },
  { key: "9", x: 365, height: 2 },
  { key: "12", x: 450, height: 1 },
  { key: "17", x: 535, height: 2 },
  { key: "19", x: 620, height: 1 },
  { key: "21", x: 705, height: 1 },
  { key: "25", x: 790, height: 3 },
  { key: "26", x: 875, height: 1 },
  { key: "NIL", x: 955, height: 5, nil: true },
];

const executionSteps = [
  {
    layer: 5,
    current: "head",
    line: "while",
    message: "条件不成立：current 保持不动（head 的 forward[4] 是 nullptr）。",
  },
  {
    layer: 4,
    current: "head",
    line: "decrement",
    message: "回到 for 循环，执行 --i，进入 i = 4。",
  },
  {
    layer: 4,
    current: "head",
    line: "while",
    message: "条件成立：6 小于目标值 9。",
  },
  {
    layer: 4,
    current: "6",
    line: "advance",
    message: "执行 current = current->forward[i - 1]，移动到 6。",
  },
  {
    layer: 3,
    current: "6",
    line: "decrement",
    message: "条件不成立：6 的 forward[3] 是 nullptr，执行 --i。",
  },
  {
    layer: 3,
    current: "6",
    line: "while",
    message: "条件不成立：25 不小于目标值 9，current 保持在 6。",
  },
  {
    layer: 2,
    current: "6",
    line: "decrement",
    message: "回到 for 循环，执行 --i，进入 i = 2。",
  },
  {
    layer: 2,
    current: "6",
    line: "while",
    message: "条件不成立：9 不小于目标值 9，current 保持在 6。",
  },
  {
    layer: 1,
    current: "6",
    line: "decrement",
    message: "回到 for 循环，执行 --i，进入 i = 1。",
  },
  {
    layer: 1,
    current: "6",
    line: "while",
    message: "条件成立：7 小于目标值 9。",
  },
  {
    layer: 1,
    current: "7",
    line: "advance",
    message: "执行 current = current->forward[i - 1]，移动到 7。",
  },
  {
    layer: 1,
    current: "7",
    line: "while",
    message: "条件不成立：9 不小于目标值 9，current 保持在 7。",
  },
  {
    layer: 0,
    current: "7",
    line: "decrement",
    message: "执行 --i 后 i = 0，for 循环结束。",
  },
  {
    layer: 0,
    current: "9",
    line: "next",
    message: "执行 current = current->forward[0]，移动到 9。",
  },
  {
    layer: 0,
    current: "9",
    line: "equal",
    message: "isEqual(current->key, key) 成立。",
  },
  {
    layer: 0,
    current: "9",
    line: "return",
    message: "找到 9，执行 return current。",
  },
] as const;

const levelY = (level: number) => 54 + (MAX_LEVEL - level) * CELL_HEIGHT;

const syntax = {
  keyword: "text-[#d32f2f] dark:text-[#c792ea]",
  literal: "text-[#1976d2] dark:text-[#c5e478]",
  function: "text-[#6f42c1] dark:text-[#82aaff]",
  member: "text-[#00796b] dark:text-[#baebe2]",
};

const codeLineClass = (active: boolean, indentation = "") =>
  `${active ? "border-s-2 border-accent" : ""} block ${indentation}`;

export default function SkipListSearchVisualizer() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = executionSteps[stepIndex];
  const currentNode = nodes.find(node => node.key === step.current)!;

  return (
    <section
      className="not-prose my-8"
      aria-labelledby="skip-list-search-title"
    >
      <h2 id="skip-list-search-title" className="sr-only">
        跳表搜索中 current 的移动过程
      </h2>

      <div className="flex justify-center">
        <svg
          className="text-foreground w-full"
          viewBox="0 0 1025 310"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`跳表搜索：i = ${step.layer}，current 指向 ${step.current}`}
        >
          <title>跳表搜索中 current 的移动过程</title>
          <defs>
            <marker
              id="skip-list-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {[5, 4, 3, 2, 1].map(level => {
            const levelNodes = nodes.filter(node => node.height >= level);

            return (
              <g key={level}>
                {levelNodes.slice(0, -1).map((node, index) => (
                  <line
                    key={`${level}-${node.key}`}
                    x1={node.x + KEY_WIDTH + ARRAY_WIDTH}
                    y1={levelY(level)}
                    x2={levelNodes[index + 1].x}
                    y2={levelY(level)}
                    className="stroke-current stroke-[1.2]"
                    markerEnd="url(#skip-list-arrow)"
                  />
                ))}
              </g>
            );
          })}

          {nodes.map(node => {
            const top = levelY(node.height) - CELL_HEIGHT / 2;
            const bottom = levelY(1) + CELL_HEIGHT / 2;

            if (node.nil) {
              return (
                <g key={node.key}>
                  <rect
                    x={node.x}
                    y={top}
                    width={NIL_WIDTH}
                    height={bottom - top}
                    className="fill-background stroke-current stroke-[1.2]"
                  />
                  <text
                    x={node.x + NIL_WIDTH / 2}
                    y={(top + bottom) / 2 + 5}
                    textAnchor="middle"
                    className="fill-current text-[13px]"
                  >
                    NIL
                  </text>
                </g>
              );
            }

            return (
              <g key={node.key}>
                <rect
                  x={node.x}
                  y={top}
                  width={KEY_WIDTH}
                  height={bottom - top}
                  className="fill-background stroke-current stroke-[1.2]"
                />
                <rect
                  x={node.x + KEY_WIDTH}
                  y={top}
                  width={ARRAY_WIDTH}
                  height={bottom - top}
                  className="fill-background stroke-current stroke-[1.2]"
                />
                {Array.from({ length: node.height - 1 }, (_, index) => {
                  const upperLevel = node.height - index;
                  const dividerY =
                    (levelY(upperLevel) + levelY(upperLevel - 1)) / 2;

                  return (
                    <line
                      key={upperLevel}
                      x1={node.x + KEY_WIDTH}
                      y1={dividerY}
                      x2={node.x + KEY_WIDTH + ARRAY_WIDTH}
                      y2={dividerY}
                      className="stroke-current stroke-[1.2]"
                    />
                  );
                })}
                <text
                  x={node.x + KEY_WIDTH / 2}
                  y={levelY(1) + 5}
                  textAnchor="middle"
                  className="fill-current text-[13px]"
                >
                  {node.key === "head" ? "X" : node.key}
                </text>
                {node.key === "head" && (
                  <text
                    x={node.x + KEY_WIDTH / 2}
                    y={bottom + 30}
                    textAnchor="middle"
                    className="fill-current text-[13px]"
                  >
                    Head
                  </text>
                )}
              </g>
            );
          })}

          <text
            x="510"
            y="20"
            textAnchor="middle"
            className="fill-current text-[15px]"
          >
            {step.layer > 0 ? `i = ${step.layer}` : "循环结束"}
          </text>
          <text
            x={currentNode.x + KEY_WIDTH / 2}
            y="20"
            textAnchor="middle"
            className="fill-current text-[14px]"
          >
            current
          </text>
          <line
            x1={currentNode.x + KEY_WIDTH / 2}
            y1="26"
            x2={currentNode.x + KEY_WIDTH / 2}
            y2={levelY(currentNode.height) - CELL_HEIGHT / 2 - 5}
            className="stroke-current stroke-[1.8]"
            markerEnd="url(#skip-list-arrow)"
          />
        </svg>
      </div>

      <pre className="border-border mt-4 w-full overflow-x-auto rounded border p-3 font-mono text-sm leading-6">
        <code className="language-cpp block min-w-max">
          <span className={codeLineClass(step.line === "decrement")}>
            <span className={syntax.keyword}>for</span> (std::size_t i =
            level_; i &gt; <span className={syntax.literal}>0</span>; --i) {'{'}
          </span>
          <span className={codeLineClass(step.line === "while", "ps-4")}><span className={syntax.keyword}>while</span> (current-&gt;<span className={syntax.member}>forward</span>[i - 1] != <span className={syntax.literal}>nullptr</span> && <span className={syntax.function}>comp_</span>(current-&gt;<span className={syntax.member}>forward</span>[i - 1]-&gt;<span className={syntax.member}>key</span>, key)) {'{'}</span>
          <span className={codeLineClass(step.line === "advance", "ps-8")}>
            current = current-&gt;<span className={syntax.member}>forward</span>[i -
            <span className={syntax.literal}>1</span>];
          </span>
          <span className="block ps-6">{'}'}</span>
          <span className="block ps-4">{'}'}</span>
          <span className={codeLineClass(step.line === "next")}>
            current = current-&gt;<span className={syntax.member}>forward</span>[
            <span className={syntax.literal}>0</span>];
          </span>
          <span className={codeLineClass(step.line === "equal")}>
            <span className={syntax.keyword}>if</span> (current !=
            <span className={syntax.literal}>nullptr</span> &&
            <span className={syntax.function}>isEqual</span>(current-&gt;
            <span className={syntax.member}>key</span>, key)) {'{'}
          </span>
          <span className={codeLineClass(step.line === "return", "ps-4")}>
            <span className={syntax.keyword}>return</span> current;
          </span>
          <span className="block">{'}'}</span>
        </code>
      </pre>
      <p className="mt-2 text-sm">{step.message}</p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="border-border grid size-8 place-items-center rounded border font-mono text-lg disabled:opacity-40"
          aria-label="上一状态"
          onClick={() => setStepIndex(index => index - 1)}
          disabled={stepIndex === 0}
        >
          ←
        </button>
        <button
          type="button"
          className="border-border grid size-8 place-items-center rounded border font-mono text-lg disabled:opacity-40"
          aria-label="下一状态"
          onClick={() => setStepIndex(index => index + 1)}
          disabled={stepIndex === executionSteps.length - 1}
        >
          →
        </button>
      </div>
    </section>
  );
}
