---
title: Technical FAQ
where-next:
  url: /build/technology/how-cheri-capabilities-work/
related-pages:
- url: /discover/resources/specifications/
  description: A directory of architecture and related specifications relevant to CHERI.
  action: Read this page
- url: /discover/resources/glossary/
  description: This glossary provides plain-language, product-oriented explanations of common CHERI concepts. More
    detailed technical definitions can be found in the Build section.
  action: Read this page
- url: /guides/choose-a-platform/
  title: Choose a Platform
  description: Choose a platform, prepare an environment and run a first CHERI workload.
  action: Read this page
summary: Clear answers to common technical questions about CHERI.
topic: Reference
---

If you are looking for a high-leval FAQ, please go to [FAQ](/discover/understand/faq/). You can also take a look at the University of Cambridge’s [CHERI FAQ](https://ctsrd-cheri.github.io/cheri-faq/)

## How does CHERI align with ETSI TS 104 198?
{: id="how-does-cheri-align-with-etsi-ts-104-198" }

ETSI TS 104 198 defines a framework for achieving different levels of memory-safety assurance. CHERI is explicitly identified as a technology capable of supporting the highest assurance levels through hardware-enforced memory protection and compartmentalisation.

## Is CHERI a processor or an operating system?
{: id="is-cheri-a-processor-or-an-operating-system" }

Neither. CHERI is a capability architecture that can be incorporated into instruction-set architectures (ISA), processor implementations, operating systems, and software. Examples in the ecosystem include CHERI-RISC-V, Arm Morello, CHERIoT, CheriBSD, and CHERI Linux.

## Do we have to rewrite existing software?
{: id="do-we-have-to-rewrite-existing-software" }

No, but existing code may require some adaptation. Well-structured software often builds with few changes. Common porting work involves pointer-to-integer conversions, custom allocators, packed data structures, inline assembly, and code that deliberately crosses object boundaries. Hybrid and pure-capability modes offer different migration paths. See [CHERI and Existing Software](/discover/understand/cheri-and-existing-software/).

## What is a capability?
{: id="what-is-a-capability" }

A capability is a protected value that identifies something software may access and carries the authority to access it. For memory, it includes an address together with bounds, permissions, and validity metadata. See [Capabilities](/build/technology/how-cheri-capabilities-work/).

## How is a capability different from a conventional pointer?
{: id="how-is-a-capability-different-from-a-conventional-pointer" }

A conventional pointer normally provides an address. The processor has limited knowledge of the object the programmer intended it to reference. A CHERI capability carries enforceable limits, such as the permitted address range and whether access may read, write, or execute.

In typical implementations, e.g. CHERI-RISC-V, capabilities are twice the size of regular pointers.

## Does CHERI make C and C++ memory safe?
{: id="does-cheri-make-c-and-c-memory-safe" }

CHERI-aware compilers and pure-capability application binary interfaces (ABIs) can enforce strong pointer bounds and permissions for adapted C and C++ code. That blocks many behaviours that conventional C and C++ systems allow at runtime. It does not make every C or C++ program correct, and some code must be adapted where it relies on invalid, ambiguous, or implementation-defined pointer behaviour.

## What is the difference between hybrid and pure-capability software?
{: id="what-is-the-difference-between-hybrid-and-pure-capability-software" }

Hybrid software uses conventional pointers alongside explicitly managed capabilities. Pure-capability software represents all language-visible pointers as capabilities throughout the ABI. Hybrid mode supports incremental adoption, while pure-capability mode provides more comprehensive pointer protection.

## Can I try CHERI without hardware?
{: id="can-i-try-cheri-without-hardware" }

Yes. QEMU and formal-model simulators support several CHERI environments. The right route depends on whether you want an application-class CheriBSD environment or an embedded CHERIoT environment. Start with [Run CHERI in Simulation](/guides/run-cheri-in-simulation/).

## What is Morello?
{: id="what-is-morello" }

Morello is an Arm-developed prototype architecture, system-on-chip, and development board designed to evaluate CHERI at application-processor scale. It has supported extensive work on compilers, CheriBSD, Linux, applications, and security evaluation. It is a good platform for development and the CHERI Alliance can help teams get a loan of a Morello board. See [Morello](/hardware/morello/)

## What is CHERIoT?
{: id="what-is-cheriot" }

CHERIoT is a 32-bit CHERI-based hardware-software platform designed for embedded and Internet of Things systems. It combines a CHERI-enabled RISC-V instruction set, processor cores, a compartmentalised real-time operating system, a toolchain, simulators, and development platforms such as Sonata. See [CHERIoT](/hardware/cheriot/)

## What is CheriBSD?
{: id="what-is-cheribsd" }

CheriBSD is FreeBSD adapted for CHERI-RISC-V and Arm Morello. It provides a mature environment for architecture, operating-system, application-porting, and compartmentalisation work. See [CheriBSD](/software/cheribsd/)

## What is CHERI Linux?
{: id="what-is-cheri-linux" }

CHERI Linux is Linux adapted to CHERI systems. The CHERI Alliance Linux Working Group coordinates the porting effort, cross-architecture roadmap, and public repositories. Check current project documentation for supported branches, targets, and maturity. See [CHERI Linux](/software/cheri-linux/)

## What is CHERI-RISC-V?
{: id="what-is-cheri-risc-v" }

CHERI-RISC-V applies CHERI capability concepts to the RISC-V instruction-set architecture. It is used across application-class, embedded, FPGA, simulation, operating-system, and commercial processor work. This is being standardised through RISC-V International.
