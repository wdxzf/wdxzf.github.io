---
title: 配置 STM32CubeIDE for VSCode 下基于 OpenOCD 的烧录与调试
description: 介绍如何在 STM32CubeIDE for VSCode 项目中使用 DAPLink 搭配 OpenOCD 完成烧录与调试配置。
date: 2026-04-08
lastModified: 2026-04-28
slug: "stm32cubeide-vscode-openocd-debug"
category: ["嵌入式开发"]
tags: ["STM32", "VSCode", "OpenOCD", "DAPLink"]
---

> 原文地址 [341536.xyz](https://341536.xyz/posts/stm32-vscode-openocd-debug/)
> 官方视频 [STM32CubeIDE for VSCode 相关视频](https://www.stmcu.com.cn/video/)

如果你在使用 **STM32CubeIDE for VSCode** 插件，可能会发现它默认的烧录方式更偏向 STLink和Jlink。对于一些 DAPLink、CMSIS-DAP 或兼容调试器，直接使用插件默认配置时，可能会遇到识别不稳定、路径解析错误、烧录失败等问题。

为了解决这些问题，可以使用 **DAPLink + OpenOCD** 的方式接管烧录与调试。这样做的好处是配置清晰、工具链通用，而且不局限于 STM32，也适合大部分 ARM Cortex-M 芯片。

> 本文以 STM32F103C8T6 和 STM32CubeIDE for VSCode 生成的 CMake 工程为例。其他 STM32 系列只需要修改 OpenOCD 的 target 配置文件，例如 F4 使用 `stm32f4x.cfg`，H7 使用 `stm32h7x.cfg`。

> WARNING
> 
> 本教程涉及 Scoop 的安装。安装 Scoop 前需要检查自己的用户文件夹是否含有中文，如果有中文会**导致安装后无法正常使用，且卸载复杂**的后果。可以修改默认用户文件夹或重装系统，建议重装系统。

硬件准备[](#硬件准备)
-------------

### 选购 DAPLink[](#选购-daplink)

市场上 5-20 元的 DAPLink 基本就可以满足日常使用需求。可以买一个淘宝九块九的 **PowerWriter 2 Lite**，性价比高。

> TIP
> 
> **Why DAPLink？**
> 
> **DAPLink** 是 ARM 官方推出的开源调试协议。与 STLink（仅支持 STM32）不同，DAPLink 几乎可以覆盖所有 ARM 内核的设备，通用性更强。

### 检查驱动 (WinUSB)[](#检查驱动-winusb)

大多数 DAPLink 插上就能用。但为了确保 OpenOCD 能通过 `libusb` 访问它，建议检查一下：

1.  插上调试器。
2.  右键此电脑，在右键菜单选择 `管理`。打开设备管理器，看是否有 `CMSIS-DAP` 或 `WinUSB` 设备。

## 安装 OpenOCD
-------------------------

OpenOCD 可以通过 Scoop 安装或者在 GitHub Release 直装（直装后建议添加 OpenOCD 到环境变量）。

### 使用 Scoop 安装
推荐使用 [Scoop](https://scoop.sh/) 安装 OpenOCD，方便后续的维护

打开 PowerShell，执行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

```

3.  安装 OpenOCD

4.  安装完成后，检查 OpenOCD 是否正确安装

若显示版本号说明安装成功。如：

```
Open On-Chip Debugger 0.12.0 (2023-01-14-23:37)
Licensed under GNU GPL v2
For bug reports, read
        http://openocd.org/doc/doxygen/bugs.html

```

> TIP
> 
> 你的电脑无法直接对芯片说：“把这个程序写进你的 Flash 里”，所以我们需要引入一个程序用来把用户的调试操作转换成芯片能听懂的指令，这个程序在这儿教程中就是 **OpenOCD**。它一边听懂电脑发出的命令（GDB 协议），一边控制 USB 调试器发出高低电平（JTAG/SWD 协议），像” 牵线木偶” 一样控制芯片。 它的核心价值就是用一套软件，桥接不同调试器（DAPLink/STLink）与不同芯片，让烧录和调试变得通用。

配置烧录功能[](#配置烧录功能)
-----------------

VSCode 本身只是一个编辑器，并不懂烧录，我们需要写一个” 任务说明书” 告诉它该怎么做。

也可以关注 `STM32 Debug Configurator` 这类新插件，不过本文仍以手动编写 `tasks.json` 的方式说明，方便理解每一项配置的作用。

### 创建烧录任务[](#创建烧录任务)

1.  在 VSCode 中打开你的项目
2.  在.vscode文件夹下创建 `tasks.json`文件
3.  **完全替换**文件内容如下（注意看注释修改芯片型号）:

```jsonc
{
    "version": "2.0.0",
    "tasks": [
        {
            // 编译 Debug 版本
            "label": "Build Debug",
            "type": "shell",
            "command": "cmake",
            "args": [
                "--build",
                "--preset",
                "Debug"
            ],
            "options": {
                // 保证 cmake 能在工程根目录找到 CMakePresets.json
                "cwd": "${workspaceFolder}"
            },
            "presentation": {
                "echo": true,
                "reveal": "always"
            },
            "problemMatcher": []
        },
        {
            // 编译后烧录到 STM32
            "label": "Flash Target",
            "type": "shell",
            "command": "openocd",

            // 烧录前先执行 Build Debug，避免烧录旧程序
            "dependsOn": "Build Debug",

            "args": [
                // 使用 CMSIS-DAP / DAPLink 调试器
                "-f",
                "interface/cmsis-dap.cfg",

                // STM32F103C8T6 属于 STM32F1 系列
                // 如果是 F4/H7 等芯片，需要改成对应配置文件
                "-f",
                "target/stm32f1x.cfg",

                // 烧录 ELF 文件
                // 使用相对路径 + cwd，避免 Windows 反斜杠被 OpenOCD 误解析
                // 请把 F103C8t6_DiffCar.elf 改成你自己工程实际生成的 ELF 文件名
                "-c",
                "program build/Debug/F103C8t6_DiffCar.elf verify reset exit"
            ],
            "options": {
                // 让 build/Debug/... 从工程根目录开始查找
                "cwd": "${workspaceFolder}"
            },
            "group": {
                "kind": "build",

                // true 表示 Ctrl + Shift + B 会直接执行编译 + 烧录
                // 如果你只想默认编译，不想默认烧录，可以改成 false
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "panel": "shared"
            },
            "problemMatcher": []
        }
    ]
}
```

换到其他工程时，主要检查下面几项：

1. `build/Debug/xxx.elf` 中的 `xxx.elf` 是否为当前工程生成的 ELF 文件名。
2. `--preset Debug` 是否和当前工程的 CMake preset 名称一致。
3. `target/stm32f1x.cfg` 是否匹配当前芯片系列。
4. `interface/cmsis-dap.cfg` 是否匹配当前下载器。

### 开始烧录[](#开始烧录)

配置完成后，按 `Ctrl + Shift + P`，输入 “Run Task”，选择 “Flash Target” 即可开始烧录。
也可以直接按 `Ctrl + Shift + B`。如果上面的 `Flash Target` 设置为默认 build 任务，VS Code 会自动执行编译并烧录。

### 添加一键烧录按钮

如果不想每次都打开命令面板，可以安装 `Task Buttons` 插件。

1. 按 `Ctrl + Shift + X` 打开扩展页面
2. 搜索 `Task Buttons` 并安装
3. 打开 VS Code 设置，进入 `settings.json`
4. 添加下面配置

```jsonc
"VsCodeTaskButtons.tasks": [
    {
        "label": "$(play) Flash Target",
        "task": "Flash Target",
        "tooltip": "Build and flash STM32 target"
    }
]
```

> TIP
> 
> `tasks.json` 本质上是一份自动化任务说明书。它告诉 VS Code：执行哪个命令、传入哪些参数、在哪个目录下执行。这样就能把 OpenOCD 这种命令行工具接入 VS Code 的图形界面。
> 
> VSCode 只懂得编辑文字。你想让它帮你做点” 额外的事”，比如烧录程序，但它自己完全不知道” 烧录” 是什么。
> 
> 但是 VSCode 会自己去读 .vscode 文件夹下的 **task.json**。比如我们配置的 task.json 上面详细写着：
> 
> 1.  **任务名称**：“烧录程序”
> 2.  **具体步骤**：“请调用电脑里的 openocd 这个工具，并把这些参数（比如调试器类型、芯片型号、程序文件位置）一字不差地传给它。”
> 
> 所以，task.json 解决的核心问题是──**在 VSCode 这个图形界面里架起一座桥梁，连接友好的图形界面和底层强大的命令行工具**。
> 
> 如果感兴趣，你可以借助 AI 去了解我们配置的 task.json 上的每一个参数究竟告诉 VSCode 怎么正确执行这个任务。

配置调试功能[](#配置调试功能)
-----------------

### 安装 Everything[](#安装-everything)

可以从微软官方商店搜索，或者使用 WinGet 安装。

> **使用 WinGet 安装 Everything**
> 
> 按刚刚的步骤打开 PowerShell，安装 Everything
> 
> ```
> winget install voidtools.Everything
> 
> ```

### 确认 arm-none-eabi-gdb 位置[](#确认-arm-none-eabi-gdb-位置)

我们需要找到调试器（GDB）的位置：

1.  使用 Everything 搜索 `arm-none-eabi-gdb.exe`，找到路径包含 `gnu-tools-for-stm32` 的那个结果
2.  通常路径类似：`AppData/Local/stm32cube/bundles/gnu-tools-for-stm32/13.3.1+st.9/bin/arm-none-eabi-gdb.exe`
3.  在目标文件右键，在右键菜单中选择 `复制为路径`，将路径保存好

![][img-2] Everything 搜索 arm-none-eabi-gdb.exe 结果

> TIP
> 
> **什么是 GDB？**
> 
> GDB 是连接你的源代码和芯片实际运行的” 桥梁调试器”，它负责和程序对话。它解决了在嵌入式开发中” 代码如何真正在芯片上执行” 的黑盒问题。
> 
> 当程序在芯片上运行时，GDB 允许你” 暂停时间”——查看变量当前值、分析函数调用关系、跟踪程序执行流程。没有 GDB，调试就像蒙着眼睛找错误；有了 GDB，你可以精确观察程序每一步的行为。
> 
> 简单说：**OpenOCD 让电脑能” 接触” 到芯片，而 GDB 让开发者能” 理解” 芯片上正在发生什么。**

### 安装 Cortex Debug 扩展[](#安装-cortex-debug-扩展)

`Ctrl + Shift + X`，打开扩展页，搜索 `Cortex Debug` 并安装

![][img-3]VSCode Cortex Debug 扩展安装

`Ctrl + Shift + D`，打开运行或调试页，点击 `create a launch.json file`，这会在你的项目根目录下的 `.vscode` 文件夹新建一个 `launch.json`。你也可以自己手动创建。

![][img-4]VSCode 创建 launch.json 文件界面

点击 `create a launch.json file` 后，在上方选项选择第一项，然后下拉框选择 `Cortex Debug: OpenOCD`。或者你也可以打开 `launch.json` 文件，点击右下角的 `Add Configuration...`，同样选择 `Cortex Debug: OpenOCD`。

![][img-5]VSCode 添加 Cortex Debug 配置选项

补全配置，添加 GDB 路径：

```
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "cwd": "${workspaceRoot}",
            "executable": "${command:st-stm32-ide-debug-launch.get-projects-binary-from-context1}",
            "name": "Debug with OpenOCD",
            "request": "launch",
            "type": "cortex-debug",
            "servertype": "openocd",
            "configFiles": [
            	"interface/cmsis-dap.cfg",
            	"target/stm32f1x.cfg"
            ],
            "searchDir": [],
            "runToEntryPoint": "main",
            "showDevDebugOutput": "none",
            "gdbPath": ".../AppData/Local/stm32cube/bundles/gnu-tools-for-stm32/13.3.1+st.9/bin/arm-none-eabi-gdb" // 填入刚刚找到的路径
        }

    ]
}

```

保存配置后，运行与调试页应该会出现 `Debug with OpenOCD` 选项，点击运行三角形即可开始调试。

![][img-6]VSCode 调试界面显示 Debug with OpenOCD 选项

> TIP
> 
> **什么是 launch.json？**
> 
> 如果说 `task.json`是” 烧录说明书”，那么 `launch.json`就是” 调试说明书”。它告诉 VSCode 如何启动调试会话：设置断点、查看变量、单步执行等。

常见问题[](#常见问题)
-------------

### 报错 `target not found`[](#报错-target-not-found)

*   检查连线（SWDIO, SWCLK, GND, 3.3V）是否接好。
*   检查 target/stm32f1x.cfg 是否选对了系列（F1, F4, H7 配置文件不同）。

### GDB 报错 `No such file or directory`[](#gdb-报错-no-such-file-or-directory)

*   检查 `launch.json` 里的 `gdbPath` 路径是否写错，尤其是斜杠的方向。

参考教程[](#参考教程)
-------------

## 参考教程

- [[STM32 + VS Code] 用 DAPLink + OpenOCD 调试 - XRobot 官方教程 0.2 节](https://www.bilibili.com/video/BV1bnnZz2ESg)
- [【Windows】VSCode 开发 STM32，但是使用 cmake+clangd+ninja+arm-gcc，全套开源工具链，编译烧录调试无压力。](https://www.bilibili.com/video/BV1X4XAYiEkV)


4月8号遇到问题
window :
tasks.json 里用了 STM32 扩展命令变量，但它没有返回 ELF 路径
在 tasks.json 里，原来是：
program ${command:st-stm32-ide-debug-launch.get-projects-binary-from-context1} verify reset exit
这个 ${command:...} 不是静态路径，而是让 VSCode 先调用扩展命令去“动态拿当前工程的 binary 路径”。你这里它返回了 undefined，所以出现了：
The "path" argument must be of type string. Received undefined

安装openocd后要重启电脑

program window路径要用/
