---
title: "Dijkstra’s algorithm"
description: "从贪心选择到代码实现，理解 Dijkstra 算法为何正确，以及它为何要求边权非负。"
pubDatetime: 2026-08-10T00:00:00.000Z
tags:
  - Algorithms
  - Graph
  - Dijkstra
draft: false
---

假设你打开地图，准备从学校前往一家从未去过的书店。地图上有无数条道路：有的距离短，却拥堵严重；有的看似绕远，实际耗时更少。导航软件必须从这些可能的路线中，找出一条总代价最小的路径。

如果道路只有十几条，我们或许可以逐一尝试。但当一张地图包含数百万个路口和道路时，穷举所有路线几乎不可能。我们需要一种更聪明的方法：也就是 Dijkstra 算法。

## Table of contents

## Origin

> 从鹿特丹到格罗宁根的最短路径是什么？实际上，这就是对于任意两座城市之间的最短路问题。解决这个问题实际上大概只花了我20分钟：一天早上，我和我的未婚妻在阿姆斯特丹购物，累了，我们便坐在咖啡馆的露台上喝咖啡，然后我就试了一下能否用一个算法解决最短路问题。正如我所说，这是一个20分钟的发现。不过实际上，我在3年后的1959年才把这个算法发表在论文上。即使现在来看这篇论文的可读性也非常高，这个算法之所以如此优雅，其中一个原因就是我没用笔纸就设计了它。后来我才知道，没用笔纸设计的优点之一是你不得不避免所有可避免的复杂问题。令我惊讶的是，这个算法最终成为我成名的基石之一。
> — Edsger Dijkstra, in an interview with Philip L. Frana, Communications of the ACM, 2001

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260810145911288.png "大佬的操作永远是这么朴实无华")



## Question：非负权有向图上的单源最短路径

设有一个**带权有向图** $G = (V, E)$。其中：

- $V$ 是节点集合；
- $E$ 是有向边集合；
- 每条边 $(u, v)$ 有权重 $w(u, v) \ge 0$。

权重可以表示距离、时间或费用。$w(u, v) \ge 0$ 表示所有边权都非负。给定源点 $s$，单源最短路径要计算 $s$ 到每个可达节点 $v$ 的最小路径长度，记为 $\delta(s, v)$。

例如，边 $A \rightarrow B$ 的权重为 $4$，表示从 $A$ 直接到 $B$ 的代价是 $4$。图是有向的，因此 $A \rightarrow B$ 不自动意味着也能从 $B$ 到 $A$。

## 从「暂定距离」开始

算法维护数组 `distances`。`distances[v]` 是目前已知的从源点到 $v$ 的最好距离，因此它是一个**上界**：它可能还不是最短距离，但绝不会小于真正的最短距离。为方便证明，下文记 $d[v] = \text{distances}[v]$，它表示节点 $v$ 当前的暂定距离。

初始化时：

- 源点 $s$ 的暂定距离为 $0$；
- 其他节点的暂定距离为 $\infty$；
- 所有节点都还没有被确定。

当已经知道到 $u$ 的一条路径时，我们检查每条出边 $u \rightarrow v$。如果经过 $u$ 到 $v$ 更短，就更新 $v$ 的暂定距离：

$$
\text{distances}[v] \leftarrow \min\bigl(\text{distances}[v],\ \text{distances}[u] + w(u, v)\bigr)
$$

这个更新动作叫作**松弛**（relaxation）。它的含义很朴素：已有路线 $s \leadsto u$ 加上最后一条边 $u \rightarrow v$，也许能改进到 $v$ 的最佳已知路线。

## 贪心选择为什么正确

算法反复从尚未确定的节点中，选出暂定距离最小的一个。关键不变量是：

> 每当选出暂定距离最小的未确定节点时，它的暂定距离就已经是最终最短距离。

### 归纳假设

把已经确定最短距离的节点组成的集合记为 $S$，其余节点记为 $U$。本轮从 $U$ 中选出暂定距离最小、且暂定距离有限的节点 $u$。

我们按节点加入 $S$ 的顺序归纳。开始时，源点 $s$ 以 $d[s] = 0 = \delta(s, s)$ 加入 $S$，结论成立。

现在假设 $S$ 中每个节点 $v$ 都满足 $d[v] = \delta(s, v)$，证明新选出的 $u$ 也满足这个等式。

### 反证：假设 $u$ 还能更近

每个有限的 $d[v]$ 都来自一条实际发现的 $s$ 到 $v$ 的路径，所以 $\delta(s, v) \le d[v]$。若结论不成立，只可能是 $\delta(s, u) < d[u]$。取一条从 $s$ 到 $u$ 的真实最短路径 $P$。


因为 $s \in S$ 而 $u \in U$，沿着 $P$ 前进时必然会第一次从 $S$ 走到 $U$。设跨越边界的边为 $a \rightarrow b$：

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260810163909505.png)

这里，$a$ 是 $P$ 上最后一个属于 $S$ 的节点，$b$ 是紧接着第一个属于 $U$ 的节点。

### 关键不等式

1. **$a$ 的距离已经正确。** 归纳假设给出：
   $$
   d[a] = \delta(s, a)
   $$

2. **算法已经处理过 $a \rightarrow b$。** 当 $a$ 进入 $S$ 时，算法松弛过这条边；之后 $d[b]$ 只可能变小，因此：

   $$
   d[b] \le d[a] + w(a, b)
   $$

3. **右侧正好是路径 $P$ 到 $b$ 的前缀长度。** $P$ 的 $s$ 到 $a$ 前缀本身也是最短路径；否则用一条更短的前缀替换它，就能得到一条比 $P$ 更短的 $s$ 到 $u$ 路径。于是：

   $$
   d[b] \le \delta(s, a) + w(a, b)
   = \operatorname{length}(P[s \leadsto b])
   $$

4. **非负边权使前缀不会更长。** 从 $b$ 到 $u$ 的后缀边权都非负，后缀长度不小于 $0$，所以：

   $$
   d[b]
   \le \operatorname{length}(P[s \leadsto b])
   \le \operatorname{length}(P)
   = \delta(s, u)
   < d[u]
   $$

由第 3 步和第 4 步可得 $d[b] < d[u]$。但 $b \in U$，而 $u$ 是从 $U$ 中选出的暂定距离最小的节点，矛盾。

因此，$\delta(s, u) < d[u]$ 不成立；又总有 $\delta(s, u) \le d[u]$，所以 $d[u] = \delta(s, u)$。这完成了归纳步骤。若剩余节点的暂定距离全为 $\infty$，它们从 $s$ 不可达，最短距离也正是 $\infty$。

### 为什么负权边会破坏证明

证明唯一使用「边权非负」的地方是第 4 步：后缀长度必须不小于 $0$。若存在负权边，路径前缀可能比整条路径更长，便无法推出 $d[b] < d[u]$；算法也就不能保证当前选出的节点不会在以后变得更近。这正是 Dijkstra 算法不适用于负权边的原因。

## 由不变量推导算法

证明告诉我们可以安全地重复以下过程：

1. 取出暂定距离最小的未确定节点 $u$；
2. 将 $u$ 标记为距离已确定；
3. 松弛 $u$ 的所有出边；
4. 直到没有可处理的节点。

为了让代码更容易理解，下面的实现每轮都用普通循环寻找暂定距离最小的未确定节点。

## Implementation

为了方便理解，我们可以看这张图：
![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260810114242597.png)

```python
def dijkstra(graph, source):
    distances = {}
    visited = set()

    for node in graph:
        distances[node] = float("inf")
    distances[source] = 0

    while True:
        current_node = None
        current_distance = float("inf")

        for node in graph:
            if node not in visited and distances[node] < current_distance:
                current_node = node
                current_distance = distances[node]

        if current_node is None:
            break

        visited.add(current_node)

        for neighbor, weight in graph[current_node]:
            candidate = distances[current_node] + weight
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate

    return distances


graph = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": [],
}

print(dijkstra(graph, "A"))
```

输出为：

```text
{'A': 0, 'B': 3, 'C': 1, 'D': 4}
```

## How does it really work?

考虑以下有向边：

- $A \rightarrow B(4)$；
- $A \rightarrow C(1)$；
- $C \rightarrow B(2)$；
- $B \rightarrow D(1)$；
- $C \rightarrow D(5)$。

从 $A$ 出发：

1. 初始时 $d[A] = 0$，其余为 $\infty$。选定 $A$ 后，得到 $d[B] = 4$、$d[C] = 1$。
2. 未确定节点中 $C$ 最小，选定 $C$。松弛后，$d[B]$ 从 $4$ 改为 $3$，$d[D] = 6$。
3. 接着选定 $B$，因为 $d[B] = 3$。通过 $B \rightarrow D$，$d[D]$ 从 $6$ 改为 $4$。
4. 最后选定 $D$。

最终距离是：$A = 0$、$C = 1$、$B = 3$、$D = 4$。其中到 $B$ 的最短路径是 $A \rightarrow C \rightarrow B$，到 $D$ 的最短路径是 $A \rightarrow C \rightarrow B \rightarrow D$。

也可以参考[python tour](https://pythontutor.com/index.html)来看可视化过程。

> [!Note]
> Dijkstra’s algorithm**不能处理负权边**，即使图中没有负环也不行。原因不是实现细节，而是上面的贪心证明依赖边权非负。若图可能包含负边，应使用 Bellman–Ford 算法；它还能检测从源点可达的负权环。
