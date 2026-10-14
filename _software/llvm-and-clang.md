---
title: LLVM & Clang
website_url: https://llvm.org/
related:
  hardware:
  - cheriot
  - morello
  software:
  - cheribsd
repositories:
- label: Build tools (cheribuild)
  url: https://github.com/CTSRD-CHERI/cheribuild
---

# LLVM & Clang

LLVM and Clang translate language pointers, calling conventions, bounds, permissions, and capability operations into code for multiple CHERI targets.

A processor can enforce capability bounds only when the software stack creates and preserves meaningful capabilities. The compiler is where source-language pointers, object layouts, calls, and optimisations meet the CHERI architecture.

LLVM and Clang provide the main compiler infrastructure used across [CheriBSD](/software/cheribsd/), [Morello](/hardware/morello/), CHERI-RISC-V, and [CHERIoT](/hardware/cheriot/).

## Clang and the source-language model

Clang applies the language and application binary interface rules for a target. In CHERI environments, those rules can cover capability-based pointers, hybrid and pure-capability calling conventions, target-specific address spaces, bounds creation, capability intrinsics, and diagnostics for source assumptions that do not carry across cleanly.

The exact model depends on the platform. Morello, application-class CHERI-RISC-V, and CHERIoT do not share one universal target configuration or ABI.

## LLVM and code generation

LLVM carries pointer and capability information through its intermediate representation and target back ends. CHERI support affects instruction selection, registers, relocations, object formats, linking, and the preservation of capability metadata through optimisation.

Capability representations can be wider than their virtual address range and can include protected tag state outside ordinary program memory. These properties are reflected in target-specific compiler, linker, and loader work.

## Ecosystem routes

### CheriBSD and CHERI-RISC-V

The cheribuild environment brings together a compatible LLVM and Clang toolchain, system headers, linker, QEMU, and CheriBSD image. It supports application-class CHERI-RISC-V work across hybrid and pure-capability software configurations.

### Morello

Morello uses an Arm-targeted CHERI compiler and ABI. Its SDK and CheriBSD environment combine Morello-specific code generation with matching system software and firmware.

### CHERIoT

The CHERIoT SDK uses a Clang-based toolchain aligned with the CHERIoT instruction set, RTOS, compartment model, linker, and firmware build system.

### Mainline LLVM

Parts of the wider CHERI implementation are present in upstream LLVM, while complete target support can still depend on project branches and platform release processes. The boundary between upstream infrastructure and platform-specific code continues to develop.

## Compatibility and current boundaries

CHERI compiler support is tied to an architecture, ABI, system headers, runtime, loader, and operating-system environment. A binary built for one combination is not automatically interchangeable with another.

Bounds precision is also a policy choice rather than a single property of the compiler. Different environments may bound complete allocations, language objects, arrays, or selected subobjects with different compatibility implications.

## Project links

- [cheribuild](https://github.com/CTSRD-CHERI/cheribuild)
- [LLVM project](https://llvm.org/)
- [CHERIoT Programmer’s Guide](https://cheriot.org/book/)
