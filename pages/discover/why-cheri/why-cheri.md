---
title: Why CHERI?
permalink: /discover/why-cheri/why-cheri/
---

1. Discover
2. Why CHERI
3. Why CHERI?
{: .source-breadcrumbs }

# Why CHERI?
{: id="page-hero-title" .page-hero-title }

Hardware-enforced memory protection for existing and future software.
{: .page-hero-summary }

**Memory-safety vulnerabilities** are responsible for most of today’s serious software security flaws. Reducing them is one of the biggest opportunities to improve cybersecurity, and CHERI was designed to help address this challenge.

## Why memory safety matters
{: id="why-memory-safety-matters" }

Memory-safety vulnerabilities remain one of the biggest challenges in cybersecurity. Attackers routinely exploit software bugs to steal data, take control of systems, bypass security boundaries, and disrupt critical services. See [Vulnerabilities in Everyday Technology](/discover/why-cheri/vulnerabilities-in-everyday-technology/).

The challenge is growing. Security researchers continue to discover large numbers of vulnerabilities every day, and attackers can often weaponise critical flaws within days or even hours of disclosure. Industry studies consistently show that memory-safety issues account for a large proportion of software vulnerabilities. Microsoft, Google, and Mozilla have each reported that **around 70%** of the most serious vulnerabilities they address are memory-safety related, while CISA reached similar conclusions.

CHERI helps processors understand how software is intended to use memory. By carrying developers’ intent and security information alongside pointers, and enforcing it in hardware, CHERI can prevent many invalid memory accesses and help contain compromised software.

As recognised by the ETSI TS 104 198 standard, the strongest solutions combine multiple approaches. CHERI strengthens the hardware foundation, while secure development practices, testing tools, and compartmentalisation contribute additional layers of protection. Learn more in [Approaches to Memory Safety](/discover/why-cheri/approaches-to-memory-safety/).

## Hardware-enforced memory protection
{: id="hardware-enforced-memory-protection" }

Memory-safety vulnerabilities often arise because conventional processors use [pointers](/discover/resources/glossary/#glossary-p) that store only a memory address. When software reads, writes, or executes data, the processor typically has little information about the boundaries, permissions, or intended use of that memory.

As a result, software bugs can lead to out-of-bounds accesses, accidental modification of unrelated data, or the use of memory in unintended ways. These mistakes can become serious security vulnerabilities.

On a CHERI system, software uses a [Capability](/discover/resources/glossary/#glossary-c) instead of an unprotected address. A capability contains an address together with metadata such as:

- the range of memory it may access
- whether it may read, write, or execute
- whether it is valid for use
- information about where its permissions came from

The metadata is protected by the hardware. Software can reduce the authority of a capability, for example by narrowing its bounds or removing write permission, but cannot invent greater authority.

When a program uses a capability, the processor checks the access. An out-of-bounds write or a write through a read-only capability faults instantly instead of silently changing unrelated memory.

## Protect existing software
{: id="protect-existing-software" }

Many organisations rely on large C and C++ codebases that cannot realistically be rewritten.

CHERI was designed with this reality in mind. Compilers can represent pointers as capabilities and generate code that takes advantage of CHERI’s hardware protections. This allows organisations to improve memory protection on existing software without having to rewrite everything.

Porting still requires some minor engineering effort. Some ambiguous or especially unsafe code may need to be updated, as explained in [CHERI and Existing Software](/discover/understand/cheri-and-existing-software/).

CHERI also supports both **hybrid** environments, where conventional pointers and capabilities coexist, and **pure-capability** environments, where language-visible pointers use capabilities throughout. This gives organisations multiple migration paths.

## Limit the impact of compromise
{: id="limit-the-impact-of-compromise" }

Preventing vulnerabilities is important, but limiting their impact is equally valuable.

CHERI makes it possible to divide software into smaller, isolated components. Each component receives capabilities that grant access only to the data and resources it needs to do its job.

For example, a component that processes images or videos might be given access only to the file it is currently handling, with no access to passwords, encryption keys, or other sensitive information elsewhere in the system. If that component is compromised, the attacker gains access only to its limited resources rather than the entire device or application.

This applies the **principle of least privilege**: software should receive only the access it genuinely needs. By making this practical even for very small software components, and enforcing this in hardware, CHERI helps organisations build more resilient and secure products.

## Make faults easier to find and fix
{: id="make-faults-easier-to-find-and-fix" }

On conventional hardware, an invalid pointer may corrupt memory and cause failures much later, making problems difficult to diagnose.

CHERI checks accesses at the point they occur. When software violates capability bounds or permissions, the processor can stop the operation immediately and generate a fault.

This can make defects easier to reproduce, investigate, and correct.

The same behaviour can also support assurance activities by providing evidence about compartment boundaries, capability usage, compiler behaviour, and fault handling. As with any assurance approach, that evidence must be interpreted within the context of a particular implementation, build, and threat model.

## Understanding CHERI’s scope
{: id="understanding-cheris-scope" }

CHERI is a powerful security technology, but it is not a complete security solution on its own.

CHERI does not make a system automatically secure. It does not prevent logic errors, weak authentication, insecure configuration, social engineering, or every side-channel attack. In some environments, additional mechanisms may also be required to address certain forms of temporal memory safety, such as preventing the reuse of capabilities after memory has been freed.

Adopting CHERI requires a one-time investment in new hardware, migration, tooling, testing, and training. Once that transition is complete, organisations gain the ongoing benefits of hardware-enforced memory protection without needing to continually redesign software to address the same classes of memory-safety vulnerabilities.

## Why organisations choose CHERI
{: id="why-organisations-choose-cheri" }

Teams commonly investigate CHERI to:

- Protect existing C and C++ software without a full rewrite
- Enable practical fine-grained compartmentalisation and least privilege
- Prevent many classes of memory-safety vulnerability in hardware
- Reduce reliance on layers of probabilistic mitigations
- Preserve investment in long-lived software assets
- Improve fault visibility, testing, and assurance
- Build more resilient systems from the processor upwards

## Where next
{: .where-next-title }

### [Vulnerabilities in Everyday Technology](/discover/why-cheri/vulnerabilities-in-everyday-technology/)
{: .where-next-card-title }





[A memory mistake in a connected device can expose private information, change how the device behaves, or provide a way into a wider network.](/discover/why-cheri/vulnerabilities-in-everyday-technology/)
{: .where-next-summary }



[Continue](/discover/why-cheri/vulnerabilities-in-everyday-technology/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Why Existing Defences Are Not Enough](/discover/why-cheri/why-existing-defences-are-not-enough/)
{: .related-pages-item-title }





[Passwords, encryption, testing, and updates reduce risk, but memory vulnerabilities can still remain.](/discover/why-cheri/why-existing-defences-are-not-enough/)
{: .related-pages-item-summary }



[Read this page](/discover/why-cheri/why-existing-defences-are-not-enough/)
{: .source-card-label }





### [Approaches to Memory Safety](/discover/why-cheri/approaches-to-memory-safety/)
{: .related-pages-item-title }





[No single technology delivers memory safety. The strongest solutions combine processes, tools, hardware protections, and isolation.](/discover/why-cheri/approaches-to-memory-safety/)
{: .related-pages-item-summary }



[Read this page](/discover/why-cheri/approaches-to-memory-safety/)
{: .source-card-label }
