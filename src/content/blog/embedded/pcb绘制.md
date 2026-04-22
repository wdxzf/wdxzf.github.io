---
title: "PCB 绘制笔记"
slug: "pcb-design-notes"
description: "记录 PCB 布线、电流线宽和铜皮规则等基础绘制笔记。"
date: 2026-03-05
category: [PCB]
tags: [PCB, 布线, 嘉立创EDA]
toc: true
mermaid: false
mathjax: false
draft: false
---

## 第11.4课
### 
1.普通1 oz铜，外层经验表(PCB实际通过电流与线宽的关系表)
| 电流 | 建议线宽 |
|-----|---------|
| 0.1A | 6 ~ 8 mil |
| 0.3A | 10 ~ 12 mil |
| 0.5A | 15 ~ 20 mil （如20mil）|
| 1A | 20 ~ 30 mil（如22mil） |
| 2A | 40 ~ 60 mil |
| 3A | 60 ~ 80 mil |

2.更改铜皮网络间距规则（间距过大会导致铺铜时形状出现过多避让而不规则）：设计-设计规则-规则管理-安全距离-copperThickness1oz，嘉立创最小支持4mil，适当改为5-8mil。

3.由于规则限制导线无法穿过时，可更改焊盘形状大小：右键器件-更改封装-计算可通过距离（考虑焊盘大小、规则距离、线宽）-设置焊盘宽度
