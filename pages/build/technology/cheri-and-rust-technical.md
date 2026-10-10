---
title: CHERI and Rust - Technical Overview
permalink: /build/technology/cheri-and-rust-technical/
where-next:
  url: /guides/building-secure-software/
  title: How Secure is a Product?
related-pages:
- url: /discover/understand/cheri-and-existing-software/
  description: Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.
  action: Read this page
---

1. Discover
2. Why CHERI
3. CHERI and Rust - Technical Overview
{: .source-breadcrumbs }

# CHERI and Rust - Technical Overview
{: id="page-hero-title" .page-hero-title }

Why it is not CHERI vs Rust, but CHERI and Rust.
{: .page-hero-summary }

Rust and CHERI both aim to reduce memory-safety vulnerabilities, but they do so in fundamentally different ways.

Rust uses a language-based approach. Through ownership, borrowing, lifetimes, and type checking, it prevents many classes of memory-safety error before software is compiled.

CHERI uses a hardware-based approach. It extends the processor architecture with capabilities that carry bounds, permissions, and provenance information, allowing memory accesses to be checked **while software is running**.

Because they operate at different layers, Rust and CHERI are best viewed as **complementary** technologies rather than alternatives. A system can use Rust to prevent vulnerabilities from being introduced and CHERI to constrain memory accesses when software executes.

## CHERI brings security by design
{: id="cheri-brings-security-by-design" }

Even developers taking great care in developing code usually only write a very small part of the end application. Most code comes from operating systems, libraries and drivers developed by third parties, sourced from open-source repositories, or increasingly generated using AI-assisted tools.

![Impossible to control all code](/assets/shared/source-assets/a9f89a0614af-rust-and-cheri.webp){: .image-full }

As we see a surge in software supply chain attacks, with repositories being compromised through malicious contributions, it becomes increasingly difficult to blindly trust these elements. CHERI helps protect your system by isolating various elements in compartments, and operating systems can even be optimised for CHERI. This is the work we do in the related working groups ([Linux](/groups/cheri-linux-working-group/), [FreeRTOS](/groups/cheri-freertos/), [Zephyr](/groups/cheri-zephyr/), [seL4](/groups/cheri-for-sel4/)… but also that commercial vendors do, e.g. VxWorks by [Wind River](/organisations/wind-river/).

In particular, CHERIoT builds on CHERI with a rich compartmentalisation model that makes least-privilege isolation practical for embedded and IoT software.

## Rust and CHERI: side by side
{: id="rust-and-cheri-side-by-side" }

**Legend:** ● Covered, ○ Partial, blank = Not covered

| Property | Rust | CHERI | Rust + CHERI | Notes |
| --- | --- | --- | --- | --- |
| **Spatial memory safety** |  |  |  |  |
| Buffer overflow prevention | ○ | ● | ● | Only in safe Rust, via bounds checks on slices; CHERI uses hardware capability bounds on every pointer. |
| Out-of-bounds read | ○ | ● | ● | This is caught in safe Rust; CHERI also catches it in inline assembly and FFI code. |
| Bounds on heap allocations | ○ | ● | ● | Rust checks bounds only in safe code; CHERI tags every allocation with hardware bounds regardless of language. |
| Pointer-integer confusion | ○ | ● | ● | CHERI capabilities cannot be forged from integers: a hardware tag bit enforces this. Rust’s type system allows raw pointer casts via `unsafe`. |
| Pointer provenance enforcement | ○ | ● | ● | Safe Rust tracks provenance conceptually; CHERI enforces it in silicon, with no capability without derivation from a valid source. |
| **Temporal memory safety** |  |  |  |  |
| Use-after-free prevention | ● | ○ | ● | Rust’s ownership model statically prevents this in safe code. CHERI provides use-after-free protection with capability revocation. |
| Dangling pointer prevention | ● | ○ | ● | Rust’s borrow checker statically prevents dangling pointers; CHERI requires revocation support for equivalent temporal safety. |
| Double-free prevention | ● | ● | ● | Rust’s ownership enforces single deallocation; handled by the CHERI memory allocator. |
| Memory leak prevention | ○ |  | ○ | Rust reduces accidental memory leaks but does not eliminate them entirely. Programmer care or dedicated tooling is still required. |
| **Type and value safety** |  |  |  |  |
| Type confusion between same-size structures | ● |  | ● | Rust’s type system distinguishes structures of the same size; CHERI only tracks bounds and provenance. |
| Data race prevention | ● | ○ | ● | Rust’s `Send` and `Sync` traits enforce thread safety at compile time. CHERI has no concurrency model, but guarantees relaxed atomicity for all pointer loads and stores. |
| Uninitialised reads and arithmetic errors | ● |  | ● | Rust requires initialisation before use and panics on integer overflow in debug builds; these issues are outside CHERI’s scope. |
| **Isolation and compartmentalisation** |  |  |  |  |
| Cross-component memory isolation |  | ● | ● | CHERI compartmentalisation enforces that objects in one compartment cannot be accessed by another. Rust has no equivalent at the process or component boundary. |
| Prevent C/C++ code from corrupting Rust objects |  | ● | ● | Without CHERI, a bug in linked C code can corrupt any Rust object in the same process. CHERI enforces bounds on all code in a compartment, regardless of language. |
| Supply-chain isolation |  | ● | ● | CHERI provides tools for building compartments that isolate third-party or malicious library code. |
| Least-privilege enforcement |  | ● | ● | CHERI capabilities are monotonically non-increasing: a component can delegate only a subset of its own permissions. |
| **Coverage and scope** |  |  |  |  |
| Protects `unsafe` Rust blocks |  | ● | ● | Although tools can help, Rust waives its own guarantees in `unsafe` blocks. CHERI hardware checks continue to apply. |
| Protects assembly and non-Rust code |  | ● | ● | CHERI hardware protects all code, including inline assembly, operating-system kernels, and bootloaders that Rust cannot cover. |
| No compiler trust required |  | ● | ● | Rust’s guarantees depend on compiler correctness. CHERI enforces its properties in silicon, so a buggy or malicious compiler cannot bypass hardware capabilities. |
| Reuse existing software |  | ● | ● | Rust requires a complete code rewrite. CHERI requires recompilation and correction of a small number of issues. |
| Works on existing hardware | ● |  |  | Rust requires only compiler support. CHERI requires hardware support. |
| **Developer experience and adoption** |  |  |  |  |
| Zero runtime overhead for safe code | ● | ● | ● | Safe Rust has near-zero overhead. CHERI shows less than 3% overhead, while runtime protection can enable further optimisation at the same security level. |
| Protects legacy codebases without rewriting |  | ● | ○ | CHERI requires only recompilation of most C/C++ code. Rust requires a full rewrite. |
| Capability sealing and object authority |  | ● | ● | CHERI supports sealing capabilities so they can be held but not dereferenced except by the designated unsealer, enabling secure object references and cross-compartment handles. |
| Embedded and bare-metal support | ● | ● | ● | Both support embedded systems without an operating system. |

## What safe Rust provides
{: id="what-safe-rust-provides" }

Rust’s ownership and borrowing rules let the compiler check how references are created and used. In safe Rust, these rules prevent many problems including use-after-free, invalid aliasing, null dereferences, and data races.

The checks happen mainly at compile time, so safe Rust normally avoids the runtime cost associated with garbage collection or pervasive bounds metadata. Arrays and slices still use runtime bounds checks where needed.

This makes Rust a strong choice for new systems code when its platform and library ecosystem meet the project’s needs.

## Where the language boundary ends
{: id="where-the-language-boundary-ends" }

Rust permits `unsafe` code because some low-level operations cannot be expressed or verified through the safe subset. An `unsafe` block may dereference a raw pointer, access hardware registers, call a C interface, or implement a data structure that presents a safe application programming interface (API).

`unsafe` does not disable the compiler or mean that anything is allowed. It means the programmer is responsible for upholding additional rules that the compiler cannot check. A mistake can still cause memory corruption.

Safe Rust may also depend on:

- an operating-system kernel written largely in C
- a memory allocator containing unsafe code
- C or C++ libraries reached through a foreign-function interface
- firmware and drivers outside the Rust component
- a compiler and runtime that form part of the trusted computing base

The whole system is only as well protected as these boundaries allow.

## What CHERI adds
{: id="what-cheri-adds" }

CHERI checks memory authority in hardware when an access occurs. A raw pointer represented by a capability can still be constrained by bounds, permissions, and validity. This can turn some mistakes in unsafe Rust or native code into precise faults instead of unrestricted memory corruption.

CHERI also supports compartmentalisation. Two memory-safe components may each be correct in isolation but should not necessarily have access to each other’s secrets or services. Capabilities can express the minimum authority passed across that boundary.

This creates complementary layers:

- **Safe Rust** prevents many invalid programs through language rules.
- **CHERI memory protection** enforces bounds and permissions on capability-based access.
- **CHERI compartmentalisation** limits authority between components, including components that are working as designed.
- **Testing and assurance** find logic errors and check that the intended policy is implemented.

## Important limits
{: id="important-limits" }

CHERI does not automatically validate all Rust safety assumptions. Compiler support, application binary interface (ABI) design, standard-library support, and the handling of pointer metadata all matter. A capability with broad bounds can still authorise broad access, and a component given a powerful service capability can legitimately misuse it.

Likewise, Rust does not automatically provide least privilege between all components. A memory-safe program can still contain a logic flaw or expose more authority than intended.

Rust support varies across CHERI platforms and continues to evolve. Check the [Rust software ecosystem page](/software/rust/) and the documentation for the chosen target before planning a production migration.

## Key takeaways
{: id="key-takeaways" }

- Prefer safe Rust for new code where practical.
- Keep `unsafe` code small, documented, and tested.
- Use CHERI to strengthen native boundaries and constrain low-level pointer use.
- Use compartments when components should not share the same authority.
- Assess the complete hardware and software stack rather than relying on a language label alone.

## Where next
{: .where-next-title }

### [How Secure is a Product?](/guides/building-secure-software/)
{: .where-next-card-title }





[Assess a CHERI system by its software mode, protected assets, authority boundaries, and supporting evidence.](/guides/building-secure-software/)
{: .where-next-summary }



[Continue](/guides/building-secure-software/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CHERI and Existing Software](/discover/understand/cheri-and-existing-software/)
{: .related-pages-item-title }





[Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.](/discover/understand/cheri-and-existing-software/)
{: .related-pages-item-summary }



[Read this page](/discover/understand/cheri-and-existing-software/)
{: .source-card-label }
