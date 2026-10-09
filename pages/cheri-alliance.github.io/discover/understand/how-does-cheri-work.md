---
title: How does CHERI work?
layout: source-github
permalink: /sources/cheri-alliance.github.io/discover/understand/how-does-cheri-work/
---

1. Discover
2. Understand
3. How does CHERI work?
{: .source-breadcrumbs }

# How does CHERI work?
{: id="page-hero-title" .page-hero-title }

Helping software stay within its boundaries.
{: .page-hero-summary }

At the heart of CHERI is a simple idea: the processor should understand the boundaries **intended** by the developer and prevent software from exceeding them.

## Today’s systems trust software too much
{: id="todays-systems-trust-software-too-much" }

Today’s processors access memory using [pointers](https://cheri-alliance.github.io/discover/resources/glossary/#glossary-p), which represent an address in memory. A pointer is essentially a number managed entirely by software. Memory is largely an open book: software can read, write, or execute wherever a pointer leads it, with few built-in checks on whether that access was actually intended.

If a program contains a bug, a pointer can accidentally (or maliciously) be changed to access memory that it was never supposed to reach.

![Traditional pointers vs capabilities](/assets/shared/source-assets/6b266981fee5-pointer-vs-capability.webp){: .image-full }

## Capabilities: pointers with built-in protection
{: id="capabilities-pointers-with-built-in-protection" }

CHERI enhances processors with a new type of pointer called a [**capability**](https://cheri-alliance.github.io/discover/resources/glossary/#glossary-c). CHERI capabilities contain additional information describing what access a piece of software has been granted, much like an access card controls which areas of a building someone can enter.

In a CHERI system, any part of the memory can only be accessed with a capability, which describes:

- A memory location
- The exact bounds of the memory area that can be accessed
- Permissions such as read, write, or execute
- Additional metadata used by the processor to enforce security rules

Capabilities are checked **every time** memory is accessed.

## Hardware-enforced security
{: id="hardware-enforced-security" }

The processor enforces the rules carried by each capability. Whenever software accesses memory, the processor checks that the operation stays within the capability’s permitted bounds and permissions. Any attempt to exceed those limits is **blocked** before it can affect the system.

By design, software cannot **create** new capabilities from nothing or grant itself additional privileges. New capabilities can only be **derived** from existing ones, and only with the same or fewer permissions.

Protection is built into the hardware rather than relying solely on software checks.

## Compartmentalisation
{: id="compartmentalisation" }

Capabilities can also be used to create secure compartments: isolated parts of a system that have access only to the resources they need. A compartment might be:

- An application
- A library
- A service
- A security-critical function

Each compartment receives its own capabilities and cannot freely access the memory of other compartments. CHERI makes it practical to create and manage **large numbers** of **small** compartments with **very low overhead**. This enables much finer-grained isolation than traditional security approaches, without the important performance penalty.

This approach, known as compartmentalisation, helps contain bugs and security vulnerabilities, preventing problems in one part of a system from affecting everything else. The smaller the compartment, the smaller the impact of a bug or attack.

![Compartmentalisation prevents contagion](/assets/shared/source-assets/ec94c211adbb-compartmentalisation.webp){: .image-full }

## Working with existing software
{: id="working-with-existing-software" }

CHERI was designed to support and reuse existing software. Much of the work required to convert existing software is handled **automatically** by CHERI-aware compilers. When software contains memory-safety issues or relies on ambiguous behaviour, or to add compartmentalisation, some changes may be required, but they are often relatively small compared to the security benefits gained.

Applications, operating systems, libraries, and firmware can be adapted incrementally, allowing organisations to progressively benefit from increased hardware-enforced memory protection and compartmentalisation while continuing to use large amounts of existing code.

## In summary
{: id="in-summary" }

CHERI introduces capabilities, an enhanced form of pointer that carries information about what memory can be accessed and how it can be used. By enforcing these rules in hardware and enabling fine-grained compartmentalisation, CHERI provides a foundation for building more secure and resilient systems.

## Where next
{: .where-next-title }

### [CHERI and Rust - Technical Overview](https://cheri-alliance.github.io/build/technology/cheri-and-rust-technical/)
{: .where-next-card-title }





[Further technical details to understand why CHERI and Rust are complementary.](https://cheri-alliance.github.io/build/technology/cheri-and-rust-technical/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/build/technology/cheri-and-rust-technical/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Bringing CHERI to your product](https://cheri-alliance.github.io/discover/understand/adapt-products/)
{: .related-pages-item-title }





[What needs to change, and what doesn't.](https://cheri-alliance.github.io/discover/understand/adapt-products/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/discover/understand/adapt-products/)
{: .source-card-label }





### [CHERI and Existing Software](https://cheri-alliance.github.io/discover/understand/cheri-and-existing-software/)
{: .related-pages-item-title }





[Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.](https://cheri-alliance.github.io/discover/understand/cheri-and-existing-software/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/discover/understand/cheri-and-existing-software/)
{: .source-card-label }
