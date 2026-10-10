---
title: Port Existing Software
where-next:
  url: /guides/build-compartments/
related-pages:
- url: /guides/choose-a-platform/
  title: Choose a Platform
  description: Choose a platform, prepare an environment and run a first CHERI workload.
  action: Read this page
---

1. Build
2. Developers
3. Port Existing Software
{: .source-breadcrumbs }

# Port Existing Software
{: id="page-hero-title" .page-hero-title }

Port existing software by making pointer assumptions explicit, preserving capability metadata, and testing each interface on the intended platform.
{: .page-hero-summary }

Most well-structured C and C++ code does not need a redesign for CHERI. The difficult parts are usually places where a program has hidden the difference between an address, a pointer, an object boundary, and an authority decision.

A good port makes those assumptions visible and fixes their root cause. Suppressing the warning or widening every bound may restore execution while discarding the security benefit.

## Establish a baseline
{: id="establish-a-baseline" }

Before changing source code:

1. Select the architecture, operating system, and application binary interface (ABI).
2. Build and test the unmodified software on its conventional target.
3. Record test coverage, representative inputs, performance, and memory use.
4. Pin the CHERI software development kit (SDK) and target revisions.
5. Build dependencies through the same ABI and target system headers and libraries, known as a sysroot.

Start with a small leaf library or command-line component. A narrow target makes compiler diagnostics and runtime faults easier to understand.

## Common porting issues
{: id="common-porting-issues" }

### Pointer and integer conversions
{: id="pointer-and-integer-conversions" }

Code sometimes stores a pointer in an integer, modifies its low bits, or serialises it directly:

~~~
unsigned long saved = (unsigned long)pointer;
~~~

On CHERI, an address alone does not contain the capability’s bounds, permissions, provenance, or tag. Use pointer types for pointers. Where the platform supports a documented address conversion, use `uintptr_t` and keep the original capability needed to derive valid authority.

Converting an integer back to a pointer does not, by itself, create a valid capability.

### Pointer size and layout
{: id="pointer-size-and-layout" }

Pure-capability pointers may be larger than conventional pointers. Review:

- packed structures and unions
- hard-coded `sizeof(void *)` assumptions
- binary file and network formats
- variadic arguments
- foreign-function interfaces
- alignment calculations

Store an index, offset, or validated protocol identifier in a persistent or wire format rather than a live in-memory pointer.

### Bounds and object intent
{: id="bounds-and-object-intent" }

CHERI may expose code that deliberately walks from one object into another, derives a container pointer from a member, or expects an allocator to return wider storage than requested.

Decide what the object really is. If several fields form one allocation, retain a capability for the enclosing allocation and derive bounded field capabilities from it. Avoid solving every fault by granting access to the whole address space.

### Custom allocators
{: id="custom-allocators" }

An allocator must return capabilities with useful bounds and preserve tags when storing metadata. It may also participate in temporal-safety mechanisms. Prefer the platform allocator first, then port a custom allocator using the architecture and operating-system guidance.

### Copying capability-containing memory
{: id="copying-capability-containing-memory" }

Capabilities have protected tags outside the ordinary byte representation. Byte copies through supported memory operations can preserve tagged values when alignment and size requirements are met, but writing arbitrary bytes cannot forge a tag.

Review custom `memcpy`, compression, encryption, shared-memory, and device-transfer code. A capability is meaningful only within a suitable address-space and authority context, so it should not be treated as portable serialised data.

### Inline assembly and low-level interfaces
{: id="inline-assembly-and-low-level-interfaces" }

Inline assembly must use the correct capability registers, constraints, calling convention, and clobber list. Isolate it behind a small, tested interface. Prefer compiler intrinsics or maintained platform code where available.

## Use diagnostics as evidence
{: id="use-diagnostics-as-evidence" }

Classify each warning or fault:

- **Pointer truncated into an integer:** Retain a pointer or capability type.
- **ABI mismatch:** Rebuild the library for the same target and application binary interface.
- **Out-of-bounds access:** Correct the object model or derive bounds from the enclosing allocation.
- **Missing permission:** Pass a capability with the minimum permission the operation needs.
- **Invalid tag:** Avoid reconstructing capabilities from raw bytes or integers.
- **Stale reference:** Use the platform’s lifetime and revocation mechanism.

Keep this log with the port. It helps reviewers distinguish compatibility changes from changes that alter the security model.

## Test the protection, not only the happy path
{: id="test-the-protection-not-only-the-happy-path" }

Run existing unit and integration tests, then add cases for:

- minimum and maximum object sizes
- malformed lengths and offsets
- null and empty inputs
- integer overflow in size calculations
- objects crossing interface boundaries
- concurrent lifetime changes
- compartment calls with missing or excessive authority

Use fuzzing and sanitizers where supported. CHERI faults can make invalid accesses easier to locate, while sanitizers may still find undefined behaviour before it becomes a capability violation.

## Measure before and after
{: id="measure-before-and-after" }

Record binary size, peak memory, build time, runtime, fault behaviour, and source changes. Compare like with like: same workload, optimisation level, operating-system configuration, and hardware or simulator.

The output of a port should be more than a compiling binary. It should include the resolved assumptions, remaining limitations, and evidence that the selected protection mode is active.

## Where next
{: .where-next-title }

### [Build Compartments](/guides/build-compartments/)
{: .where-next-card-title }





[A compartment is a security domain with deliberately limited authority.](/guides/build-compartments/)
{: .where-next-summary }



[Continue](/guides/build-compartments/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Choose a platform, prepare an environment and run a first CHERI workload.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
