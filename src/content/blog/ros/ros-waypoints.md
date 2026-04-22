---
title: "ROS 航点导航功能"
date: 2026-01-16
description: "从 move_base Action 单点导航到 waterplus_map_tools 航点管理与自动巡航：可直接落地的节点与集成步骤。"
slug: "ros-waypoints-navigation"
tags: ["ROS", "导航", "多点航点", "move_base", "actionlib"]
category: ["ROS"]
draft: true
mermaid: true
series: "ROS"
seriesOrder: 2
ogImage: "/images/ros-waypoints/cover.svg"
---

## 航点导航功能

![ROS 航点导航示意图](/images/ros-waypoints/cover.svg)

:::tip[你会学到什么]
- 不依赖 RViz，**用代码给 move_base 发目标点**（Action 单点导航）
- 集成 `waterplus_map_tools`，实现 **RViz 选点 → 保存 → 按序自动巡航**
- 自己写一个 **航点发布接口节点**：发布航点编号 + 订阅导航结果
:::

## 前言

在实际 ROS 导航应用中，我们不可能始终依赖 RViz 手动设置导航目标点。RViz 发点适合**测试/调试**；但一旦进入自动化流程（巡航、任务编排、到点执行动作），导航目标点必须由**程序节点**负责发布。

本文分两步走：

1) 用 **Action 接口**控制 `move_base`（单点导航）  
2) 使用 `waterplus_map_tools`（地图选点、保存、自动巡航）

:::note[我的环境]
实体 ROS 小车，Ubuntu 20.04，ROS1 noetic
:::

---

## 1. 航点导航中的 Action 编程接口

### 1.1 什么是 Action 通信？

Action 是 ROS 中适合“**耗时任务**”的通信机制：  
它不仅能发送目标（Goal），还能拿到过程反馈（Feedback）和最终结果（Result），并支持取消任务（Cancel）。

在导航中通常是：
- `move_base`：Action **Server**（负责规划 + 控制）
- 我们写的程序：Action **Client**（发送目标点）

### 1.2 Action vs Service

| 特性 | Service（服务） | Action（动作） |
|---|---|---|
| 适用场景 | 快速完成的请求 | 耗时任务（导航/抓取/巡检） |
| 过程反馈 | ❌ | ✅ |
| 取消任务 | ❌ | ✅ |
| 通信模型 | 一次请求一次响应 | 发送目标后持续反馈直到结束 |

:::tip[类比理解]
- Service：去便利店买水，付完就结束  
- Action：点外卖，配送中可看进度，也可取消
:::

---

## 2. move_base 的 Action 在导航系统中的位置

`move_base` 对外提供 Action 接口，一般名称就是：

- Action 名：`move_base`
- Action 类型：`move_base_msgs/MoveBaseAction`

整体数据流（建议你脑子里形成这个图）：

```mermaid
flowchart LR
  A[你的客户端节点<br/>nav_client.py] -->|MoveBaseGoal| B[move_base (Action Server)]
  B -->|Feedback| A
  B -->|Result| A

  subgraph Navigation Stack
    B --> C[global planner]
    B --> D[local planner]
    B --> E[costmap]
  end
