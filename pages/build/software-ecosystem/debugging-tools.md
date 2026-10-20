---
layout: page/standard
title: Debugging Tools
summary: Understand CHERI faults and inspect capabilities alongside familiar program state.
permalink: /build/software-ecosystem/debugging-tools/
slug: build-software-ecosystem-debugging-tools
navigation:
  header:
    category: Build
    subcategory: Software Ecosystem
related:
- type: page
  slug: build-software-ecosystem-porting-status
  relation: next_step
- type: repository
  slug: cheribsd
  relation: related
- type: working_group
  slug: cheri-qemu
  relation: related
- type: page
  slug: build-platforms-cheriot
  relation: related
---

## Overview

CHERI adds information to pointers, including bounds, permissions and protected validity information. Capability-aware debugging tools make this state visible alongside familiar addresses, registers, variables, symbols and stack traces.

When CHERI prevents an invalid memory access, these tools can help developers understand what the program tried to do, which capability it used, and why the operation was rejected.

## Debugging capability faults

A CHERI capability fault occurs when software attempts an operation that is not permitted by the capability it is using.

Depending on the platform and tools, diagnostics may show information such as:

- the capability involved
- the attempted memory address and operation
- capability bounds
- permissions
- tag and sealing state
- the instruction that caused the fault
- the process, thread or compartment in which it occurred

This can make CHERI faults valuable during development: rather than allowing an invalid access to silently corrupt memory, the hardware can **stop** it at the point where protection is violated.

The exact diagnostics and terminology vary between CHERI platforms.

## GDB and LLDB

Capability-aware versions of GDB and LLDB extend familiar debugging workflows with support for CHERI capabilities.

Alongside source code, breakpoints, registers, memory and stack traces, supported debugger builds can expose capability registers and their associated bounds, permissions and state.

Debugger support depends on the target architecture, ABI and platform, so use the debugger supplied or recommended for your CHERI development environment.

## Debugging with QEMU

QEMU provides a convenient environment for investigating capability faults without requiring physical hardware.

It is particularly useful for:

- developing and debugging CHERI software
- reproducing capability faults
- remote debugging
- automated testing
- running tests consistently across development and continuous-integration environments

Because QEMU provides an architectural rather than physical implementation model, hardware-specific behaviour may require an FPGA or silicon platform.

## Operating-system and embedded diagnostics

Different CHERI software environments integrate capability debugging in different ways.

- **CheriBSD** carries capability information through operating-system facilities such as faults, signals, core dumps and process debugging, providing an application-class environment for investigating CHERI software.
- **CHERI Linux** development similarly needs capability-aware kernel and user-space diagnostic support as the platform evolves.
- **CHERIoT** provides diagnostics in a compartment-oriented embedded environment, where faults can be investigated in the context of individual software compartments and the authority available to them.

## Inspecting binaries

Debugging sometimes starts before the program runs. CHERI-aware binary tools can help developers inspect how capabilities are represented in compiled software.

Tools such as `llvm-readelf`, `llvm-objdump`, and `nm` can be used, with appropriate CHERI support, to examine areas such as symbols, sections, relocations, generated instructions and capability-related information in executable files.

These tools can be particularly useful when investigating compiler, linker, loader or ABI issues.

## Choosing debugging tools

Capability-aware debugging is currently closely tied to the underlying CHERI architecture, ABI, operating system and software environment. A conventional debugger may be able to display the raw contents of a capability-sized value without understanding all of its CHERI-specific state.

## From fault to fix

CHERI changes an important part of the debugging experience: memory errors that might otherwise cause corruption or appear much later can instead become explicit capability faults.

Capability-aware diagnostics help developers trace those faults back to incorrect pointer use, insufficient authority or other software assumptions, making debugging tools an important part of the CHERI development environment.

## Project links

- [CHERI Alliance GDB](https://github.com/CHERI-Alliance/gdb)
- [CTSRD-CHERI GDB](https://github.com/CTSRD-CHERI/gdb)
- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild)
- [CHERIoT Programmer’s Guide](https://cheriot.org/book/)
