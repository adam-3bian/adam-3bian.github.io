---
title: Approaches to Memory Safety
permalink: /discover/why-cheri/approaches-to-memory-safety/
where-next:
  url: /discover/understand/cheri-and-existing-software/
related-pages:
- url: /discover/why-cheri/why-existing-defences-are-not-enough/
  description: Security decisions rarely involve choosing one technology and rejecting everything else. Most products use multiple security measures because different controls protect against different types of risk.
  action: Read this page
---

1. Discover
2. Why CHERI
3. Approaches to Memory Safety
{: .source-breadcrumbs }

# Approaches to Memory Safety
{: id="page-hero-title" .page-hero-title }

No single technology delivers memory safety. The strongest solutions combine processes, tools, hardware protections, and isolation.
{: .page-hero-summary }

Memory safety is not delivered by any single technology. From memory-safe languages and development tools to hardware protections and compartmentalisation, effective solutions combine multiple layers to match the needs of different systems, from tiny embedded devices to large legacy platforms.

## Build safer software
{: id="build-safer-software" }

### Memory-safe programming languages
{: id="memory-safe-programming-languages" }

Languages such as Rust, Java, C\#, Go, and Swift prevent or control many unsafe memory operations. For new software, they are often one of the most effective ways to reduce memory-safety vulnerabilities.

Practical considerations include migration cost, hardware support, library availability, and interaction with existing C and C++ code. Some low-level operations still require `unsafe code` that must be reviewed carefully.

### Safer C and C++ practices
{: id="safer-c-and-c-practices" }

C and C++ do not provide the memory-safety protections found in newer languages. Risk can be reduced through safer coding practices, restricted language subsets, stronger type systems, bounds-aware interfaces, safer libraries, and modern compiler checks.

However, many systems depend on large, long-lived codebases that cannot realistically be rewritten. These measures primarily improve new or updated code, making adoption gradual and leaving existing vulnerabilities to be addressed over time or by additional protections.

## Find vulnerabilities earlier
{: id="find-vulnerabilities-earlier" }

Tools exist to help developpers finding bugs and improving code quality:

- Static analysers inspect source or compiled code without running it.
- Dynamic tools, such as sanitizers, observe a running program and detect invalid behaviour.
- Fuzzers repeatedly provide unusual inputs to find paths that ordinary tests miss.

These tools help uncover many vulnerabilities, but no tool can find every possible bug.

## Limit the impact
{: id="limit-the-impact" }

### Runtime mitigation
{: id="runtime-mitigation" }

Techniques such as address-space layout randomisation (ASLR), non-executable memory, stack protection, control-flow integrity, and hardened allocators make attacks more difficult and increase the effort required to exploit vulnerabilities.

These protections provide valuable defence in depth, but they do not remove the underlying vulnerability and often come with performance or resource overheads.

### Isolation and compartmentalisation
{: id="isolation-and-compartmentalisation" }

Processes, virtual machines, language sandboxes, and hardware protection domains separate components. If one component is compromised, isolation can stop it reaching the rest of the system.

Smaller compartments can significantly reduce the impact of vulnerabilities, but conventional isolation mechanisms often carry substantial performance and implementation overheads. This can make fine-grained compartmentalisation impractical in many systems.

## CHERI hardware-enforced protection
{: id="cheri-hardware-enforced-protection" }

CHERI extends processor architectures with hardware-protected **capabilities**. These capabilities act as unforgeable tokens of authority, allowing software to access only the memory and resources it has been explicitly granted.

This enables two powerful forms of protection:

- **Fine-grained memory protection.** Pointers can be bounded to objects and restricted to permitted operations.
- **Scalable compartmentalisation.** Software components can be given only the permissions they need, helping contain faults and reduce the impact of compromise

Unlike many approaches, CHERI can strengthen existing C and C++ software without requiring every component to be rewritten. It can also provide a stronger foundation beneath memory-safe languages and their runtimes.

## A layered approach to memory safety
{: id="a-layered-approach-to-memory-safety" }

No single technology delivers memory safety on its own. In fact, the ETSI TS 104 198 Memory Safety standard recognises a range of complementary approaches, from secure development practices and analysis tools to memory-safe languages, hardware protections, and compartmentalisation.

The strongest solutions combine multiple layers. Memory-safe languages help prevent vulnerabilities, testing tools help find them, and CHERI adds efficient hardware-enforced rutime protection and fine-grained compartmentalisation. Together, they provide stronger assurance than any single approach alone.

## Key takeaways
{: id="key-takeaways" }

- No single technology or language delivers memory safety.
- Combining prevention, detection, and containment provide stronger assurance.
- Limiting authority limits risk.
- CHERI enables efficient hardware-enforced protection and compartmentalisation.

See [CHERI and Rust](/discover/why-cheri/cheri-and-rust/) for a closer look at how language and hardware safety can work together.

## Where next
{: .where-next-title }

### [CHERI and Existing Software](/discover/understand/cheri-and-existing-software/)
{: .where-next-card-title }





[Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.](/discover/understand/cheri-and-existing-software/)
{: .where-next-summary }



[Continue](/discover/understand/cheri-and-existing-software/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Why Existing Defences Are Not Enough](/discover/why-cheri/why-existing-defences-are-not-enough/)
{: .related-pages-item-title }





[Security decisions rarely involve choosing one technology and rejecting everything else. Most products use multiple security measures because different controls protect against different types of risk.](/discover/why-cheri/why-existing-defences-are-not-enough/)
{: .related-pages-item-summary }



[Read this page](/discover/why-cheri/why-existing-defences-are-not-enough/)
{: .source-card-label }
