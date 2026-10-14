---
title: Install a CHERI Toolchain
image_url: /assets/guides/install-a-toolchain/placeholder.svg
repository_urls: []
updated_date: null
authors: []
related:
  working-groups: []
  hardware:
  - cheriot
  - morello
  software:
  - cheri-linux
  - cheribsd
  - llvm-and-clang
---

# Install a CHERI Toolchain

Install the toolchain that matches your CHERI architecture, OS and ABI, then verify it before compiling application code.

A CHERI compiler is not a drop-in label for one universal target. The architecture, operating system, application binary interface (ABI), linker, and runtime libraries must agree. A compiler that understands [Morello](/hardware/morello/) cannot automatically build a [CHERIoT](/hardware/cheriot/) image, and a pure-capability library cannot be linked into an incompatible conventional ABI.

Use the installation route supplied by your platform rather than assembling unrelated binaries by hand.

## What the toolchain contains

A practical CHERI software development kit (SDK) normally includes:

- a CHERI-aware [Clang](/software/llvm-and-clang/) compiler
- LLVM optimisation and code-generation tools
- a linker that understands capability relocations
- an assembler and binary utilities
- target headers and libraries in a sysroot
- a debugger with capability-register support
- an emulator, simulator, or deployment tool
- build metadata for the selected operating system or board

Accidentally using the host system’s headers or libraries (sysroot directory) is one of the most common causes of build and link failures.

## Install the SDK

### CheriBSD and CHERI-RISC-V

The recommended route is cheribuild, which builds compatible components from known source revisions.

```bash
git clone https://github.com/CTSRD-CHERI/cheribuild.git
cd cheribuild
./cheribuild.py --include-dependencies sdk-riscv64-purecap
```

For a full bootable environment, build and run the operating system target:

```bash
./cheribuild.py --include-dependencies run-riscv64-purecap
```

cheribuild can also create Morello and other supported SDKs. List current targets rather than guessing a name:

```bash
./cheribuild.py --list-targets
```

### CHERIoT

The development container is the easiest way to get a working CHERIoT toolchain because the compiler, build system, simulator, and supporting tools are already configured together.

```bash
git clone --recursive https://github.com/CHERIoT-Platform/cheriot-rtos.git
cd cheriot-rtos
```

Open the repository in an editor that supports development containers. Inside the container, /cheriot-tools is commonly used as the SDK path. Follow the current CHERIoT getting-started guide for the supported image and board identifiers.

For automated builds, pin the container image or repository revision. “Latest” is convenient for learning but makes results harder to reproduce.

### CHERI Linux and commercial SDKs

[CHERI Linux](/software/cheri-linux/) distributions and processor suppliers may publish complete SDKs or container images. Use their release notes to match:

- processor implementation and architecture version
- kernel and user-space branch
- pure-capability or hybrid ABI
- C library and dynamic linker
- emulator, FPGA image, or board revision

A vendor kernel and an unrelated user-space SDK should be combined only when their compatibility is documented.

## Verify the compiler before use

Print the compiler identity and target:

```bash
clang --version
clang --print-target-triple
```

For a cross compiler, use the compiler path provided by the SDK and inspect its predefined macros:

```bash
clang --target=<documented-target> -dM -E - < /dev/null
```

Look for the architecture and capability-related definitions described by the platform. Macro names differ across environments, so do not use one platform’s macro as a universal CHERI test.

Compile a small source file to an object, then inspect the object with the SDK’s tools:

```c
int answer(void) {
    return 42;
}
```

```bash
clang --target=<documented-target> -c answer.c -o answer.o
llvm-readelf -h answer.o
```

Confirm that the machine, class, and ABI match the intended target. The final proof is to link and run the program in the matching operating system or firmware environment.

## Keep builds reproducible

Record these values in build logs or release metadata:

- SDK or container version
- compiler commit and version
- target triple and ABI
- sysroot location or identifier
- architecture and board version
- build-system configuration
- source revision of the operating system or real-time operating system (RTOS)

CHERI is a cross-layer architecture. Reproducible results require the layers to be named together.

Once you can compile, inspect, and run a test program for your chosen target, continue with [Build Your First Application](/guides/build-your-first-application/).
