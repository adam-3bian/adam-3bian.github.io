---
title: Debugging Tools
layout: source
permalink: /sources/cheri-alliance.github.io/build/software-ecosystem/debugging-tools/
---

1. Build
2. Software Ecosystem
3. Debugging Tools
{: .source-breadcrumbs }

# Debugging Tools
{: id="page-hero-title" .page-hero-title }

Capability-aware debuggers and diagnostics make addresses, bounds, permissions, tags, sealing state, and faults visible alongside familiar program state.
{: .page-hero-summary }

CHERI extends ordinary pointer state with protected metadata. Debugging support therefore covers familiar addresses, registers, stack traces, and symbols together with capability bounds, permissions, tags, sealing state, and architecture-specific faults.

## Capability-aware diagnostics
{: id="capability-aware-diagnostics" }

A capability exception can identify the operation that exceeded the authority available to it. Depending on the platform, diagnostics can expose the capability register, attempted address, access type, bounds, permissions, tag state, and the process or compartment in which the fault occurred.

The terminology and presentation differ across CheriBSD, CHERIoT, Linux, Morello, and CHERI-RISC-V environments.

## GDB and LLDB
{: id="gdb-and-lldb" }

CHERI-aware builds of GDB and LLDB extend their normal source, register, memory, breakpoint, and core-file views with capability representations. Target support is tied to the architecture and ABI understood by a particular debugger build.

A conventional host debugger can display capability-sized data as a value without understanding the protected tag or decoding target-specific permissions and registers.

## QEMU
{: id="qemu" }

QEMU provides repeatable architecture and operating-system environments for capability exceptions, remote debugging, instruction traces, and continuous integration. Its role is particularly important where software development and automated testing need to run independently of hardware availability.

The CHERI QEMU work covers architecture models, platform support, version maintenance, and test infrastructure.

## Operating-system and firmware support
{: id="operating-system-and-firmware-support" }

CheriBSD carries capability state through signals, core dumps, process tracing, kernel diagnostics, and target-aware debugging tools. CHERI Linux projects integrate similar concerns with their own kernel branches and user-space environments.

CHERIoT exposes faults within a compartment-oriented embedded model. Its tooling also includes firmware audit information describing compartments, imports, exports, and authority relationships.

## Binary inspection
{: id="binary-inspection" }

CHERI-aware versions of tools such as `llvm-readelf`, `llvm-objdump`, and `nm` understand target object formats, capability relocations, symbols, and capability-bearing sections. This makes the static structure of a binary visible alongside runtime diagnostics.

## Current tool landscape
{: id="current-tool-landscape" }

Debugger and diagnostic coverage follows the underlying platform projects. Architecture version, ABI, operating system, simulator, SDK, and binary format all affect what a tool can decode. As a result, capability-aware debugging is provided as part of specific CHERI environments rather than one universal host toolchain.

## Project links
{: id="project-links" }

- [CHERI Alliance GDB](https://github.com/CHERI-Alliance/gdb)
- [CTSRD-CHERI GDB](https://github.com/CTSRD-CHERI/gdb)
- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild)
- [CHERIoT Programmer’s Guide](https://cheriot.org/book/)

## Where next
{: .where-next-title }

### [Porting Status](https://cheri-alliance.github.io/build/software-ecosystem/porting-status/)
{: .where-next-card-title }





[Porting status varies across platforms, ABIs, operating systems, packages, and project revisions.](https://cheri-alliance.github.io/build/software-ecosystem/porting-status/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/build/software-ecosystem/porting-status/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CheriBSD](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .related-pages-item-title }





[A full-system CHERI environment with capability-aware faults, tracing, core dumps, and developer tools.](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .source-card-label }





### [QEMU Working Group](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-qemu/)
{: .related-pages-item-title }





[Alliance collaboration around maintained CHERI architecture and platform emulation.](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-qemu/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-qemu/)
{: .source-card-label }





### [CHERIoT](https://cheri-alliance.github.io/build/platforms/cheriot/)
{: .related-pages-item-title }





[An embedded CHERI platform with compartment-aware firmware and diagnostic tooling.](https://cheri-alliance.github.io/build/platforms/cheriot/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/platforms/cheriot/)
{: .source-card-label }
