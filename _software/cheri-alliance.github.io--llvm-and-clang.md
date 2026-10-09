---
title: LLVM & Clang
layout: source
permalink: /sources/cheri-alliance.github.io/build/software-ecosystem/llvm-and-clang/
---

1. Build
2. Software Ecosystem
3. LLVM &amp; Clang
{: .source-breadcrumbs }

# LLVM &amp; Clang
{: id="page-hero-title" .page-hero-title }

LLVM and Clang translate language pointers, calling conventions, bounds, permissions, and capability operations into code for multiple CHERI targets.
{: .page-hero-summary }

A processor can enforce capability bounds only when the software stack creates and preserves meaningful capabilities. The compiler is where source-language pointers, object layouts, calls, and optimisations meet the CHERI architecture.

LLVM and Clang provide the main compiler infrastructure used across CheriBSD, Morello, CHERI-RISC-V, and CHERIoT.

## Clang and the source-language model
{: id="clang-and-the-source-language-model" }

Clang applies the language and application binary interface rules for a target. In CHERI environments, those rules can cover capability-based pointers, hybrid and pure-capability calling conventions, target-specific address spaces, bounds creation, capability intrinsics, and diagnostics for source assumptions that do not carry across cleanly.

The exact model depends on the platform. Morello, application-class CHERI-RISC-V, and CHERIoT do not share one universal target configuration or ABI.

## LLVM and code generation
{: id="llvm-and-code-generation" }

LLVM carries pointer and capability information through its intermediate representation and target back ends. CHERI support affects instruction selection, registers, relocations, object formats, linking, and the preservation of capability metadata through optimisation.

Capability representations can be wider than their virtual address range and can include protected tag state outside ordinary program memory. These properties are reflected in target-specific compiler, linker, and loader work.

## Ecosystem routes
{: id="ecosystem-routes" }

### CheriBSD and CHERI-RISC-V
{: id="cheribsd-and-cheri-risc-v" }

The `cheribuild` environment brings together a compatible LLVM and Clang toolchain, system headers, linker, QEMU, and CheriBSD image. It supports application-class CHERI-RISC-V work across hybrid and pure-capability software configurations.

### Morello
{: id="morello" }

Morello uses an Arm-targeted CHERI compiler and ABI. Its SDK and CheriBSD environment combine Morello-specific code generation with matching system software and firmware.

### CHERIoT
{: id="cheriot" }

The CHERIoT SDK uses a Clang-based toolchain aligned with the CHERIoT instruction set, RTOS, compartment model, linker, and firmware build system.

### Mainline LLVM
{: id="mainline-llvm" }

Parts of the wider CHERI implementation are present in upstream LLVM, while complete target support can still depend on project branches and platform release processes. The boundary between upstream infrastructure and platform-specific code continues to develop.

## Compatibility and current boundaries
{: id="compatibility-and-current-boundaries" }

CHERI compiler support is tied to an architecture, ABI, system headers, runtime, loader, and operating-system environment. A binary built for one combination is not automatically interchangeable with another.

Bounds precision is also a policy choice rather than a single property of the compiler. Different environments may bound complete allocations, language objects, arrays, or selected subobjects with different compatibility implications.

## Project links
{: id="project-links" }

- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild)
- [LLVM project](https://llvm.org/)
- [CHERIoT Programmer’s Guide](https://cheriot.org/book/)

## Where next
{: .where-next-title }

### [Rust](https://cheri-alliance.github.io/build/software-ecosystem/rust/)
{: .where-next-card-title }





[Rust support combines language-level safety with capability-aware targets and native interfaces.](https://cheri-alliance.github.io/build/software-ecosystem/rust/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/build/software-ecosystem/rust/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CheriBSD](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .related-pages-item-title }





[A complete CHERI operating-system environment built around an LLVM and Clang toolchain.](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .source-card-label }





### [Choose a Platform](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-title }





[Compare platforms and the software stacks supplied for each development route.](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .source-card-label }
