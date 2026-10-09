---
title: Install a CHERI Toolchain
layout: source
permalink: /sources/cheri-alliance.github.io/build/developers/install-a-toolchain/
---

1. Build
2. Developers
3. Install a CHERI Toolchain
{: .source-breadcrumbs }

# Install a CHERI Toolchain
{: id="page-hero-title" .page-hero-title }

Install the toolchain that matches your CHERI architecture, OS and ABI, then verify it before compiling application code.
{: .page-hero-summary }

A CHERI compiler is not a drop-in label for one universal target. The architecture, operating system, application binary interface (ABI), linker, and runtime libraries must agree. A compiler that understands Morello cannot automatically build a CHERIoT image, and a pure-capability library cannot be linked into an incompatible conventional ABI.

Use the installation route supplied by your platform rather than assembling unrelated binaries by hand.

## What the toolchain contains
{: id="what-the-toolchain-contains" }

A practical CHERI software development kit (SDK) normally includes:

- a CHERI-aware Clang compiler
- LLVM optimisation and code-generation tools
- a linker that understands capability relocations
- an assembler and binary utilities
- target headers and libraries in a **sysroot**
- a debugger with capability-register support
- an emulator, simulator, or deployment tool
- build metadata for the selected operating system or board

Accidentally using the host system’s headers or libraries (**sysroot** directory) is one of the most common causes of build and link failures.

## Install the SDK
{: id="install-the-sdk" }

### CheriBSD and CHERI-RISC-V
{: id="cheribsd-and-cheri-risc-v" }

The recommended route is `cheribuild`, which builds compatible components from known source revisions.

~~~
git clone https://github.com/CTSRD-CHERI/cheribuild.git
cd cheribuild
./cheribuild.py --include-dependencies sdk-riscv64-purecap
~~~

For a full bootable environment, build and run the operating system target:

~~~
./cheribuild.py --include-dependencies run-riscv64-purecap
~~~

`cheribuild` can also create Morello and other supported SDKs. List current targets rather than guessing a name:

~~~
./cheribuild.py --list-targets
~~~

### CHERIoT
{: id="cheriot" }

The development container is the easiest way to get a working CHERIoT toolchain because the compiler, build system, simulator, and supporting tools are already configured together.

~~~
git clone --recursive https://github.com/CHERIoT-Platform/cheriot-rtos.git
cd cheriot-rtos
~~~

Open the repository in an editor that supports development containers. Inside the container, `/cheriot-tools` is commonly used as the SDK path. Follow the current [CHERIoT getting-started guide](https://cheriot.org/book/getting_started.html) for the supported image and board identifiers.

For automated builds, pin the container image or repository revision. “Latest” is convenient for learning but makes results harder to reproduce.

### CHERI Linux and commercial SDKs
{: id="cheri-linux-and-commercial-sdks" }

CHERI Linux distributions and processor suppliers may publish complete SDKs or container images. Use their release notes to match:

- processor implementation and architecture version
- kernel and user-space branch
- pure-capability or hybrid ABI
- C library and dynamic linker
- emulator, FPGA image, or board revision

A vendor kernel and an unrelated user-space SDK should be combined only when their compatibility is documented.

## Verify the compiler before use
{: id="verify-the-compiler-before-use" }

Print the compiler identity and target:

~~~
clang --version
clang --print-target-triple
~~~

For a cross compiler, use the compiler path provided by the SDK and inspect its predefined macros:

~~~
clang --target=<documented-target> -dM -E - < /dev/null
~~~

Look for the architecture and capability-related definitions described by the platform. Macro names differ across environments, so do not use one platform’s macro as a universal CHERI test.

Compile a small source file to an object, then inspect the object with the SDK’s tools:

~~~
int answer(void) {
    return 42;
}
~~~

~~~
clang --target=<documented-target> -c answer.c -o answer.o
llvm-readelf -h answer.o
~~~

Confirm that the machine, class, and ABI match the intended target. The final proof is to link and run the program in the matching operating system or firmware environment.

## Keep builds reproducible
{: id="keep-builds-reproducible" }

Record these values in build logs or release metadata:

- SDK or container version
- compiler commit and version
- target triple and ABI
- sysroot location or identifier
- architecture and board version
- build-system configuration
- source revision of the operating system or real-time operating system (RTOS)

CHERI is a cross-layer architecture. Reproducible results require the layers to be named together.

Once you can compile, inspect, and run a test program for your chosen target, continue with [Build Your First Application](https://cheri-alliance.github.io/build/developers/build-your-first-application/).

## Where next
{: .where-next-title }

### [Build Your First Application](https://cheri-alliance.github.io/build/developers/build-your-first-application/)
{: .where-next-card-title }





[Build a small program, verify its target and capability mode, then observe one controlled capability fault.](https://cheri-alliance.github.io/build/developers/build-your-first-application/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/build/developers/build-your-first-application/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Choose a Platform](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-title }





[A CHERI platform combines more than an instruction set.](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .source-card-label }





### [Run CHERI in Simulation](https://cheri-alliance.github.io/build/developers/run-cheri-in-simulation/)
{: .related-pages-item-title }





[Simulation is the recommended first execution environment for most CHERI developers.](https://cheri-alliance.github.io/build/developers/run-cheri-in-simulation/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/developers/run-cheri-in-simulation/)
{: .source-card-label }
