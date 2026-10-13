---
title: Debugging Tools
image_url: null
website_url: null
repository_urls:
- https://github.com/CHERI-Alliance/gdb
- https://github.com/CTSRD-CHERI/gdb
- https://github.com/CTSRD-CHERI/cheribuild
type: null
status: null
related:
  organisations: []
  hardware:
  - cheriot
  software:
  - cheribsd
---

# Debugging Tools

Capability-aware debuggers and diagnostics make addresses, bounds, permissions, tags, sealing state, and faults visible alongside familiar program state.

CHERI extends ordinary pointer state with protected metadata. Debugging support therefore covers familiar addresses, registers, stack traces, and symbols together with capability bounds, permissions, tags, sealing state, and architecture-specific faults.

## Capability-aware diagnostics

A capability exception can identify the operation that exceeded the authority available to it. Depending on the platform, diagnostics can expose the capability register, attempted address, access type, bounds, permissions, tag state, and the process or compartment in which the fault occurred.

The terminology and presentation differ across CheriBSD, CHERIoT, Linux, Morello, and CHERI-RISC-V environments.

## GDB and LLDB

CHERI-aware builds of GDB and LLDB extend their normal source, register, memory, breakpoint, and core-file views with capability representations. Target support is tied to the architecture and ABI understood by a particular debugger build.

A conventional host debugger can display capability-sized data as a value without understanding the protected tag or decoding target-specific permissions and registers.

## QEMU

QEMU provides repeatable architecture and operating-system environments for capability exceptions, remote debugging, instruction traces, and continuous integration. Its role is particularly important where software development and automated testing need to run independently of hardware availability.

The CHERI QEMU work covers architecture models, platform support, version maintenance, and test infrastructure.

## Operating-system and firmware support

CheriBSD carries capability state through signals, core dumps, process tracing, kernel diagnostics, and target-aware debugging tools. CHERI Linux projects integrate similar concerns with their own kernel branches and user-space environments.

CHERIoT exposes faults within a compartment-oriented embedded model. Its tooling also includes firmware audit information describing compartments, imports, exports, and authority relationships.

## Binary inspection

CHERI-aware versions of tools such as llvm-readelf, llvm-objdump, and nm understand target object formats, capability relocations, symbols, and capability-bearing sections. This makes the static structure of a binary visible alongside runtime diagnostics.

## Current tool landscape

Debugger and diagnostic coverage follows the underlying platform projects. Architecture version, ABI, operating system, simulator, SDK, and binary format all affect what a tool can decode. As a result, capability-aware debugging is provided as part of specific CHERI environments rather than one universal host toolchain.

## Project links

CHERI Alliance GDB

CTSRD-CHERI GDB

cheribuild

CHERIoT Programmer’s Guide
