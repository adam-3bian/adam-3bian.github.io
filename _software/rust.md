---
title: Rust
image_url: null
website_url: null
repository_urls: []
type: null
status: null
related:
  organisations: []
  hardware: []
  software:
  - llvm-and-clang
---

# Rust

Rust support brings language-level memory safety to CHERI platforms while hardware capabilities strengthen unsafe code, native interfaces, and compartment boundaries.

Rust prevents many memory errors in safe code, while CHERI constrains memory access and authority at run time. The two approaches work at different layers and can reinforce each other without being interchangeable.

## Language safety and hardware protection

Safe Rust uses ownership, borrowing, lifetimes, and type checking to reject invalid programs before execution. CHERI capabilities can add bounds and permissions beneath raw pointers, native libraries, operating-system code, and compartment interfaces.

This combination is particularly relevant where a Rust component depends on unsafe code or shares a process with C and C++ software.

## What platform support contains

A Rust target spans the compiler back end, pointer representation, ABI, core and standard libraries, allocator, panic and unwinding model, operating-system interfaces, native bindings, debugger support, and build tooling.

Capability pointers may be wider than the virtual address range. That distinction reaches code that equates pointer size with integer width, object layout, addressable memory, or a target’s natural index type.

## Current platform routes

### Morello and CheriBSD

Rust work for Morello has covered freestanding and CheriBSD environments, including compiler targets, libraries, and native interfaces. Complete environments can depend on project forks and pinned toolchain revisions.

### CHERI-RISC-V

CHERI-RISC-V work includes pure-capability targets and operating-system integration. Target names, package coverage, and standard-library support differ between projects and releases.

### CHERIoT

Rust support for CHERIoT is developing within its embedded hardware-software ecosystem. The established CHERIoT platform remains centred on its C and C++ SDK, while Rust work extends the compiler, runtime, and compartment interfaces.

## Unsafe Rust and native interfaces

Unsafe Rust can dereference raw pointers, cross foreign-function interfaces, access mutable static state, and rely on invariants outside the compiler’s proof. On a CHERI target, those pointers can still carry architectural bounds and permissions.

Hardware enforcement does not make every unsafe operation valid under Rust’s aliasing, lifetime, or initialisation rules. It adds a separate layer of protection around the authority available to the code.

Native interfaces also carry ABI, ownership, callback, layout, and allocation assumptions between Rust and C or C++. CHERI makes the pointer and authority aspects of those interfaces visible at the target level.

## Maturity and collaboration

Rust support is not one uniform CHERI product line. Compiler revisions, operating systems, libraries, Cargo support, target hardware, and test coverage vary between platform projects.

The Rust + CHERI Working Group connects this work across the Alliance. CHERI and Rust provides the broader architectural context.
