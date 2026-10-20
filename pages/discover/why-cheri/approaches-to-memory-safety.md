---
layout: page
title: Approaches to Memory Safety
summary: No single technology delivers memory safety. The strongest solutions combine processes, tools, hardware protections, and isolation.
permalink: /discover/why-cheri/approaches-to-memory-safety/
slug: discover-why-cheri-approaches-to-memory-safety
navigation:
  header:
    category: Discover CHERI
    subcategory: Why CHERI
related:
- type: page
  slug: discover-understand-cheri-and-existing-software
  relation: next_step
- type: page
  slug: discover-why-cheri-why-existing-defences-are-not-enough
  relation: related
---

## Overview

Memory safety is not delivered by any single technology. From memory-safe languages and development tools to hardware protections and compartmentalisation, effective solutions combine multiple layers to match the needs of different systems, from tiny embedded devices to large legacy platforms.

## Build safer software

### Memory-safe programming languages

Languages such as Rust, Java, C\#, Go, and Swift prevent or control many unsafe memory operations. For new software, they are often one of the most effective ways to reduce memory-safety vulnerabilities.

Practical considerations include migration cost, hardware support, library availability, and interaction with existing C and C++ code. Some low-level operations still require `unsafe code` that must be reviewed carefully.

### Safer C and C++ practices

C and C++ do not provide the memory-safety protections found in newer languages. Risk can be reduced through safer coding practices, restricted language subsets, stronger type systems, bounds-aware interfaces, safer libraries, and modern compiler checks.

However, many systems depend on large, long-lived codebases that cannot realistically be rewritten. These measures primarily improve new or updated code, making adoption gradual and leaving existing vulnerabilities to be addressed over time or by additional protections.

## Find vulnerabilities earlier

Tools exist to help developpers finding bugs and improving code quality:

- Static analysers inspect source or compiled code without running it.
- Dynamic tools, such as sanitizers, observe a running program and detect invalid behaviour.
- Fuzzers repeatedly provide unusual inputs to find paths that ordinary tests miss.

These tools help uncover many vulnerabilities, but no tool can find every possible bug.

## Limit the impact

### Runtime mitigation

Techniques such as address-space layout randomisation (ASLR), non-executable memory, stack protection, control-flow integrity, and hardened allocators make attacks more difficult and increase the effort required to exploit vulnerabilities.

These protections provide valuable defence in depth, but they do not remove the underlying vulnerability and often come with performance or resource overheads.

### Isolation and compartmentalisation

Processes, virtual machines, language sandboxes, and hardware protection domains separate components. If one component is compromised, isolation can stop it reaching the rest of the system.

Smaller compartments can significantly reduce the impact of vulnerabilities, but conventional isolation mechanisms often carry substantial performance and implementation overheads. This can make fine-grained compartmentalisation impractical in many systems.

## CHERI hardware-enforced protection

CHERI extends processor architectures with hardware-protected **capabilities**. These capabilities act as unforgeable tokens of authority, allowing software to access only the memory and resources it has been explicitly granted.

This enables two powerful forms of protection:

- **Fine-grained memory protection.** Pointers can be bounded to objects and restricted to permitted operations.
- **Scalable compartmentalisation.** Software components can be given only the permissions they need, helping contain faults and reduce the impact of compromise

Unlike many approaches, CHERI can strengthen existing C and C++ software without requiring every component to be rewritten. It can also provide a stronger foundation beneath memory-safe languages and their runtimes.

## A layered approach to memory safety

No single technology delivers memory safety on its own. In fact, the ETSI TS 104 198 Memory Safety standard recognises a range of complementary approaches, from secure development practices and analysis tools to memory-safe languages, hardware protections, and compartmentalisation.

The strongest solutions combine multiple layers. Memory-safe languages help prevent vulnerabilities, testing tools help find them, and CHERI adds efficient hardware-enforced rutime protection and fine-grained compartmentalisation. Together, they provide stronger assurance than any single approach alone.

## Key takeaways

- No single technology or language delivers memory safety.
- Combining prevention, detection, and containment provide stronger assurance.
- Limiting authority limits risk.
- CHERI enables efficient hardware-enforced protection and compartmentalisation.

See [CHERI and Rust](/discover/why-cheri/cheri-and-rust/) for a closer look at how language and hardware safety can work together.
