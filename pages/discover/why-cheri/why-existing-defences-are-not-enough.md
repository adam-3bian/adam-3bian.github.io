---
title: Why Existing Defences Are Not Enough
permalink: /discover/why-cheri/why-existing-defences-are-not-enough/
where-next:
  url: /discover/why-cheri/approaches-to-memory-safety/
related-pages:
- url: /discover/why-cheri/vulnerabilities-in-everyday-technology/
  description: See how a memory mistake in a connected product can put private information, device control, and
    wider networks at risk.
  action: Read this page
summary: Passwords, encryption, testing, and updates reduce risk, but memory vulnerabilities can still remain.
---

Passwords, encryption, testing, and updates all improve security. They help prevent attacks, protect data, find defects, and fix known vulnerabilities. But they cannot guarantee that software will always handle memory safely.

A connected device may have strong passwords, encrypted communications, regular updates, and still contain a memory-safety vulnerability. This does not mean those protections have failed. It means they address different parts of the problem.

## Different protections solve different problems
{: id="different-protections-solve-different-problems" }

- **Passwords and authentication** control who can connect.
- **Encryption** protects data while it travels.
- **Firewalls** limit which network traffic can reach a device.
- **Testing and code review** find many defects before release.
- **Updates** fix flaws and vulnerabilities after they are discovered.
- **Isolation and sandboxes** can restrict what compromised software can access.

These layers are important, and should certainly be used in products, but a memory vulnerability can still remain.

## Testing and updates have limits
{: id="testing-and-updates-have-limits" }

Modern connected devices are complex. They may combine operating systems, networking software, drivers, libraries, and application code from multiple suppliers.

Testing finds many problems, but it cannot explore every possible input or execution path. Updates fix known vulnerabilities, but only **after** they have been discovered, understood, repaired, and deployed.

As a result, some vulnerabilities may remain in a product despite good engineering practices.

## One vulnerable component can expose more than it should
{: id="one-vulnerable-component-can-expose-more-than-it-should" }

Consider a smart building controller. A service that reads temperature sensor messages may share memory with network credentials, configuration, and commands for other equipment, potentially allowing an attacker to interfere with lifts, doors, or other connected devices.

There is often a gap between the access a component needs and the one it actually has. This is especially challenging for connected devices, where processing power and memory are often limited.

## What CHERI adds
{: id="what-cheri-adds" }

CHERI helps processors enforce more precise boundaries around software.

Using protected references called **capabilities**, software can specify exactly what memory may be accessed and what actions are allowed. The processor checks those rules whenever the capability is used.

CHERI also supports **much smaller compartments** than are practical in many conventional systems. Even tiny software components can be given only the access they need, including on constrained devices. This helps contain vulnerabilities and reduces the risk that one compromised component exposes the rest of the system

## Stronger layers, not a replacement
{: id="stronger-layers-not-a-replacement" }

CHERI does not replace passwords, encryption, testing, updates, or secure software development. It adds protection underneath them:

- Prevent many forms of invalid memory access.
- Support very small compartments with only the access they need.
- Limit the impact of vulnerabilities that remain in software.

The goal is simple: one software mistake should not be enough to compromise an entire system.

Further reading: [CISA’s case for memory-safe roadmaps](https://www.cisa.gov/case-memory-safe-roadmaps).
