---
title: Glossary
permalink: /discover/resources/glossary/
---

1. Discover
2. Resources
3. Glossary
{: .source-breadcrumbs }

# Glossary
{: id="page-hero-title" .page-hero-title }

## CHERI glossary
{: id="directory-cheri-glossary" }

Plain-language definitions for CHERI terms, acronyms, architecture concepts, and software models. The alphabet index links directly to each group of entries.

Skip to
[A](/discover/resources/glossary/#glossary-a)
[B](/discover/resources/glossary/#glossary-b)
[C](/discover/resources/glossary/#glossary-c)
[D](/discover/resources/glossary/#glossary-d)
[H](/discover/resources/glossary/#glossary-h)
[I](/discover/resources/glossary/#glossary-i)
[L](/discover/resources/glossary/#glossary-l)
[M](/discover/resources/glossary/#glossary-m)
[N](/discover/resources/glossary/#glossary-n)
[O](/discover/resources/glossary/#glossary-o)
[P](/discover/resources/glossary/#glossary-p)
[R](/discover/resources/glossary/#glossary-r)
[S](/discover/resources/glossary/#glossary-s)
[T](/discover/resources/glossary/#glossary-t)
[U](/discover/resources/glossary/#glossary-u)
{: .glossary-index }

### A
{: id="glossary-a" }

ABI
: Application Binary Interface. The conventions that let compiled code, libraries, and an operating system agree on data layouts, calling conventions, registers, and binary formats.

Ambient authority
: Authority available to code without being passed explicitly. Capability systems seek to reduce ambient authority so that access is tied to specific capabilities.

Authority
: The right to access a resource or perform an operation. A CHERI capability carries authority through its bounds, permissions, validity, and sealing state.

### B
{: id="glossary-b" }

[Bounds](/build/technology/capabilities/)
: The lower and upper limits of the memory region that a capability can address. A memory access outside those limits is rejected by the processor.

Bounds compression
: An encoding technique that represents a capability's bounds compactly alongside its address and other metadata. Some bounds cannot be represented exactly and are rounded to a representable range.

### C
{: id="glossary-c" }

[CHERI](/discover/why-cheri/why-cheri/)
: Capability Hardware Enhanced RISC Instructions. An architectural protection model that adds hardware-supported capabilities to conventional processor architectures.

CHERI C/C++
: C and C++ language and ABI adaptations that represent pointers with CHERI capabilities and expose capability-aware operations where needed.

[CHERIoT](/hardware/cheriot/)
: A CHERI-based hardware-software platform designed for small embedded systems, with memory safety and fine-grained compartments built into its processor and RTOS model.

[Capability](/build/technology/capabilities/)
: A hardware-protected reference that that carries a memory location, the bounds of the memory region, the access rights associated with it, and some other metadata.

Capability fault
: An exception raised when an operation violates a capability rule, such as using an invalid capability, accessing outside its bounds, or attempting an operation without the required permission.

[Capability provenance](/build/technology/provenance/)
: The valid derivation history that connects a capability to existing authority. Integer values cannot simply be converted into usable capabilities with new authority.

Capability register
: A processor register able to hold a complete capability, including its address and protected metadata.

[CheriABI](/build/technology/pure-capability-systems/)
: A pure-capability POSIX process environment developed for CheriBSD in which C and C++ pointers are represented as capabilities.

[CheriBSD](/software/cheribsd/)
: A FreeBSD-derived research operating system used to develop and evaluate CHERI memory protection and compartmentalisation.

[Compartment](/guides/build-compartments/)
: A software component isolated from other components and given only selected access to code, data, devices, or services.

[Compartmentalisation](/build/technology/compartmentalisation/)
: The division of software into isolated components so that a fault or compromise in one component has limited authority over the rest of the system.

Compressed capability
: A capability representation that encodes bounds relative to the current address, allowing capability metadata and a conventional-sized address to fit within a practical in-memory format.

Cursor
: The current address within a capability. It can move within the authority described by the capability but does not itself define the capability's bounds.

### D
{: id="glossary-d" }

Default Data Capability (DDC)
: A capability used by some CHERI execution models as the default authority for data accesses that are not made through an explicit capability register.

Dereference
: Using a pointer or capability to read or write the memory it refers to. CHERI checks validity, bounds, permissions, and other relevant rules when a capability is dereferenced.

### H
{: id="glossary-h" }

Hybrid ABI
: An application binary interface in which conventional pointers remain the default while software can explicitly use capabilities for selected data and interfaces.

### I
{: id="glossary-i" }

Instruction-set architecture (ISA)
: The programmer-visible contract between software and a processor, including instructions, registers, data types, exceptions, and memory behaviour.

### L
{: id="glossary-l" }

Least privilege
: The principle that code should receive only the authority required for its function. Capability bounds and permissions provide mechanisms for expressing narrower authority.

### M
{: id="glossary-m" }

[Memory safety](/discover/why-cheri/approaches-to-memory-safety/)
: Protection against invalid uses of memory, including accesses outside an object's bounds and, where temporal protection is present, accesses after an object's lifetime has ended.

Monotonicity
: The rule that deriving a capability can preserve or reduce its authority but cannot increase it beyond the authority of the source capability.

[Morello](/hardware/morello/)
: Arm's experimental high-performance processor, SoC, and development board implementing an adaptation of CHERI for the Arm architecture.

### N
{: id="glossary-n" }

Non-forgeability
: The property that software cannot create a valid capability with new authority merely by constructing or modifying its bit pattern.

### O
{: id="glossary-o" }

Object capability
: An unforgeable reference that both identifies an object and authorises a defined set of operations on it.

### P
{: id="glossary-p" }

Permission
: A right recorded in a capability, such as permission to load data, store data, or execute code. An operation is rejected when the relevant permission is absent.

Pointer
: A pointer is a value that contains the address of a location in memory. In conventional systems, this is just an integer.

[Pointer provenance](/build/technology/provenance/)
: Information about where a pointer came from and which storage or object it is authorised to reference. CHERI makes valid provenance a hardware-enforced part of pointer use.

Program Counter Capability (PCC)
: The capability that authorises instruction fetch and constrains the region of code that can execute in the current context.

[Pure-capability ABI](/build/technology/pure-capability-systems/)
: An application binary interface in which language-level pointers, code pointers, return addresses, and related runtime structures are represented with capabilities.

### R
{: id="glossary-r" }

[RISC-V](/discover/history/risc-v-and-embedded-development/)
: An open instruction-set architecture. CHERI extensions for RISC-V have been used in research processors, embedded systems, and ongoing standardisation work.

Revocation
: The process of making previously issued capabilities unusable when their authority should no longer apply, such as after memory has been freed or a compartment has been torn down.

### S
{: id="glossary-s" }

Sail
: A language for describing instruction-set architectures formally. CHERI uses Sail models as executable specifications and as inputs to testing and proof tools.

Sealed capability
: A capability placed in a protected sealed state. It cannot be used for ordinary memory access until an authorised mechanism unseals or invokes it.

Sentry capability
: A sealed executable capability used to provide a controlled entry point into code without exposing unrestricted access to the target code capability.

[Spatial memory safety](/build/technology/spatial-memory-safety/)
: Protection against accessing memory outside the intended bounds of an object, allocation, stack frame, or other region.

### T
{: id="glossary-t" }

Tag
: A protected validity bit associated with a capability. Ordinary data operations cannot manufacture a set tag, and operations that corrupt a capability representation clear it.

Tagged memory
: Memory that stores capability validity tags separately from ordinary software-visible data so that the integrity of in-memory capabilities can be enforced.

[Temporal memory safety](/build/technology/temporal-memory-safety/)
: Protection against using memory outside its valid lifetime, including use-after-free and use-after-reallocation errors.

Trusted computing base (TCB)
: The hardware and software that must behave correctly for a system's security properties to hold. Compartmentalisation can reduce the amount of code trusted by any one component.

### U
{: id="glossary-u" }

[Use-after-free](/build/technology/temporal-memory-safety/)
: A temporal memory-safety error in which software accesses an allocation after it has been released and may have been reused for another purpose.

## Where next
{: .where-next-title }

### [FAQs](/discover/understand/faq/)
{: .where-next-card-title }





[Short answers to common questions about CHERI, the Alliance, development, and adoption.](/discover/understand/faq/)
{: .where-next-summary }



[Continue](/discover/understand/faq/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Specifications](/discover/resources/specifications/)
{: .related-pages-item-title }





[A directory of architecture and related specifications relevant to CHERI.](/discover/resources/specifications/)
{: .related-pages-item-summary }



[Read this page](/discover/resources/specifications/)
{: .source-card-label }





### [Digital Security by Design Archive](/discover/resources/digital-security-by-design-archive/)
{: .related-pages-item-title }





[An archive of material from the Digital Security by Design programme relevant to CHERI.](/discover/resources/digital-security-by-design-archive/)
{: .related-pages-item-summary }



[Read this page](/discover/resources/digital-security-by-design-archive/)
{: .source-card-label }
