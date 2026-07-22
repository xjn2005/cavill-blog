---
title: "从计算图理解反向传播"
description: "An intuitive introduction to backpropagation through computational graphs, explaining how chain rule and dynamic programming make efficient gradient computation possible."
pubDatetime: 2026-07-16T03:20:00.420Z
tags:
  - Deep Learning
  - Backpropagation
draft: false
---

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722113910015.jpg)

神经网络中的每一次计算，本质上都可以拆解成一系列简单运算，例如加法、乘法、指数、对数等。
为了更清楚地描述这些计算过程，我们通常使用 **计算图（Computational Graph）**。因此，这也是对**神经网络的一种抽象**。
计算图是一种有向无环图（Directed Acyclic Graph, DAG），其中：

- 每个节点（Node）表示一个变量或一次运算；
- 每条边（Edge）表示数据的流动方向；
- 最终节点表示整个表达式的输出。

计算图最大的优势在于，它将一个复杂的表达式拆分成许多简单的局部计算，使得每一步都可以独立分析。这不仅使前向计算更加直观，也为后面的反向传播提供了基础。

## **Computational Graphs**

例如，考虑以下表达式$e=(a+b)\times(b+1)$。这里有三种运算：两种加法和一种乘法。为了便于讨论，我们引入两个中间变量，$c$ 和 $d$。这样，每个函数的输出都有一个变量。现在我们有：

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722114442657.png)

其中$w_i$为上一个节点对于对应边的下一个节点的偏导数。$i = 1,2,3…$

> [!INFO] 复合偏导数求导法则
> 如果 $z = f(u,v)$, 其中 $u = \varphi(x, y)$, $v = \psi(x, y)$, 则：
>  - 对 $x$ 的偏导数：$\frac{\partial z}{\partial x} = \frac{\partial f}{\partial u} \frac{\partial u}{\partial x} +  \frac{\partial f}{\partial v} \frac{\partial v}{\partial x}$
>  - 对 $y$ 的偏导数：$\frac{\partial z}{\partial y} = \frac{\partial f}{\partial u} \frac{\partial u}{\partial y} +  \frac{\partial f}{\partial v} \frac{\partial v}{\partial y}$
>


因此我们可以这样求出$\frac{\partial e}{\partial b}$。
$\frac{\partial e}{\partial b} =w_1 \times w_3 +w_4 \times w_5$ 。同理易得$\frac{\partial e}{\partial a} =w_1 \times w_2$。

但显然这几乎是最简单的一种形式，对于复杂的神经网络而言，往往会出现非常大量的参数和非常多的层数，面对这么大规模的交互，产生的路径组合也是非常大规模的。


![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722114533260.png)

如果要算 $a$、$b$、$c$ 到 $L$，那么我们会得到 $w_1w_2+w_1w_3+w_1w_4$。这里我们需要做 $3$ 次乘法和 $2$ 次加法。

但是如果从 $L$ 到 $a$、$b$、$c$，我们会得到 $w_1(w_2+w_3+w_4)$。这里我们只需要做 $2$ 次加法和 $1$ 次乘法。而反向传播的思想与因式分解类似。它通过复用已经计算出的中间梯度，将链式法则中的重复计算提取出来。

当然，对于这个例子而言，优化确实不大。但是如果假设$w_1$被数亿个参数共享呢？这样我们可以节约无数的时间，因为自上而下或者说反向计算可以让我们只做一次乘法，并且我们省去了无数不必要的重复计算。本质上来说，这是「动态规划」。

因此，「**反向传播**」并不是一种新的求导方法，而是对链式法则的一种高效组织方式。它通过保存并复用中间梯度，将原本庞大的重复计算转化为一次有序的反向遍历。正是这种对计算过程的重新组织，使得现代深度神经网络的训练成为可能。
