---
title: "C/C++ 代码规范与 Git 提交规范"
slug: "cxx-code-style-guide"
description: "整理项目里常用的 C/C++ 命名、注释、目录结构与编码建议，并补充统一的 Git 提交消息规范。"
date: 2026-04-08
lastModified: 2026-04-08
category: ["C++"]
tags: ["C++", "代码规范", "Git"]
toc: true
comment: true
donate: false
draft: false
---

这篇文章整理了一份适合项目协作的 C/C++ 代码规范，内容以现有团队规范为基础，并参考 Google C++ Style Guide。文末补充了统一的 Git 提交规范，方便在日常开发里直接套用。

参考资料：[Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)

## 一、命名规范

### 1. 变量

#### 局部变量

```cpp
int i_am_a = 0;
static std::string i_am_b = "";
```

#### 全局变量

```cpp
int g_i_am_a = 0;
std::string g_i_am_b = "";
```

#### 类成员变量

```cpp
int _i_am_a;
static std::string _i_am_b;
```

#### 结构体成员变量

```cpp
int i_am_a;
static std::string i_am_b;
```

### 2. 常量

```cpp
const int kIamConst = 1;
const int kUbuntu_20_04 = 1;
```

说明：

- 常量使用 `k` 前缀。
- 多单词采用大驼峰。
- 带版本或数字的命名可以直接保留数字段。

### 3. 枚举

```cpp
enum IamEnum
{
    kIamEnumA = 0,
    kIamEnumB,
};

enum class IamEnum
{
    kIamEnumA = 0,
    kIamEnumB,
};

enum class IamEnum : int
{
    kIamEnumA = 0,
    kIamEnumB,
};
```

### 4. 宏

```cpp
#define I_AM_MACRO_A 10
#define I_AM_MACRO_B "i am b"
#define I_AM_MACRO_C(x) ...
```

说明：

- 宏名全部大写。
- 单词之间使用下划线分隔。
- 能用 `const`、`constexpr`、内联函数替代时，优先不要用宏。

### 5. 结构体

```cpp
struct IamStruct
{
    int i_am_a;
    std::string i_am_b;
};
```

### 6. 类

```cpp
class IamClass
{
public:
    IamClass(void);
    ~IamClass(void);

    int IamFuncA(int arg_a);

protected:
    std::string _i_am_a;

private:
    int _i_am_b;
    static std::string _i_am_c;
};
```

### 7. 函数

```cpp
int IamFuncA(int i_am_a, const string& i_am_b);
```

说明：

- 函数名使用大驼峰。
- 参数名使用小写加下划线。
- 引用或指针参数要能从命名和类型上体现输入输出语义。

### 8. 函数指针与回调

```cpp
typedef void (*FP_{FUNCTION_NAME})(int i_am_a, const string& i_am_b);
FP_{FUNCTION_NAME} fp_ptr;   // Local variable
FP_{FUNCTION_NAME} _fp_ptr;  // Member variable
FP_{FUNCTION_NAME} g_fp_ptr; // Global variable

typedef std::function<void(int i_am_a, const string& i_am_b)> FN_{FUNCTION_NAME};
FN_{FUNCTION_NAME} fn_ptr;   // Local variable
FN_{FUNCTION_NAME} _fn_ptr;  // Member variable
FN_{FUNCTION_NAME} g_fn_ptr; // Global variable
```

### 9. 命名空间

```cpp
namespace mynamespace
{
...
namespace mysubnamespace
{

}  // namespace mynamespace::mysubnamespace
...
}  // namespace mynamespace
```

### 10. 头文件保护

```cpp
#ifndef __[SYSTEM_NAME_ACRONYM]_[MOUDLE_NAME]_[HEADER_NAME]_H__
#define __[SYSTEM_NAME_ACRONYM]_[MOUDLE_NAME]_[HEADER_NAME]_H__
...
#endif  // __[SYSTEM_NAME_ACRONYM]_[MOUDLE_NAME]_[HEADER_NAME]_H__
```

## 二、注释规范

### 1. 文件头注释

```cpp
/** @file       module_api.h
 *  @brief      Module API.
 *              A module must implement the following APIs and be compiled as a shared library.
 *  @author     Ermazi Wang
 *  @version    1.0
 *  @date       2012-01-01
 *  @copyright  Heli Co., Ltd. All rights reserved.
 */
```

### 2. 接口注释

外部调用接口，或者逻辑复杂的接口，尽量补充接口注释。

```cpp
/** @fn      bool Init(const char* arg1, int& arg2)
 *  @brief   This function is the first one to be called before other APIs.
 *           Module initialization should be completed in this function.
 *  @param [in]      arg1  Argument 1.
 *  @param [in,out]  arg2  Argument 2.
 *  @return  Result of module initialization.
 */

/** @fn      void Uninit()
 *  @brief   This function will be called to perform module uninitialization
 *           before exiting the module. It is a good chance to clean all data
 *           structures here.
 *  @return  None
 */
```

## 三、代码目录结构

```txt
ExampleProject/
|-- src
|-- conf
|-- bin
|-- lib
|-- build
|-- doc
|-- CMakeLists.txt
`-- README.md
```

建议：

- `src` 放源码。
- `conf` 放配置。
- `lib` 放第三方库或内部库。
- `doc` 放文档。
- 构建产物与源码分离，避免目录混乱。

## 四、编码建议

- 代码文件尽量不超过 1000 行。
- 函数尽量不超过 100 行。
- 函数参数个数尽量不超过 5 个。
- 圈复杂度尽量不超过 5。
- 统一使用 4 个空格缩进。
- 尽可能处理所有编译告警。
- 宁用组合，慎用继承。
- 不要堆叠过深的继承链。
- 不要写技巧性过强的代码。
- 能简单就不要复杂。
- 如非必要，不要增加新的抽象实体。
- 不要过度设计。
- 在可读性和扩展性之间做平衡。
- 可读性是代码质量的重要指标。
- 好的命名是可读性的核心组成部分。
- 及时重构，消除异味代码。

## 五、Git 提交规范

提交信息统一采用下面的格式：

```txt
类型: 描述
```

### 1. 类型定义

| 类型 | 含义 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修复问题 |
| `refactor` | 代码重构 |
| `docs` | 文档修改 |
| `chore` | 其他修改 |

### 2. 提交示例

```txt
feat: 新增底盘控制
fix: 修复校验错误
refactor: 优化协议解析
docs: 更新说明文档
chore: 调整构建脚本
```

### 3. 使用建议

- 一次提交尽量只做一类事情。
- 描述直接写结果，不写无意义词汇，例如“修改了一下”。
- 优先使用能体现业务变化或技术动作的短语。
- 文档、脚本、配置类调整不要混进功能提交。

## 六、落地建议

如果项目准备长期维护，这份规范至少要在三个位置保持一致：

- 仓库根目录的开发文档。
- 新成员入项说明。
- Code Review 和 Git 提交检查流程。

规范本身不是目的，降低协作成本、减少理解偏差、提升可维护性才是目的。只要团队已经约定，就要稳定执行，而不是每个模块各写一套风格。
