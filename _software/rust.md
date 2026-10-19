---
title: Rust
where-next:
  url: /software/cheribsd/
related-pages:
- url: /software/llvm-and-clang/
  description: The compiler infrastructure underlying current Rust and CHERI target work.
  action: Read this page
- url: /discover/why-cheri/cheri-and-rust/
  description: The wider relationship between language safety and architectural capabilities.
  action: Read this page
- url: /groups/rust-plus-cheri/
  title: Rust + CHERI Working Group
  description: Alliance collaboration around Rust toolchains, runtimes, native interfaces, and CHERI platforms.
  action: Read this page
---

1. Build
2. Software Ecosystem
3. Rust
{: .source-breadcrumbs }

# Rust
{: id="page-hero-title" .page-hero-title }

Develop Rust software for CHERI-enabled platforms.
{: .page-hero-summary }

Rust and CHERI provide complementary approaches to memory safety. Rust provides **language-level** protections, while CHERI adds hardware-enforced protection **at run time**, including around unsafe code, native interfaces and compartment boundaries.

For a broader explanation of how the two technologies complement each other, see the [CHERI and Rust technical overview](/build/technology/cheri-and-rust-technical/).

## Rust on CHERI
{: id="rust-on-cheri" }

Supporting Rust on a CHERI platform involves more than adding a compiler target. The compiler, pointer representation, application binary interface (ABI), libraries, allocator, operating-system interfaces, native bindings, debugger and build tools all need to work with CHERI capabilities.

In particular, CHERI capability pointers may differ from conventional pointers in size and representation. Code that makes assumptions about pointer sizes, integer conversions or data layouts may therefore need attention.

## What about unsafe Rust?
{: id="what-about-unsafe-rust" }

Safe Rust prevents many memory-safety errors before software runs, but real systems may also contain unsafe Rust, native libraries, operating-system components or code written in other languages.

On a CHERI platform, hardware capabilities can constrain the memory and permissions available to this code, providing an additional layer of protection where Rust's language-level guarantees do not apply.

CHERI does not make unsafe Rust automatically safe, or replace Rust's rules around aliasing, lifetimes and initialisation. Instead, the two provide complementary protection at different layers.

## Working with native code
{: id="working-with-native-code" }

Rust applications often need to interact with existing C or C++ libraries, operating-system services and other native components through foreign-function interfaces (FFIs).

On CHERI platforms, these interfaces also need to account for capability pointers, including their bounds and permissions, as well as ABI, memory-allocation, object-layout and ownership requirements.

This makes mixed-language interfaces an important area to test when bringing existing Rust software to CHERI.

## Current platform routes
{: id="current-platform-routes" }

### Morello and CheriBSD
{: id="morello-and-cheribsd" }

Rust work for Morello has included freestanding and CheriBSD environments, compiler targets, libraries and native interfaces.

These environments provide a route for exploring Rust on an application-class CHERI platform. Particular configurations may depend on project-specific toolchains and versions.

### CHERI-RISC-V
{: id="cheri-risc-v" }

Rust support is also being developed for CHERI-RISC-V, including pure-capability environments and operating-system integration.

Available compiler targets, libraries, package support and operating-system environments vary between projects and implementations.

### CHERIoT
{: id="cheriot" }

Rust support is developing within the CHERIoT embedded ecosystem.

The established CHERIoT development environment is centred on its C and C++ SDK, while Rust work is extending support across the compiler, runtime and compartment interfaces.

## Check your target environment
{: id="check-your-target-environment" }

Rust support is not yet uniform across all CHERI platforms. Before starting development, check:

- which CHERI architecture and processor are targeted
- which Rust compiler and target are supported
- whether the required core and standard libraries are available
- which ABI and pointer representation are used
- which operating system or runtime is supported
- whether Cargo and required packages work with the target
- which debugging and testing tools are available
- how native libraries and interfaces are supported

Pinning the toolchain and platform versions used by a project can also help keep builds and tests reproducible.

## Rust + CHERI collaboration
{: id="rust-cheri-collaboration" }

Rust support across CHERI is continuing to evolve across compiler, operating-system, embedded and hardware projects. 

The [Rust + CHERI Working Group](/groups/rust-plus-cheri/) connects this work across the CHERI Alliance and aims for convergence and compatibility. [CHERI and Rust](/discover/why-cheri/cheri-and-rust/) provides the broader architectural context.

## Where next
{: .where-next-title }

### [CheriBSD](/software/cheribsd/)
{: .where-next-card-title }





[CheriBSD provides a complete application-class environment for CHERI software and language work.](/software/cheribsd/)
{: .where-next-summary }



[Continue](/software/cheribsd/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [LLVM &amp; Clang](/software/llvm-and-clang/)
{: .related-pages-item-title }





[The compiler infrastructure underlying current Rust and CHERI target work.](/software/llvm-and-clang/)
{: .related-pages-item-summary }



[Read this page](/software/llvm-and-clang/)
{: .source-card-label }





### [CHERI and Rust](/discover/why-cheri/cheri-and-rust/)
{: .related-pages-item-title }





[The wider relationship between language safety and architectural capabilities.](/discover/why-cheri/cheri-and-rust/)
{: .related-pages-item-summary }



[Read this page](/discover/why-cheri/cheri-and-rust/)
{: .source-card-label }





### [Rust + CHERI Working Group](/groups/rust-plus-cheri/)
{: .related-pages-item-title }





[Alliance collaboration around Rust toolchains, runtimes, native interfaces, and CHERI platforms.](/groups/rust-plus-cheri/)
{: .related-pages-item-summary }



[Read this page](/groups/rust-plus-cheri/)
{: .source-card-label }
