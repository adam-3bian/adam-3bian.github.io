---
title: Pure-Capability Systems
permalink: /build/technology/pure-capability-systems/
summary: Pure-capability systems represent language-visible pointers as capabilities throughout compiled software, applying CHERI checks broadly across the system.
parent: /build/
next_page_url: /discover/history/early-capability-systems/
related:
  pages:
  - /build/technology/capabilities/
  - /build/technology/hybrid-systems/
---

# Pure-Capability Systems

Selective capabilities can protect selected buffers and interfaces, but ordinary pointers elsewhere may still authorise broad access. A pure-capability application binary interface, or ABI, takes the wider step: language-visible pointers are represented as capabilities throughout the relevant compiled software.

This is the main route for applying CHERI memory protection across existing C and C++ code without rewriting every component in a different language.

## What changes in the ABI

An ABI defines how compiled components agree on calls, data layout, registers, binaries, and system interfaces. In a pure-capability ABI:

- data pointers use capability representations
- function pointers and return addresses use protected forms
- arguments and return values use capability-aware calling conventions
- relocations and dynamic linking preserve capability metadata
- the operating system passes capability-aware process state
- system calls and libraries use matching pointer representations

Every linked component at an interface must follow compatible rules.

## Where capabilities come from

The operating system and program loader establish initial capabilities for code, globals, stack, and mapped memory. The runtime and allocator derive capabilities for objects. The compiler then uses those capabilities for ordinary source-level pointer operations.

This means a source declaration such as:

```c
char *buffer = malloc(128);
```

can produce a capability bounded to the allocation. Loads and stores through buffer are checked by the processor without requiring the source programmer to call a CHERI instruction for each access.

## Benefits

Pure-capability systems provide:

- broad spatial protection for capability-based accesses
- hardware-enforced permissions on pointers and code
- protection of capability integrity through tags
- compiler diagnostics for unsafe pointer assumptions
- a strong foundation for in-process compartments
- clearer faults close to invalid memory operations

Large bodies of Unix software have been ported through CheriBSD, showing that this model can support complete operating-system and application stacks.

## Common porting changes

Well-structured source often compiles with little change. Problems usually appear where code:

- stores pointers in integers that are too small
- assumes pointer size equals address-space size
- embeds live pointers in files or network messages
- uses custom allocation or memory-copy code
- depends on out-of-object pointer arithmetic
- contains ABI-specific assembly
- calls libraries built for an incompatible ABI

These are often latent portability or security problems even before CHERI. The pure-capability build makes them visible.

## Pointer size and performance

Capabilities carry more information than ordinary addresses. Depending on the architecture, this can increase pointer storage, memory traffic, structure size, or register pressure. Capability compression reduces the representation cost, and compiler, allocator, and microarchitecture choices influence the result.

There is no universal performance overhead. Pointer-heavy data structures, system calls, cache behaviour, and compartment transitions affect workloads differently. Measure the intended application on the intended implementation.

## Pure capability is not the same as compartmentalised

A pure-capability process can still begin with capabilities for most of its address space. Its pointers are protected by bounds and permissions, but every library may remain part of one large trust domain.

Compartmentalisation deliberately divides the capabilities held by different components. It is an additional architecture and software design step.

## Pure capability is not a complete security guarantee

Bounds may be at allocation rather than every language subobject.

Temporal safety requires a defined lifetime mechanism.

In-bounds logic errors remain possible.

Over-broad initial capabilities weaken least privilege.

Conventional devices, direct memory access (DMA), and shared memory need system integration.

Software must still validate input and enforce authentication and policy.

## How to verify the mode

The hardware name alone does not establish pure-capability operation. Check:

- compiler target and flags
- binary ABI metadata
- linked libraries and dynamic loader
- operating-system process mode
- capability-aware debugger output
- a controlled bounds test or platform conformance suite

CheriBSD, Morello software, CHERI-RISC-V software development kits (SDKs), and CHERIoT use different target names and ABIs. Use their current documentation.

Pure-capability software offers broad pointer protection. Compartmentalisation explains how to reduce the set of objects and services that each component can reach.
