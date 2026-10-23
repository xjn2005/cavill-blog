---
title: "CMake 入门"
description: "从一个最小的 C++ 项目出发，理解 CMake 如何描述目标、生成构建系统并组织工程。"
pubDatetime: 2026-08-10T05:24:24.412Z
tags:
  - Cmake
draft: false
---

## 为什么要学 CMake

如果只是写一个很小的 C++ 程序，我们当然可以直接使用编译器：

```bash
g++ main.cpp -o hello
```

这也是大部分课程都会告诉初学者如何运行C++程序的方式，但这只是最基础的方式。随着项目扩大，可能出现数十上百的文件，此时如果再用这种命令，不仅是冗长到难以接受，也会让维护变得异常艰难。

因此，CMake应运而生，它不承担编译器的工作，只是用于描述项目如何构建，可以认为是tool chain的一环。我们会将项目结构、编译标准、目标文件和依赖关系写进 `CMakeLists.txt`，然后由 CMake 去生成具体平台上的构建文件。

在不同的OS上，它可以生成各自习惯使用的构建文件。强大的跨平台能力，让它在大量的工程项目里成为事实上的标准。

## 精简的形态

我们先从最小的项目开始。目录结构如下：

```text
hello-cmake/
├── CMakeLists.txt
└── main.cpp
```

`main.cpp` ：

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, CMake!" << std::endl;
    return 0;
}
```

`CMakeLists.txt`：

```cmake
cmake_minimum_required(VERSION 3.20)

project(hello_cmake LANGUAGES CXX)

add_executable(hello main.cpp)
```

这就是一个最小可用的 CMake 项目。它只有三行核心内容。

- `cmake_minimum_required` 用来声明项目需要的最低 CMake 版本。这个版本不是随便写的，它会影响 CMake 使用哪些默认策略。对于新项目来说，写一个相对现代的版本，可以避免很多历史兼容行为带来的困惑。
- `project` 用来声明项目名称和使用的语言。这里的项目名是 `hello_cmake`，语言是 `CXX`，也就是 C++。
- `add_executable` 用来声明一个可执行目标。它的意思是：我要生成一个名为 `hello` 的可执行程序，它由 `main.cpp` 编译而来。


## 构建项目

在项目根目录下，不建议直接把构建产物生成在源码目录里。更常见的做法是创建一个单独的 `build` 目录：

```bash
cmake -S . -B build
cmake --build build
```

第一条命令叫配置阶段。

```bash
cmake -S . -B build
```

其中 
- `-S .` 表示源码目录是当前目录
- `-B build` 表示构建目录是 `build`。CMake 会读取 `CMakeLists.txt`，检查编译器和环境，然后在 `build` 目录里生成真正的构建文件。

第二条命令叫构建阶段。

```bash
cmake --build build
```

这里有两个地方都出现了 `build`，但含义不一样。`--build` 是 CMake 的参数，表示「我要开始构建项目」；最后那个 `build` 是构建目录的名字，也就是上一条命令中 `-B build` 创建出来的目录。

所以 `cmake --build build` 可以读成：让 CMake 去构建 `build` 这个目录里的项目。它会调用刚才生成的构建系统，真正开始编译代码。这样写的好处是比较跨平台。你不用关心底层到底是 Make、Ninja 还是 Visual Studio，统一交给 CMake 调用即可。

构建完成后，可执行文件一般会出现在 `build` 目录下。不同平台和生成器的路径可能稍有差异，但大体上可以这样运行：

```bash
./build/hello
```

在 Windows 上，如果使用 Visual Studio 生成器，产物可能会在 `build/Debug/hello.exe` 或 `build/Release/hello.exe` 中。

有些教程里还会看到另一种写法：

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

这里的 `cmake ..` 和前面的 `cmake -S . -B build` 本质上是在做同一件事：配置项目。区别只是当前所在的位置不同。进入 `build` 目录后，`..` 表示源码目录在上一级；而 `cmake -S . -B build` 是站在项目根目录，直接把源码目录和构建目录都说清楚。

如果项目比较大，还可以让构建过程并行执行：

```bash
cmake --build build -j 8
```

或者写得更明确一点：

```bash
cmake --build build --parallel 8
```

这里的 `8` 表示最多同时使用 8 个并行任务。需要注意的是，常见写法通常不是单独执行 `cmake -j 8`。`-j` 是给构建阶段用的，而不是给配置阶段用的。如果你直接使用 Makefile，也可能会看到 `make -j8`，它的意思也是并行构建。

## 指定 C++ 标准

真实项目通常需要指定 C++ 标准。例如我们希望使用 C++20，可以这样写：

```cmake
cmake_minimum_required(VERSION 3.20)

project(hello_cmake LANGUAGES CXX)

add_executable(hello main.cpp)

target_compile_features(hello PRIVATE cxx_std_20)
```

这里使用的是 `target_compile_features`，而不是直接设置全局变量。它的意思是：`hello` 这个目标需要 C++20。

`PRIVATE` 表示这个要求只作用于 `hello` 自己。对于一个可执行文件来说，这通常就是我们想要的。如果以后写的是库，就会遇到 `PUBLIC` 和 `INTERFACE`，它们用来表达依赖是否会传递给使用这个库的人。

这也是现代 CMake 的一个重要习惯：**优先给 target 设置属性，而不是到处设置全局变量**。

## 当项目不止一个文件

真实项目通常不会只有一个 `main.cpp`。我们习惯将声明和实现给分开，这样既方便维护，又方便协作。

现在我们把项目稍微扩展一下：

```text
hello-cmake/
├── CMakeLists.txt
├── include/
│   └── greeter.hpp
└── src/
    ├── greeter.cpp
    └── main.cpp
```

> [!INFO] INFO
> `.hpp` 是 C++ 项目中常见的头文件后缀，通常用来表示「这里面放的是 C++ 的声明」。它和 `.h` 在编译器眼里没有本质区别，更多是一种命名习惯。有人喜欢用 `.h` 同时写 C 和 C++ 头文件，也有人用 `.hpp` 来提醒自己这是 C++ 头文件。


头文件 `include/greeter.hpp`：

```cpp
#pragma once

#include <string>

std::string make_greeting(const std::string& name);
```

实现文件 `src/greeter.cpp`：

```cpp
#include "greeter.hpp"

std::string make_greeting(const std::string& name) {
    return "Hello, " + name + "!";
}
```

入口文件 `src/main.cpp`：

```cpp
#include <iostream>

#include "greeter.hpp"

int main() {
    std::cout << make_greeting("CMake") << std::endl;
    return 0;
}
```

此时的 `CMakeLists.txt` 可以写成：

```cmake
cmake_minimum_required(VERSION 3.20)

project(hello_cmake LANGUAGES CXX)

add_executable(hello
    src/main.cpp
    src/greeter.cpp
)

target_compile_features(hello PRIVATE cxx_std_20)

target_include_directories(hello PRIVATE include)
```

`target_include_directories` 用来告诉编译器去哪里找头文件。因为我们的 `greeter.hpp` 放在 `include/` 目录下，所以需要把这个目录加入头文件搜索路径。

这里仍然使用 `PRIVATE`。因为 `hello` 是一个可执行程序，它不会被其他 target 链接和复用，所以头文件目录没有必要向外传递。

## 加一点编译警告

一个比较好的习惯是尽早打开编译警告，这经常能在程序真正出错之前提醒我们。

不过，不同编译器的警告选项不完全一样。可以先写一个简单的判断：

```cmake
if(MSVC)
    target_compile_options(hello PRIVATE /W4)
else()
    target_compile_options(hello PRIVATE -Wall -Wextra -Wpedantic)
endif()
```

`MSVC` 表示当前使用的是 Microsoft Visual C++ 编译器。Windows 上如果使用 Visual Studio，一般会走这个分支。`/W4` 是 MSVC 的警告等级选项，表示打开较高等级的编译警告。其他编译器，例如 GCC 或 Clang，则使用 `-Wall -Wextra -Wpedantic`：

- `-Wall` 打开常见警告。
- `-Wextra` 再补充一些额外警告。
- `-Wpedantic` 会提醒不太符合语言标准的写法。

此时完整的 `CMakeLists.txt` 可以是：

```cmake
cmake_minimum_required(VERSION 3.20)

project(hello_cmake LANGUAGES CXX)

add_executable(hello
    src/main.cpp
    src/greeter.cpp
)

target_compile_features(hello PRIVATE cxx_std_20)

target_include_directories(hello PRIVATE include)

if(MSVC)
    target_compile_options(hello PRIVATE /W4)
else()
    target_compile_options(hello PRIVATE -Wall -Wextra -Wpedantic)
endif()
```

## Debug 和 Release

很多初学者会困惑：CMake 怎么切换 Debug 和 Release？

这取决于使用的生成器。对于 Makefile 或 Ninja 这种单配置生成器，通常在配置阶段指定：

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

如果要构建 Release：

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

但 Visual Studio 这种多配置生成器不一样。它可以在同一个构建目录里同时支持 Debug 和 Release，因此构建时指定配置：

```bash
cmake -S . -B build
cmake --build build --config Debug
```

或者：

```bash
cmake --build build --config Release
```

所以如果在不同教程里看到不同写法，不一定是谁错了，很可能只是使用的生成器不同。

对初学者来说，先掌握到这里就够了。因为现在的知识已经是海量，我们只需要知道最常用的命令即可。如果遇到不会的内容就询问AI或者自己查文档吧。