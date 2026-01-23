---
title: "Git 使用过程中遇到的问题整理"
description: "记录日常开发中使用 Git 遇到的典型问题与解决方法"
date: 2026-01-23
category: ["Git"]
tags: ["Git", "submodule", "remote"]
---

# Git 使用过程中遇到的问题整理

## 一、本地文件夹存在，但 GitHub 上没有上传
:::collapse
### 🔍 问题现象

本地存在如下目录：navigation_system_ws/src/livox_ros_driver2

但执行 `git push` 后：

- GitHub 仓库中看不到该文件夹
- 本地确认文件真实存在
---

### 🧪 排查过程

#### 1️⃣ 检查是否被 `.gitignore` 忽略

```bash
git check-ignore -v livox_ros_driver2
```
如果输出类似：.gitignore:12:build/

说明该目录被忽略。

👉 本次排查中未被忽略。

#### 2️⃣ 查看 Git 状态

在仓库根目录执行：

```bash
git status
```

输出：

```
位于分支 master

未跟踪的文件:
  （使用 "git add <文件>..." 以包含要提交的内容）

    navigation_system_ws/src/livox_ros_driver2/

提交为空，但是存在尚未跟踪的文件
```

说明：

该目录尚未被 Git 跟踪（未执行 `git add`）。

#### 3️⃣ 尝试添加后出现警告

执行：

```bash
git add .
```

出现提示：

```
正在添加嵌入式 git 仓库：livox_ros_driver2
```

并提示：

```
You've added another git repository inside your current repository
```

---

### ✅ 问题根因

`livox_ros_driver2` 本身是一个独立的 Git 仓库：

```
livox_ros_driver2/
├── .git
├── package.xml
├── CMakeLists.txt
└── ...
```

属于嵌套 Git 仓库（nested git repository）。

Git 不会自动将其当作普通目录提交。

---

### ✅ 正确解决方案：使用 Git Submodule

第三方驱动 / SDK 正确的管理方式应为 submodule。

添加 submodule：

```bash
git submodule add https://github.com/Livox-SDK/livox_ros_driver2.git \
  navigation_system_ws/src/livox_ros_driver2
```

clone 项目时：

```bash
git clone --recurse-submodules git@github.com:xxx/Car_AMR.git
```

或：

```bash
git submodule update --init --recursive
```

更新代码时：

```bash
git pull --recurse-submodules
```

---

### 📌 总结

submodule 只记录：

- 仓库地址
- 指定 commit

不会复制源码进主仓库。

非常适合管理第三方依赖（ROS 驱动 / SDK / 算法库）。

---
:::

## 二、Git 中存在多个 remote（1111 / github）
:::collapse
### 🔍 问题现象

在 Git 提交图中看到：
![现象图片](public/images/git-troubleshooting/image-1.png)

```
1111/master
github/master
```

看起来像是：

有两个 GitHub 仓库。

---

### ✅ 实际原因

这是多个 remote 指向同一个仓库地址导致的。

查看：

```bash
git remote -v
```

看到：

```
1111     git@github.com:wdxzf/Car_AMR.git (fetch)
1111     git@github.com:wdxzf/Car_AMR.git (push)
github   git@github.com:wdxzf/Car_AMR.git (fetch)
github   git@github.com:wdxzf/Car_AMR.git (push)
```

说明：

- `1111` 和 `github` 只是远程仓库别名
- 实际 URL 完全相同

---

### ✅ 正确清理方式

删除无意义的 remote：

```bash
git remote remove 1111
```

推荐统一命名为 `origin`：

```bash
git remote rename github origin
```

最终效果：

```
origin  git@github.com:wdxzf/Car_AMR.git (fetch)
origin  git@github.com:wdxzf/Car_AMR.git (push)
```

---

### 📌 建议规范

| 类型 | 命名 |
|---|---|
| 主仓库 | origin |
| 上游仓库 | upstream |

避免使用无意义命名（如 `1111`、`test`）。

---
:::
## 总结

本次问题主要涉及两个 Git 中高级概念：

- Submodule（子模块）
- Remote（远程仓库别名）

它们是大型工程（ROS / 自动驾驶 / 多仓库项目）中必不可少的 Git 技能。

掌握后可以有效避免：

- 文件“明明存在却无法提交”
- 仓库结构混乱
- 第三方依赖无法同步
- clone 后项目不完整

---

### 📌 经验结论

第三方代码一定不要直接拷进仓库。

能用 submodule 的，一定用 submodule。
