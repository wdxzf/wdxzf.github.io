---
title: "WSL / Git 访问 GitHub 出现 TLS 握手失败"
description: "代理节点异常导致 TLS 握手失败的排查与解决方法。"
date: 2026-04-14
lastModified: 2026-04-14
category: [开发环境]
tags: [WSL2, Git, GitHub, 代理, TLS]
slug: wsl-git-tls-handshake-failed
---

## 问题现象

在 WSL 或 Windows 中访问 GitHub 时出现 TLS 错误。

为了排除"WSL 没有连接 Windows 网络"的可能，在两边分别测试：

```bash
curl -I https://github.com      # WSL
curl.exe -I https://github.com  # Windows
```

两边均报错，说明问题不在 WSL 网络隔离，而是更上层的原因。

报错信息：

```
gnutls_handshake() failed: The TLS connection was non-properly terminated
```

或

```
SSL_ERROR_SYSCALL
```

:::note[两个命令的区别]
`ping` → 测试能不能连上服务器（网络层）

`curl -I` → 测试 HTTPS 是否正常（TLS 层）

能 ping 通但 curl 失败，说明网络可达，但 TLS 握手有问题。
:::

## 问题原因

该问题通常不是 Git 或 WSL 的配置错误，而是**代理节点异常**导致 TLS 握手失败。

典型特征：

- `ping google.com` 返回 `198.18.x.x`，说明代理已开启，Windows 梯子也在工作
- `curl https://github.com` 失败
- 浏览器可能可以访问，但命令行工具失败

原因：当前代理节点可以建立连接，但无法完成 TLS 握手，节点本身出了问题。

## 解决方案

在 Clash for Windows 中切换节点：

1. 打开 **Proxies**
2. 切换到 **Developer**（开发节点组）
3. 更换一个节点（如 US / TW / Fast 等）
4. 重新测试：

```bash
curl -I https://github.com
```

返回以下内容说明问题已解决：

```
HTTP/2 200
```

:::tip[经验建议]
- 开发环境优先使用 Developer 节点组
- 避免选择 IPv6 节点（部分不稳定）
- 遇到 GitHub / npm / Docker 访问异常，**先换节点**再排查其他原因
:::

## 适用场景

适用于 WSL、Git、npm / pnpm、Docker、GitHub API、curl / wget 等命令行工具访问 GitHub 的场景。