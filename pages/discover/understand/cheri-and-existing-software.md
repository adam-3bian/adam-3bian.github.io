---
title: CHERI and Existing Software
permalink: /discover/understand/cheri-and-existing-software/
---

1. Discover
2. Understand
3. CHERI and Existing Software
{: .source-breadcrumbs }

# CHERI and Existing Software
{: id="page-hero-title" .page-hero-title }

Improve the security of existing C and C++ software without starting again.
{: .page-hero-summary }

Rewriting a large software stack is rarely practical. Operating systems, libraries, drivers, middleware, and application code often represent years or decades of engineering investment.

CHERI was designed with this reality in mind. It enables organisations to **strengthen the memory protection of existing software** while adopting new hardware and software capabilities at their own pace.

The amount of work depends on the platform, software architecture, and coding practices already in use, but many projects can begin benefiting from CHERI long before a full migration is complete.

## Choose the level of adoption
{: id="choose-the-level-of-adoption" }

### Conventional software
{: id="conventional-software" }

Existing software can often continue running unchanged on CHERI-enabled platforms. This helps organisations adopt CHERI gradually, although software running in this mode does not benefit from CHERI’s fine-grained memory protection.

### Hybrid software
{: id="hybrid-software" }

Hybrid systems combine conventional software with selected CHERI-protected components. This allows teams to experiment, protect important interfaces, and introduce capabilities gradually. This provides a practical transition path and allows teams to protect their most critical components first.

### Pure-capability code
{: id="pure-capability-code" }

Pure-capability systems use CHERI capabilities throughout the software stack, providing the broadest memory-safety coverage and strongest protection. This typically requires recompiling and adapting software throughout the stack.

## Software that is easiest to port
{: id="software-that-is-easiest-to-port" }

Many well-structured C and C++ projects require few source changes when moved to CHERI. Code is easier to port when it:

- uses pointer types for pointers rather than storing them in integers
- keeps array lengths with the arrays they describe
- uses standard allocation and library interfaces
- avoids relying on object layout outside the language rules
- separates serialised data formats from in-memory pointers

The compiler and runtime can then create capabilities with appropriate permissions and bounds **automatically**.

## Common compatibility issues
{: id="common-compatibility-issues" }

Porting work often reveals software that:

- Treats pointers and integers as interchangeable
- Assumes a fixed pointer size
- Stores memory addresses in files or network messages
- Accesses memory beyond intended object boundaries
- Relies on low-level implementation details of a specific platform

Many of these patterns are already fragile and discouraged by modern coding practices. Porting to CHERI frequently **uncovers hidden bugs**, unsafe assumptions, and memory-safety vulnerabilities that existing testing may never have revealed. CHERI does not introduce these issues; it helps bring them to light.

## What does not change
{: id="what-does-not-change" }

CHERI does not require a new application protocol, user interface, business process, or software architecture.

Teams continue to use familiar languages, compilers, debuggers, test frameworks, package managers, and development workflows. The difference is that the hardware now has enough information to enforce how pointers are intended to be used.

## Where next
{: .where-next-title }

### [CHERI and Rust](/discover/why-cheri/cheri-and-rust/)
{: .where-next-card-title }





[Rust and CHERI address memory safety at different layers.](/discover/why-cheri/cheri-and-rust/)
{: .where-next-summary }



[Continue](/discover/why-cheri/cheri-and-rust/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Why CHERI?](/discover/why-cheri/why-cheri/)
{: .related-pages-item-title }





[Learn how CHERI protects memory in hardware.](/discover/why-cheri/why-cheri/)
{: .related-pages-item-summary }



[Read this page](/discover/why-cheri/why-cheri/)
{: .source-card-label }





### [Approaches to Memory Safety](/discover/why-cheri/approaches-to-memory-safety/)
{: .related-pages-item-title }





[No single technology delivers memory safety. The strongest solutions combine processes, tools, hardware protections, and isolation.](/discover/why-cheri/approaches-to-memory-safety/)
{: .related-pages-item-summary }



[Read this page](/discover/why-cheri/approaches-to-memory-safety/)
{: .source-card-label }
