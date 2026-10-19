---
title: LLVM & Clang
where-next:
  url: /software/rust/
related-pages:
- url: /software/cheribsd/
  description: A complete CHERI operating-system environment built around an LLVM and Clang toolchain.
  action: Read this page
- url: /guides/choose-a-platform/
  title: Choose a Platform
  description: Compare platforms and the software stacks supplied for each development route.
  action: Read this page
---

1. Build
2. Software Ecosystem
3. LLVM &amp; Clang
{: .source-breadcrumbs }

# LLVM &amp; Clang
{: id="page-hero-title" .page-hero-title }

Compile C and C++ software for CHERI-enabled platforms.
{: .page-hero-summary }

LLVM and Clang provide the compiler foundation for much of the CHERI software ecosystem. They translate ordinary language-level operations, such as accessing objects through pointers, into code that uses CHERI capabilities and the protection they provide.

Clang is the C and C++ compiler developers interact with, while LLVM provides the underlying compiler infrastructure and code generation.

## What changes when compiling for CHERI?
{: id="what-changes-when-compiling-for-cheri" }

CHERI hardware uses capabilities to control how software accesses memory. The compiler plays an important role in creating and preserving those capabilities as it translates source code into machine code.

Depending on the target platform, Clang can support:

- capability-based pointers
- hybrid and pure-capability software
- capability bounds and permissions
- CHERI-specific operations and intrinsics
- calling conventions and application binary interfaces (ABIs)
- diagnostics that identify assumptions in existing code that may not work correctly with capabilities

In many cases, existing C and C++ software can be compiled for CHERI with relatively small changes, while code that makes assumptions about pointers, memory layouts or integer conversions may require more attention.

## Hybrid and pure-capability builds
{: id="hybrid-and-pure-capability-builds" }

CHERI platforms can support different ways of introducing capabilities into existing software.

In a hybrid environment, conventional pointers can coexist with CHERI capabilities. This can be useful when bringing up platforms and progressively adapting existing software.

In a pure-capability environment, pointers are represented as CHERI capabilities throughout applications and supporting software, providing stronger and more systematic enforcement.

The available models and ABIs depend on the target platform. Morello, application-class CHERI-RISC-V and CHERIoT therefore use toolchains configured for their respective architectures and software environments.

## CHERI toolchain routes
{: id="cheri-toolchain-routes" }

### CheriBSD and CHERI-RISC-V
{: id="cheribsd-and-cheri-risc-v" }

The `cheribuild` environment brings together a compatible LLVM and Clang toolchain, system headers, linker, QEMU, and CheriBSD image. It supports application-class CHERI-RISC-V work across hybrid and pure-capability software configurations.

### Morello
{: id="morello" }

Morello uses an Arm-based CHERI compiler and ABI together with its corresponding system software and platform support.

The Morello software environment has been widely used to develop and port applications to CHERI and explore the transition between conventional and pure-capability software.

### CHERIoT
{: id="cheriot" }

The CHERIoT SDK uses a Clang-based toolchain aligned with the CHERIoT instruction set, RTOS, compartment model, linker, and firmware build system.

### Mainline LLVM
{: id="mainline-llvm" }

Parts of CHERI support are already present in upstream LLVM, while complete target support can still depend on platform-specific branches and releases. A key focus for the CHERI Alliance is bringing this work together, driving convergence across CHERI platforms and helping move towards common, upstream LLVM support.

## Bounds and compatibility
{: id="bounds-and-compatibility" }

CHERI compilers can use information about objects and allocations to create capabilities with appropriate bounds and permissions.

How tightly those bounds are applied can vary between platforms and configurations, balancing stronger protection with compatibility requirements. As a result, compiler version, target architecture, ABI and software environment all matter when building or comparing CHERI software.

Code that assumes that pointers and integers have the same representation, or relies heavily on particular object layouts or pointer manipulation, may need additional attention when moving to a CHERI target.

## Getting started
{: id="getting-started" }

For most developers, there is no need to build or understand the CHERI compiler infrastructure itself. Start with the toolchain supplied or recommended for your chosen platform.

For application-class CHERI development, `cheribuild` provides an integrated route to LLVM/Clang, QEMU and CheriBSD. For embedded development, use the toolchain and SDK associated with the target platform, such as CHERIoT.

From there, the next step is to [compile existing software](/guides/port-existing-software/), understand any compatibility warnings or errors, and progressively adapt the code to make effective use of CHERI's protection.


## Project links
{: id="project-links" }

- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild)
- [LLVM project](https://llvm.org/)
- [CHERIoT Programmer’s Guide](https://cheriot.org/book/)

## Where next
{: .where-next-title }

### [Rust](/software/rust/)
{: .where-next-card-title }





[Rust support combines language-level safety with capability-aware targets and native interfaces.](/software/rust/)
{: .where-next-summary }



[Continue](/software/rust/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CheriBSD](/software/cheribsd/)
{: .related-pages-item-title }





[A complete CHERI operating-system environment built around an LLVM and Clang toolchain.](/software/cheribsd/)
{: .related-pages-item-summary }



[Read this page](/software/cheribsd/)
{: .source-card-label }





### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Compare platforms and the software stacks supplied for each development route.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
