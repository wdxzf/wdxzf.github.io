---
title: "PCB 扇孔全攻略：19 个新手和老手都容易忽略的细节"
date: 2026-04-09
description: "从过孔选型、BGA 扇出、差分换层到板边 GND 屏蔽，系统梳理 19 个会直接影响 PCB 可制造性、信号完整性和焊接良率的设计细节。"
tags: ["PCB", "硬件设计", "BGA", "高速信号", "EDA"]
category: ["硬件设计"]
toc: true
donate: false
---

> 本文基于公众号原文重新整理，删去了广告和推荐流，保留与 PCB 扇孔设计直接相关的经验要点。原文地址：[mp.weixin.qq.com](https://mp.weixin.qq.com/s/whxqCBD4jOtBmih8QAA9zQ)

做过 PCB 设计的人，通常都遇到过这些问题：BGA 明明已经扇出，后期却发现内层走线困难；板子打样能做出来，但焊接良率不高；高速信号换层后，测试时又出现眼图变差、丢包、EMI 上升。

很多时候，问题不在芯片，也不完全在板厂，而是在一开始的扇孔策略就埋下了隐患。

这篇文章把原始内容重组为 10 个主题、19 个检查点，适合作为 PCB 布线前后的快速核对清单。

## 先看结论

- 过孔不是越小越先进，能满足密度和性能要求时，优先用更稳妥、可制造性更好的孔径。
- 扇孔不只是“把线引出来”，还会影响回流路径、电源完整性、铜皮连续性和焊接质量。
- 换层必须同时考虑信号过孔和参考地回流，尤其是差分线和高速接口。
- BGA、电容、连接器三类器件最容易因为扇孔方式不当而引出后续问题。

## 1. 过孔的作用与基本原则

过孔的核心作用是帮助信号或电源在不同层之间建立连接，因此它首先是一个电气结构，其次才是一个几何图形。

- 需要跨层连接的过孔，必须真正连接到目标层，避免形成多余的 stub。
- 在满足布线密度的前提下，优先选择更大的孔径和焊盘尺寸，通常更容易加工、良率也更高。

![过孔选择示意](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHBaf17JFqJLhlThq8pNCp1yzkFzkWAgpm8z7BT0k8uZiaj1OMxd767afuXWyLAMIG3GjibtzNs5LClA/640?wx_fmt=png&from=appmsg#imgIndex=0)

## 2. 控制过孔类型数量

同一块板中，过孔类型越多，制造和装配阶段越容易引入额外成本与工艺风险。

- 常规设计尽量把过孔规格控制在 3 种以内。
- 常见机械孔规格可参考 `8/16`、`10/22`、`12/24`。
- HDI 设计中常见激光孔规格为 `4/10`、`4/8`。
- 板越厚，孔径通常也要相应增大；2 层板更适合使用偏稳妥的大孔方案。

> 经验上，除非器件密度逼迫你必须缩孔，否则优先减少规格种类，比盲目追求“小而密”更有价值。

## 3. 载流能力要留余量

过孔除了传递信号，也可能承担明显的电流通路，特别是在电源分配网络中。

- 电源过孔数量不要只按理论最小值布置。
- 工程上常按计算值的 2 倍左右预留过孔数量，提高温升和可靠性裕量。

如果一个电源焊盘只放了“刚刚够用”的过孔，后期一旦电流波动、环境升温或铜厚变化，问题就会暴露出来。

## 4. 过孔间距会影响电源完整性

过孔太密，不只是“看起来挤”，更可能把参考平面切得支离破碎。

- 过孔中心间距建议尽量不小于 `1 mm`。
- 这样通常更容易兼顾走线空间和地/电源层完整性。
- 如果必须密集布孔，要回头检查内电层和地层有没有被切断或形成狭窄颈部。

![过孔间距示意](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHBaf17JFqJLhlThq8pNCp1yF4iaIUuRQKjYnSofXKE9s1EBsrI2gNlS14mw5T4WYmf3Z6UuS9XMXXQ/640?wx_fmt=png&from=appmsg#imgIndex=1)

## 5. IC 与去耦电容的扇出方式决定后续难度

### IC 扇出

IC 扇出首先要服务于后续布线，而不是只追求“能出去”。

- 尽量优先从器件外侧引出。
- 左右两侧的过孔位置保持相近的水平关系，方便内层继续展开。

![IC 扇出要求](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHBaf17JFqJLhlThq8pNCp1y3Wr1PUXybo6GZfTWfhXj1KcicKnAgjqExkhUnsm6Fw4A9hRAj6WQTAg/640?wx_fmt=png&from=appmsg#imgIndex=2)

### 去耦电容扇出

电容扇出关注的是电流回路，而不是形式上的对称。

- 过孔要尽量靠近电容和供电脚，缩短信号或电源回路。
- 尽量不要把过孔直接打在焊盘中心，避免引发焊接偏移、立碑或吃锡不均。

![电阻电容过孔扇出原则](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IfD1S8crcvYJUDsRURnwIQXAguAVUbfxOkbZqibnYUWrEFe4nKgZYuTw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=3)

## 6. 板边 GND 过孔可以提升屏蔽效果

在板框附近布一圈地过孔，是高速板和接口板上非常常见的处理方式。

- GND 过孔间距通常可以按 `50~200 mil` 控制。
- 这类“via fence”有助于形成板边屏蔽，抑制边缘辐射和串扰扩散。

![板边 GND 屏蔽过孔](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHBaf17JFqJLhlThq8pNCp1ynDphkvUBl5TjiciaYlVhCVDEtaJL9QqsFiaZ5oKYTibTlmPmibxKoDaSYLQ/640?wx_fmt=png&from=appmsg#imgIndex=4)

实际设计时要注意，这类过孔阵列不能只在一侧“象征性”放几颗，而是要围绕敏感区域形成连续屏障。

## 7. BGA 扇出是成败分水岭

### 过孔位置

- 过孔更适合放在焊盘对角线方向的中心区域。
- BGA 中间的十字形主通道一般不要放过孔，否则会直接压缩后续出线空间。

![BGA 十字通道示意](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5I1EOftNsxJlQckbZNURK4YNWYdm2HhibsQFlYZXwpoD7aQiazPzjVsphg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=5)

### 前两排外移

- 前两排过孔适当往外移，并与中间区域对齐，通常更利于后续内层扇出。

![BGA 走线技巧](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IiaSM2m658lJVtsLDoHqzENGhahuzvI5lDibautRh9kfeXZbLypBw4qicw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=6)

### 不同间距的出线能力

- `>= 1.0 mm` 的 BGA，一般有机会做到 2 线出。
- 小于 `1.0 mm` 时，通常只能按 1 线出考虑。
- `0.4 mm` 间距往往已经进入 HDI 方案范围。

![不同 BGA 间距的出线数量](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IXiaQWpcBMhSU0ibY1a4Ag1Ru9HcZtArWZeAB6PiclT51Sc8ibTIzC5icyRQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=7)

## 8. 铺铜、热焊盘与孤铜处理不要拖到最后才想起

### 焊盘与铺铜连接方式

- 对于 `0805` 及以上尺寸的器件，通常更适合用十字连接，降低焊接热不平衡带来的风险。

![焊盘与铺铜连接方式](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IibfVbX14nI3cznIALdZ1jdHDibWWw3esDPHRpr4Oia8BNDeTvmwicsDhWQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=8)

### 避免大面积无铜和孤铜

- 大面积空铜区域容易带来板材受力不均和翘曲问题。
- 设计完成后要做一次修铜检查，去掉尖角、细长铜皮和孤铜岛。

![孤铜移除示意](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IeYakMIicXfHdplFU8cmXvz0so69WxWKAT42FFUCohFERlIhia02SLMDQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=9)

## 9. 差分信号过孔最怕只顾走通，不顾回流

### 换层时补 GND 过孔

- 差分线换层时，附近应补充 GND 过孔，为回流电流提供更短路径。

![差分换层时增加 GND 过孔](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5Ihm1eZgXPaWCtAaicicyoVlpOm8USRHvBsAnGB3eVXmeiagWYTKIXEdYBg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=10)

### 过孔中间保持净空

- 差分对的两个过孔之间不要再穿其他信号线，避免破坏耦合和阻抗连续性。

![差分过孔中间禁止布线](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IfPfS88ic30c7OibFia7shpxtGk4XprjfkoTw5Uw4d5cRuSAAPt4gueHPQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=11)

### 保持对称与耦合

- 差分线在换层前后都要尽量保持对称。
- 不耦合长度越短越好，避免额外的模式转换和辐射问题。

![差分线的对称与耦合](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5I3LhLt5QdLooo49KktuVctYYdiawpU1uflyNexUrya3y9QC3m8Uo1G4Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=12)

## 10. 合孔与高速连接器需要单独看待

### BGA 电源/地合孔

- BGA 的电源或地焊盘，在特定情况下可以两脚共用一个过孔。
- 但不建议多个焊盘共用同一颗过孔，否则会明显增加阻抗和回流竞争。

![BGA 合孔处理](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IRycf6lMPUHEria0XTWmkVFEV6ZEOZqEQhicjZeqzxVLfHZhA1CTItAuQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=13)

### 高速连接器的地回流

- 高速连接器的每个地焊盘，最好都至少配置一颗就近的 GND 过孔。
- 过孔距离焊盘越近，回流路径通常越短，接口性能也更稳定。

![连接器 GND 焊盘处理](https://mmbiz.qpic.cn/sz_mmbiz_png/nyJUhrkzoHCDT25z4ROjDficR3AzZ8n5IQXmNXOucQ1dw7m0A3nroBfv36iciaWDjL1KdFGlCFPtjNlvz8wpMVSag/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=14)

## 设计检查清单

在正式输出 Gerber 前，至少再过一遍下面这些问题：

- 过孔是否真的连到了需要的层，是否存在多余 stub。
- 过孔规格是否过多，能否收敛到更少的孔径类型。
- 电源过孔数量是否留了余量，而不是只满足理论值。
- 密集扇孔区域有没有切坏地层或电源层。
- 去耦电容的过孔是否足够靠近供电脚。
- BGA 中间主通道有没有被不必要的过孔占掉。
- 差分换层时是否补了就近 GND 过孔。
- 差分对过孔之间是否仍然保持净空。
- 板边敏感区域是否形成了连续的 GND 过孔围栏。
- 铺铜后是否清理了孤铜、尖角和不合理的细颈铜皮。

## 总结

扇孔看起来只是一个局部动作，但它会同时影响布线自由度、回流路径、制造难度、焊接良率和整板性能。

如果你希望板子不是“能画完”，而是“能量产、能通过测试、能稳定复用”，那扇孔策略就不该等到布线中后期再临时补救，而应该在布局阶段就提前定下来。
