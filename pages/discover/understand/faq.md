---
title: FAQ
permalink: /discover/understand/faq/
where-next:
  url: /adopt/business-case/cost-of-memory-unsafety/
  title: Cost of Memory Unsafety
related-pages:
- url: /discover/why-cheri/vulnerabilities-in-everyday-technology/
  description: Why CHERI is important.
  action: Read this page
- url: /discover/resources/glossary/
  description: This glossary provides plain-language, product-oriented explanations of common CHERI concepts. More
    detailed technical definitions can be found in the Build section.
  action: Read this page
- url: /guides/technical-faq/
  description: Addresses more technical questions.
  action: Read this page
summary: Clear answers to common questions about CHERI and the CHERI Alliance.
---

If you are looking for a more technical FAQ, please go to [Technical FAQ](/guides/technical-faq/)

## Why is CHERI important?
{: id="why-is-cheri-important" }

Memory-safety vulnerabilities are a leading cause of software security issues. CHERI helps **prevent** them while enabling continued use of existing languages, software, and development practices.

## What does CHERI stand for?
{: id="what-does-cheri-stand-for" }

CHERI stands for **Capability Hardware Enhanced RISC Instructions**. The name refers to architectural extensions that let processors use hardware-protected *capabilities* for memory access and software compartmentalisation.

CHERI technology can be applied to any type of processor (CPU, GPU, DSP, NPU…), using any instruction set (x86, Arm, RISC-V, …). Put simply, CHERI uses **hardware to protect software**.

## Is it free to use?
{: id="is-it-free-to-use" }

Yes. CHERI is an **open** technology that can be implemented in products without paying licence fees. However, CHERI-based products and services may still be commercial products offered by companies in the ecosystem.

## How does CHERI help with the Cyber Resilience Act (CRA)?
{: id="how-does-cheri-help-with-the-cyber-resilience-act-cra" }

The CRA encourages manufacturers to reduce memory-safety risks and adopt secure-by-design practices. CHERI provides hardware-enforced protection against many classes of memory vulnerability and is recognised by ETSI TS 104 198 as a key technology for achieving the highest levels of memory-safety assurance.

## Do we have to rewrite existing software?
{: id="do-we-have-to-rewrite-existing-software" }

No. Most software can be ported with relatively small changes rather than rewritten. User applications often need little or no modification, while operating systems, drivers, and other low-level software may require more porting effort. Even then, the changes are typically limited to a small fraction of the codebase, often well below 1% of the codebase. See [CHERI and Existing Software](/discover/understand/cheri-and-existing-software/).

## Is there a performance cost?
{: id="is-there-a-performance-cost" }

Performance depends on the application and platform. In many cases, CHERI delivers significant security benefits with little or no overhead. Some applications can even run **faster** by using CHERI’s hardware capabilities instead of software-based protection mechanisms.

## Does CHERI guarantee memory safety?
{: id="does-cheri-guarantee-memory-safety" }

CHERI provides some of the strongest hardware-enforced memory-safety protections available today, but achieving comprehensive memory safety also depends on software and system design. The **ETSI TS 104 198** standard defines different levels of memory-safety assurance and identifies CHERI as a key technology for achieving the highest levels.

To benefit from CHERI’s hardware-enforced protection, software must be designed or adapted for CHERI. Existing applications can still run on CHERI-enabled hardware, but they gain the full memory-safety benefits only when compiled for CHERI.

## Can CHERI make C and C++ memory safe?
{: id="can-cheri-make-c-and-c-memory-safe" }

Once adapted and recompiled for CHERI, the technology can enforce strong pointer bounds and permissions for C and C++ code. That blocks many behaviours that conventional C and C++ systems allow at runtime, which are often the source of security vulnerabilities and software failures.

## Is CHERI a replacement for Rust?
{: id="is-cheri-a-replacement-for-rust" }

No. Rust prevents many errors through language rules. CHERI can enforce memory safety in hardware to protect unsafe Rust, native libraries, operating systems, and compartment boundaries. The two approaches can reinforce each other. See [CHERI and Rust](/discover/why-cheri/cheri-and-rust/).

## What is compartmentalisation?
{: id="what-is-compartmentalisation" }

Compartmentalisation divides software into isolated components. If one of them is compromised, an attacker cannot automatically access everything else in the application or device, limiting what hackers call “lateral movement” and “escalation of privileges”.

Unlike traditional isolation mechanisms, which often have a handful of compartments, CHERI can enforce very large numbers of fine-grained hardware-protected compartments with low overhead.

## Is CHERI ready for commercial use?
{: id="is-cheri-ready-for-commercial-use" }

Yes. CHERI has moved beyond research and is already available in commercial products, processor IP, software platforms, and development tools. A growing ecosystem is making CHERI increasingly accessible for real-world deployment. The CHERI Alliance is here to accelerate this evolution.

## What does the CHERI Alliance do?
{: id="what-does-the-cheri-alliance-do" }

The CHERI Alliance brings together industry, government, and research organisations to accelerate the adoption of CHERI. It supports technical collaboration, open-source development, certification, education, standards, and technical alignment. It also promotes and protects the CHERI brand, helping users identify trusted technologies, products, and initiatives across the ecosystem.

## What does **CHERI Enabled** mean?
{: id="what-does-cheri-enabled-mean" }

**CHERI Enabled** is a CHERI Alliance certification programme that recognises products that meet defined implementation criteria. It provides assurance that CHERI principles have been properly applied to a specific product version, but does not guarantee the overall security of the product. See [About CHERI Enabled](/adopt/assurance-and-adoption/about-cheri-enabled/).
