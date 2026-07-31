---
title: "Machine Learning:Tensor For Beginners"
description: "从数据形状、矩阵梯度到雅可比矩阵，理解机器学习中的张量求导、输出轴与输入轴，以及反向传播的核心思路。"
pubDatetime: 2026-07-31T01:27:32.489Z
tags:
  - Tensor
  - Machine Learning
draft: false
---

如果你接触过机器学习，或许已经无数次见过 Tensor（张量）这个词。

PyTorch 中的数据以 Tensor 的形式存在，神经网络中的参数和计算过程也都建立在 Tensor 之上。

但 Tensor 究竟是什么？

它只是一个高维数组的别称吗？为什么普通的向量和矩阵无法满足机器学习的需求？又为什么神经网络训练过程中产生的梯度，同样需要用 Tensor 来表示？

要回答这些问题，我们需要回到最基础的数学对象：标量、向量和矩阵。

因为 Tensor 并不是一个突然出现的新概念，而是数学表示能力自然发展的结果。

在机器学习中，我们经常处理彩色图像（高 × 宽 × 通道）和视频（时间 × 高 × 宽 × 通道）这类多维数据。数学上，这些多维数组统称为张量（tensor）。

- 标量（一个数）是零阶张量。
- 向量（一维数组）是一阶张量。
- 矩阵（二维数组）是二阶张量。
- 三维及更高维的数组统称为高阶张量。

和矩阵一样，张量可以逐元素相加、逐元素相乘（Hadamard 乘法），也可以与标量相乘。而更复杂的张量积则不在本文讨论范围内，当然如果你真的很感兴趣，可以看这篇内容：[张量积](https://www.bananaspace.org/wiki/%E5%BC%A0%E9%87%8F%E7%A7%AF)

## Table of contents

## 张量求导

训练模型时，我们需要最小化损失函数 $\mathcal{L}$。若 $\mathcal{L}$ 是参数 $W$ 的函数，便要计算 $\nabla_W \mathcal{L}$ 来更新 $W$。这引出一个问题：<u>输入是矩阵或更高阶张量时，导数的形状是什么？</u>

下面从最简单的情形开始，再逐步推广。

### 标量函数的梯度

设 $f(\mathbf{x}) : \mathbb{R}^n \to \mathbb{R}$ 是标量函数，输入为 $n$ 维向量 $\mathbf{x}$。它的梯度 $\nabla_{\mathbf{x}} f$ 仍是 $n$ 维向量，每个分量对应 $f$ 对一个输入分量的偏导数：

$$
\nabla_{\mathbf{x}} f = \begin{pmatrix}
\dfrac{\partial f}{\partial x_1}, & \dfrac{\partial f}{\partial x_2}, & \cdots, & \dfrac{\partial f}{\partial x_n}
\end{pmatrix}^\top
$$

这就是熟悉的梯度向量。

### 矩阵梯度

现在令输入为 $m \times n$ 矩阵 $X$，输出仍为标量 $f(X)$。对 $X$ 中的每个元素 $x_{ij}$ 求偏导，并按 $X$ 的形状排成矩阵，就得到矩阵梯度：

> [!INFO]
> 设 $f: \mathbb{R}^{m \times n} \to \mathbb{R}$ 为标量函数，则 $f$ 对矩阵
> $X$ 的梯度定义为一个 $m \times n$ 的矩阵：
>
> $$
> \nabla_X f = \begin{pmatrix}
> \frac{\partial f}{\partial x_{11}} & \frac{\partial f}{\partial x_{12}} & \cdots & \frac{\partial f}{\partial x_{1n}} \\[4pt]
> \frac{\partial f}{\partial x_{21}} & \frac{\partial f}{\partial x_{22}} & \cdots & \frac{\partial f}{\partial x_{2n}} \\
> \vdots & \vdots & \ddots & \vdots \\
> \frac{\partial f}{\partial x_{m1}} & \frac{\partial f}{\partial x_{m2}} & \cdots & \frac{\partial f}{\partial x_{mn}}
> \end{pmatrix}
> $$

因此，**标量对矩阵求导，得到的矩阵与输入矩阵形状相同。** 这正是反向传播中反复使用的结论。

### 雅可比矩阵

再进一步，输入为 $n$ 维向量 $\mathbf{x}$，输出为 $p$ 维向量 $\mathbf{f}(\mathbf{x}) = (f_1(\mathbf{x}), \dots, f_p(\mathbf{x}))^\top$。每个输出分量 $f_i$ 都可对每个输入分量 $x_j$ 求偏导，共有 $p \times n$ 个偏导数。按“第 $i$ 行第 $j$ 列为 $\partial f_i / \partial x_j$”排列，便得到**雅可比矩阵**（Jacobian matrix）：

> [!INFO]
> 设 $\mathbf{f}: \mathbb{R}^n \to \mathbb{R}^p$，其雅可比矩阵
> $J_{\mathbf{f}}$ 为 $p \times n$ 矩阵：
>
> $$
> J_{\mathbf{f}} = \begin{pmatrix}
> \frac{\partial f_1}{\partial x_1} & \frac{\partial f_1}{\partial x_2} & \cdots & \frac{\partial f_1}{\partial x_n} \\[4pt]
> \frac{\partial f_2}{\partial x_1} & \frac{\partial f_2}{\partial x_2} & \cdots & \frac{\partial f_2}{\partial x_n} \\
> \vdots & \vdots & \ddots & \vdots \\
> \frac{\partial f_p}{\partial x_1} & \frac{\partial f_p}{\partial x_2} & \cdots & \frac{\partial f_p}{\partial x_n}
> \end{pmatrix}, \qquad (J_{\mathbf{f}})_{ij} = \frac{\partial f_i}{\partial x_j}
> $$

> [!WARNING]
> 在大多数优化与机器学习文献中，雅可比矩阵都采用“输出维度为行、输入维度为列”的 $p \times n$ 约定。统一这一约定后，就不会因行、列方向不同而混淆。

### 一般情形

如果输入、输出都是矩阵，例如 $F: \mathbb{R}^{m \times n} \to \mathbb{R}^{p \times q}$，每个输出元素 $F_{ij}$ 都要对每个输入元素 $X_{kl}$ 求偏导。这些偏导数构成一个四维数组，也就是**四阶张量**：

$$
(\nabla_X F)_{ijkl} = \frac{\partial F_{ij}}{\partial X_{kl}}
$$

把导数记为 $D$，它的形状是 $p \times q \times m \times n$：

- 前两轴 $(i,j)$ 是**输出轴**，它们选择输出矩阵中的 $F_{ij}$。
- 后两轴 $(k,l)$ 是**输入轴**，它们选择输入矩阵中的 $X_{kl}$。

因此，$D_{ijkl}$ 的完整含义是“输出 $F_{ij}$ 对输入 $X_{kl}$ 的敏感程度”。

> [!EXAMPLE] 对矩阵求导的含义
> 令
>
> $$
> X =
> \begin{pmatrix}
> X_{1,1} & X_{1,2} \\
> X_{2,1} & X_{2,2}
> \end{pmatrix}.
> $$
>
> 取一个具体的矩阵函数：
>
> $$
> A =
> \begin{pmatrix}
> 1 & 2 \\
> 3 & 4
> \end{pmatrix},
> \qquad
> F(X) = AX.
> $$
>
> 例如，代入
>
> $$
> X =
> \begin{pmatrix}
> 5 & 6 \\
> 7 & 8
> \end{pmatrix},
> $$
>
> 输出左上角元素为
>
> $$
> F_{1,1} = 1 \times 5 + 2 \times 7 = 19.
> $$
>
> 求导时不代入具体数值，而是保留变量。因此，$F_{1,1}$ 的表达式为
>
> $$
> F_{1,1} = X_{1,1} + 2X_{2,1}.
> $$
>
> 固定一个输出元素 $F_{i,j}$ 后，它是 $X$ 的四个元素组成的标量函数。因此，
>
> $$
> \frac{\partial F_{i,j}}{\partial X}
> =
> \begin{pmatrix}
> \dfrac{\partial F_{i,j}}{\partial X_{1,1}} &
> \dfrac{\partial F_{i,j}}{\partial X_{1,2}} \\
> \dfrac{\partial F_{i,j}}{\partial X_{2,1}} &
> \dfrac{\partial F_{i,j}}{\partial X_{2,2}}
> \end{pmatrix}.
> $$
>
> 这里的 $\partial F_{i,j}/\partial X$ 不是普通的“相除”，而是把 $F_{i,j}$ 对 $X$ 中每个元素的偏导数按原来的位置排成一个矩阵。
>
> 对这个具体的 $F_{1,1}$ 逐项求导：
>
> $$
> \begin{aligned}
> \frac{\partial F_{1,1}}{\partial X_{1,1}} &= 1, &
> \frac{\partial F_{1,1}}{\partial X_{1,2}} &= 0, \\
> \frac{\partial F_{1,1}}{\partial X_{2,1}} &= 2, &
> \frac{\partial F_{1,1}}{\partial X_{2,2}} &= 0.
> \end{aligned}
> $$
>
> 所以
>
> $$
> \frac{\partial F_{1,1}}{\partial X}
> =
> \begin{pmatrix}
> 1 & 0 \\
> 2 & 0
> \end{pmatrix}.
> $$
>
> 这正是四阶导数中的一个切片，也就是 $D_{1,1,:,:}$。

更一般地，若输入是 $k$ 阶张量、输出是 $l$ 阶张量，导数就有 $k+l$ 个轴。实际编程时，自动求导框架会直接计算所需的缩并[^1]结果，我们通常无需手动展开这些高维结构。

> [!EXAMPLE]
> 设 $\mathbf{x} \in \mathbb{R}^n$ 为输入向量，$W \in \mathbb{R}^{n \times m}$ 为权重矩阵，$\mathbf{b} \in \mathbb{R}^m$ 为偏置向量，定义
>
> $$
> \mathbf{f}(W) = W^\top \mathbf{x} + \mathbf{b}.
> $$
>
> 这里 $\mathbf{f}$ 是 $m$ 维向量，可以拆成 $m$ 个标量函数：
>
> $$
> \mathbf{f}(W) =
> \begin{pmatrix}
> f_1(W) \\
> f_2(W) \\
> \vdots \\
> f_m(W)
> \end{pmatrix}.
> $$
>
> 先固定一个输出分量 $f_i$。此时 $f_i$ 是标量，而 $W$ 是由 $n \times m$ 个元素组成的矩阵。因此，$\partial f_i/\partial W$ 的含义是 $f_i$ 对 $W$ 每个元素的偏导数，并按 $W$ 的形状排成矩阵：
>
> $$
> \frac{\partial f_i}{\partial W}
> =
> \begin{pmatrix}
> \dfrac{\partial f_i}{\partial W_{1,1}} & \cdots & \dfrac{\partial f_i}{\partial W_{1,m}} \\
> \vdots & \ddots & \vdots \\
> \dfrac{\partial f_i}{\partial W_{n,1}} & \cdots & \dfrac{\partial f_i}{\partial W_{n,m}}
> \end{pmatrix}.
> $$
>
> 这个矩阵的形状为 $n \times m$。对 $f_1,f_2,\ldots,f_m$ 分别做同样的计算，再沿着新的输出轴叠起来，就得到形状为 $m \times n \times m$ 的三阶张量：
>
> $$
> \left(\frac{\partial \mathbf{f}}{\partial W}\right)_{i,j,k}
> = \frac{\partial f_i}{\partial W_{j,k}}.
> $$
>
> 对当前函数，逐元素写出第 $i$ 个输出：
>
> $$
> f_i = \sum_{r=1}^n W_{r,i}x_r+b_i.
> $$
>
> 因此，
>
> $$
> \frac{\partial f_i}{\partial W_{j,k}} =
> \begin{cases}
> x_j, & k=i, \\
> 0, & k\ne i.
> \end{cases}
> $$
>
> 也就是说，$f_i$ 只依赖 $W$ 的第 $i$ 列。固定 $i$ 后，$\partial f_i/\partial W$ 只有第 $i$ 列非零，这一列正是输入向量 $\mathbf{x}$。
>
> 实际训练中，我们关心的是标量损失 $\mathcal{L}$ 对 $W$ 的梯度。利用链式法则，可直接计算 $\nabla_W \mathcal{L}$，结果是与 $W$ 同形的矩阵。中间的高阶导数在链式法则的缩并中被消去，最终只留下参数对应的梯度。
>
> 因此，我们常说“梯度与参数同形”。

## 求导法则

梯度运算与标量求导遵循相同的基本规则：

1.  **线性法则**：$\nabla_X (f + g) = \nabla_X f + \nabla_X g$，$\nabla_X (\alpha f) = \alpha \nabla_X f$（$\alpha$ 为常数）。
2.  **乘积法则**：$\nabla_X (f \cdot g) = f \cdot \nabla_X g + g \cdot \nabla_X f$。
3.  **链式法则**：若 $y = g(X)$，$z = f(y)$，则 $\nabla_X z = \nabla_y z \cdot \nabla_X g$（这里的乘法需要按照张量缩并来理解，但形式上与以前学的链式法则一致）。

到这里，我们已经从标量、向量和矩阵，一步步走到了张量。

回顾整个过程，张量并不是一个突然出现的新概念。它只是描述数据的一种更自然的方式：当我们需要表示图片、声音、文本，甚至一个神经网络中的参数时，低维的向量和矩阵已经不足以进行表达，而张量提供了一种统一的语言。

同样，对于张量求导，我们不要望而生畏，这只需要用到一些基础的微积分和线性代数而已。它本质上仍然遵循微积分中熟悉的思想：研究变化，并利用这些变化寻找更好的方向。

如今，深度学习框架中的自动求导、梯度下降和神经网络训练，都建立在这些看似抽象的数学结构之上。理解张量，不只是理解一个数据结构，而是在理解现代机器学习背后的计算语言。

[^1]: **缩并**（contraction）是把一对对应的轴相乘后求和，从而消去这对轴。矩阵乘法 $C_{ik}=\sum_j A_{ij}B_{jk}$ 就是对共同指标 $j$ 做缩并。
