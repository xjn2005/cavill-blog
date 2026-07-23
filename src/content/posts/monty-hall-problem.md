---
title: "Monty Hall problem"
description: "A deep dive into the Monty Hall Problem. This article explains the famous probability puzzle using both intuitive case analysis and Bayes' theorem, showing why switching doors gives a 2/3 chance of winning and why human intuition often fails in probabilistic reasoning."
pubDatetime: 2026-07-22T07:00:21.584Z
tags:
  - Probability
  - Bayes theorem
draft: false
---

Monty Hall Problem（蒙提霍尔问题）是一个相当有趣的概率问题，我记得在高中学到贝叶斯定理的时候，数学书里还有一页来介绍。不过我在高中时候并没有好好去阅读这页内容，所以你可以认为直到我准备写这篇blog之前（maybe a few days ago？），我还是不理解的状态。好在我现在彻底搞懂了。虽然有点丢人，毕竟我的专业是统计学。

![comic of monty hall](https://imgs.xkcd.com/comics/monty_hall.png "Permanent link to this comic: https://xkcd.com/1282/")

这个问题是这样的：
> 假设你正在参加一个游戏节目，你被要求在三扇门中选择一扇：其中一扇后面有一辆车；其余两扇后面则是山羊。你选择了一道门，假设是一号门，然后知道所有门后面有什么的主持人，开启了另两扇中 其中一扇后面有山羊的门，假设是三号门。他然后问你：“你想选择二号门吗？”变换你的选择对你来说是一种优势吗？

一般人可能都会选不换，直觉的想，无论换不换都是$\frac{1}{2}$的概率。但是如果你接触过贝叶斯，你会知道这个问题不是那么简单。
我们可以这样想，无论怎么说，我们第一次选择的门后面只可能出现两种情况：山羊或者车。
<div style="display: flex; justify-content: center; gap: 10px;">
  <img src="https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722163610705.jpg" style="width:45%;">
  <img src="https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722163726728.jpg" style="width:45%;">
</div>

因此我们可以这样想：起初我们选择每一扇门的概率是$\frac{1}{3}$，这是很显然的。所以我们可以分成三种情况来看。
## 第一种情况
此时我们第一次选择了一只羊，发生的概率为 $\frac{1}{3}$。
由于主持人知道汽车所在的位置，因此他必须打开另一扇羊所在的门，而不会打开汽车所在的门。
此时，剩下唯一一扇没有打开的门就是汽车所在的位置。
因此：
- 如果选择换门，我们将从原来的羊换到汽车，最终获得汽车；
- 如果坚持原来的选择，则仍然会停留在原来的羊，最终失败。

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722170542744.png)

## 第二种情况
此时我们第一次选择了汽车所在的门，发生的概率为 $\frac{1}{3}$。
由于主持人知道每扇门后的物品，因此他必须打开剩余两扇门中的一扇羊所在的门，而不会打开汽车所在的门。
此时，剩下唯一一扇没有打开的门就是另一只羊所在的位置。
因此：
- 如果选择换门，我们会从原来的汽车换到羊，最终失败；
- 如果坚持原来的选择，则仍然保留最初选中的汽车，最终获胜。

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722172058416.png)

## 第三种情况
由于第三种情况和第一种情况几乎一样，因此不再赘述。

![](https://cdn.jsdelivr.net/gh/xjn2005/my-blog-images/img/20260722172254306.png)

问题到这里已经成为了一个简单的古典概型问题：
$$
P(\text{换门获胜})
=
\frac{1}{3}
+
\frac{1}{3}
=
\frac{2}{3}
$$

$$
P(\text{坚持获胜})
=
\frac{1}{3}
$$

## 更“数学”的方法
设事件：

$$
C=\{\text{汽车在所选择的门后}\}
$$

$$
S=\{\text{第一次选择的门}\}
$$

$$
H=\{\text{主持人打开了一扇羊所在的门}\}
$$

根据贝叶斯公式：

$$
P(C|H)=\frac{P(H|C)P(C)}{P(H)}
$$

由于第一次选择汽车的概率为：

$$
P(C)=\frac{1}{3}
$$

如果第一次选择的就是汽车，主持人有两扇羊门可以选择打开，因此：

$$
P(H|C)=1
$$

而主持人打开羊门的总概率为：

$$
P(H)
=
P(H|C)P(C)+P(H|\overline{C})P(\overline{C})
$$

其中：

$$
P(\overline{C})=\frac{2}{3}
$$

当第一次选择不是汽车时，主持人一定能够打开一扇羊门，因此：

$$
P(H|\overline{C})=1
$$

所以：

$$
P(H)=1\times\frac13+1\times\frac23=1
$$

最终：

$$
P(C|H)=\frac{1\times\frac13}{1}=\frac13
$$

由于蒙提霍尔问题只有两种结果，即换门获胜或坚持获胜。从而有：

$$
P(\text{换门获胜}) = 1 - P(\text{坚持获胜})
$$

$$
P(\text{换门获胜})=1-\frac13=\frac23
$$

读到这里，我想信你对这个问题已经有了相当深入的理解。概率论确实常常出现这些有趣而tricky的问题。
值得一提的是，历史上最多产的数学家之一[埃尔德什·帕尔](https://zh.wikipedia.org/wiki/%E5%9F%83%E5%B0%94%E5%BE%B7%E4%BB%80%C2%B7%E5%B8%95%E5%B0%94)也对于“换门”这个策略持怀疑态度[^1]，直到他看到了计算机模拟的结果。
因此，第一次碰到不会是相当正常的事情。事实上，从数学中，尤其是概率论里，我深深感受到了直觉的不可靠😓

[^1]:[Vazsonyi, Andrew (December 1998 – January 1999). ](https://web.archive.org/web/20140413131827/http://www.decisionsciences.org/DecisionLine/Vol30/30_1/vazs30_1.pdf)
