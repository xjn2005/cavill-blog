---
title: "How Google Ranks the Web"
description: "An intuitive guide to PageRank: how random walks, link structure, and the damping factor help Google rank pages across the web."
pubDatetime: 2026-07-27T08:35:23.184Z
tags:
  - PageRank
draft: false
ogImage: "https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260728094113567.png"
---

Imagine a person who has never used Google before.

They open a random webpage and start clicking links randomly. They do not search for anything, they do not know what they are looking for. They simply wander through the Internet forever.

After a very long time, where will they spend most of their time?

Surprisingly, this simple random walk gives us a powerful way to measure the importance of webpages.

> [!NOTE]
> Before the era of AI-powered search, search engines played a crucial role in how people accessed information on the Internet.
>
> If you have ever used traditional search engines, you probably understand why ranking webpages matters.
> ![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260727164304780.jpg)

Before we dive into the principles behind PageRank, let me ask a question: what makes a webpage important?

Probably, you would think that links matter a lot. And you are right. But here comes another question: does one link from an important webpage matter more, or do hundreds of meaningless links matter more?

This leads to a circular definition:

A webpage is important because important webpages link to it.

But then, what makes those webpages important?

The answer seems to depend on itself.

To solve this problem, PageRank treats the Internet as a directed graph.

Each webpage is a node, and each hyperlink is a directed edge.

For example, suppose we have three webpages:

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260727172848276.png)

This graph describes how webpages are connected, but it does not tell us which webpage is more important.

So,how can we transform this structure into a measure of importance?

The idea is simple.

If a person randomly follows hyperlinks on the Internet, the probability of moving from one webpage to another depends only on the links between them.

Like our example, if webpage A has two outgoing links pointing to B and C, the probability of moving to each page is:

$$
P(A\rightarrow B)=\frac12
$$

$$
P(A\rightarrow C)=\frac12
$$

Therefore, we can represent the Internet as a **transition matrix**.

Each entry represents the probability of moving from one webpage to another.

For our example, the transition matrix is:

$$
M=
\begin{bmatrix}
0 & \frac{1}{2} & \frac{1}{2}\\
0 & 0 & 1\\
1 & 0 & 0
\end{bmatrix}
$$

Each row represents the current webpage, and each entry gives the probability of moving to another webpage.

> [!NOTE]
> Different textbooks may define transition matrices differently.
>
> Some use **columns** to represent webpages, while others use **rows**.
>
> The choice does not matter as long as the convention remains consistent.



Now, instead of tracking the exact location of the surfer, we can describe their location using a probability distribution.

For example, let

$$
r_t=
\begin{bmatrix}
P(A)&P(B)&P(C)
\end{bmatrix}
$$

represent the probability of the surfer being on each webpage at time $t$.

After one step, the new distribution can be calculated by:

$$
r_{t+1}=r_tM
$$

If we continue this process:

$$
r_0\rightarrow r_1\rightarrow r_2\rightarrow\cdots
$$

the probability distribution will gradually converge to a stable state.

This stable distribution gives us a natural definition of importance.

A webpage that receives a higher probability in the long run is considered more important.

This probability distribution is exactly the PageRank of each webpage.

Mathematically, this means that the PageRank vector satisfies:

$$
r=rM
$$

In other words, applying the transition matrix does not change the probability distribution anymore.

To see why this is an eigenvector problem, we can rewrite the equation in the standard form.

Taking the transpose of both sides:

$$
r^T=M^Tr^T
$$

which can be rewritten as:

$$
M^Tr^T=1\cdot r^T
$$

This matches the definition of an eigenvector:

$$
Av=\lambda v
$$

Therefore, the PageRank vector is the eigenvector of the transition matrix corresponding to the eigenvalue 1.

However, the real Internet is not as simple as our example.

There are two problems with this model.

1. What if a webpage has no outgoing links?

For example, if the surfer arrives at a webpage without any hyperlinks, where should they go next?

2. What if a group of webpages only link to each other?

For example:$A\rightarrow B,\quad B\rightarrow A$

Once the surfer enters this group, they may never leave.

To solve these problems, PageRank introduces a simple but powerful idea: teleportation.

Instead of always following hyperlinks, the surfer occasionally jumps to a random webpage.

With probability $\alpha$, the surfer follows a hyperlink.

With probability $1-\alpha$, the surfer randomly jumps to another webpage.

$$
r_{t+1}​=\alpha r_{t}​M+(1−\alpha)v
$$

where:

- $M$ is the transition matrix describing the link structure of the Web
- $v$ is the probability distribution of random jumps
- $\alpha$ is called the damping factor, usually set to 0.85 in practice

The beauty of PageRank is that it does not require us to define importance explicitly.

Instead, it lets importance emerge from the structure of the Web itself.

A webpage is important not because it says it is important, but because important webpages point to it.