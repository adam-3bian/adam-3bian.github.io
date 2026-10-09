---
title: The History of CHERI
layout: source
permalink: /sources/cheri-alliance.github.io/discover/understand/cheri-history/
---

1. Discover
2. Understand
3. The History of CHERI
{: .source-breadcrumbs }

# The History of CHERI
{: id="page-hero-title" .page-hero-title }

From capability systems research to a growing ecosystem for memory-safe computing.
{: .page-hero-summary }

CHERI did not appear overnight. It builds on decades of capability-system research and more than fifteen years of collaboration across universities, industry, government programmes, open-source communities, and technology suppliers. Today, CHERI is evolving from a research architecture into a growing ecosystem of products, software, standards, and organisations.

## Capability systems (1960s–1980s)
{: id="capability-systems-1960s1980s" }

Long before CHERI, capability-based computer systems explored how software could receive precise authority instead of unrestricted access to memory. Systems such as Cambridge CAP, Hydra, System 250, and IBM System/38 established principles that remain central today: unforgeable references, least privilege, delegation, and fine-grained protection.

These ideas proved valuable, but they struggled to integrate with the mainstream processors, operating systems, and software ecosystems that emerged around conventional virtual memory.

## Modern CHERI begins (2010)
{: id="modern-cheri-begins-2010" }

In 2010, the [University of Cambridge](https://cheri-alliance.github.io/members/university-of-cambridge/) and [SRI International](https://cheri-alliance.github.io/members/sri/) started the CTSRD project under [DARPA’s CRASH programme](https://www.darpa.mil/research/programs/clean-slate-design-of-resilient-adaptive-secure-hosts). The goal was to revisit capability architectures for modern computing and address one of the root causes of software insecurity: the inability of processors to distinguish a valid software reference from a corrupted one.

From the beginning, CHERI was a complete hardware-software effort involving processors, compilers, operating systems, applications, formal models, and security analysis.

## From research to working systems
{: id="from-research-to-working-systems" }

Rather than remaining a theoretical architecture, CHERI was developed through a series of working implementations.

Early work extended a 64-bit MIPS architecture and used the BERI FPGA platform for experimentation. The ecosystem developed CHERI-aware LLVM and Clang compilers, the CheriBSD operating system, debugging tools, simulators, and substantial software ports.

This period established that capabilities could work with real operating systems and large C and C++ codebases, not just research prototypes.

## DARPA and long-term development
{: id="darpa-and-long-term-development" }

Several DARPA programmes helped mature the technology over time.

CRASH supported the original architecture work. Later programmes including Mission-oriented Resilient Clouds (MRC), SSITH, FETT, and Compartmentalization and Privilege Management expanded CHERI’s hardware support, compartmentalisation mechanisms, formal verification, adversarial testing, and portability.

This continuity allowed researchers to answer successively harder questions: could capabilities work in modern processors, support full software stacks, scale to multiple architectures, and support practical compartmentalisation?

## Morello and Digital Security by Design (2019–2025)
{: id="morello-and-digital-security-by-design-20192025" }

A major milestone came with the UK’s [Digital Security by Design](https://www.ukri.org/what-we-do/browse-our-areas-of-investment-and-support/digital-security-by-design/) (DSbD) programme.

[Arm’s Morello](https://cheri-alliance.github.io/build/platforms/morello/) project developed a CHERI-enabled Arm architecture, processor, development board, and software environment. From 2022 onward, prototype hardware became available to industry, academia, and government users, allowing large-scale evaluation of CHERI concepts in realistic application-processor environments.

Morello helped demonstrate compatibility with large software systems, evaluate performance and migration costs, and provide practical evidence for deployment decisions.

## RISC-V, CHERIoT, and embedded systems
{: id="risc-v-cheriot-and-embedded-systems" }

At the same time, CHERI expanded beyond its original architecture.

Work under DARPA’s SSITH programme brought CHERI to RISC-V, demonstrating that capability protection could be adapted to multiple processor designs. This opened the door to both application-class systems and highly constrained embedded devices.

CHERIoT, developed by **Microsoft**, extended these ideas further, creating a complete embedded hardware-software platform with fine-grained compartments, a real-time operating system, toolchains, formal models, FPGA targets, and commercial silicon.

## From prototypes to products
{: id="from-prototypes-to-products" }

As hardware, software, tools, and expertise matured, CHERI began moving into commercial products.

The ecosystem now includes licensable processor designs, commercial chips, development boards, operating systems, simulators, software-development tools, assurance services, and certified products. The focus shifted from proving that the technology works to helping organisations deploy and evaluate it in practice.

This transition also created the need for certification, technical alignment, ecosystem coordination, and adoption support.

## The CHERI Alliance (2024)
{: id="the-cheri-alliance-2024" }

As the ecosystem continued to grow, a new challenge emerged: coordination.

The [CHERI Alliance](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/) launched in 2024 to bring together processor suppliers, software communities, governments, researchers, standards bodies, and adopters. Its role is not to own CHERI, but to help coordinate adoption, certification, technical alignment, education, ecosystem growth, and collaborative engineering.

The Alliance provides a neutral forum where organisations can collaborate while retaining ownership of their own products and priorities.

## Today and the future
{: id="today-and-the-future" }

CHERI has evolved from a research question into multiple working ecosystems spanning application processors, embedded systems, operating systems, compilers, languages, and commercial products.

Current efforts focus on areas such as standardisation, support in mainstream software projects, certification, compartmentalisation, temporal safety, product deployment, and ecosystem growth. CHERI is increasingly positioned as one part of a broader memory-safety strategy alongside safer programming languages, improved engineering practices, and formal methods.

The story of CHERI is therefore not a single invention, but a continuing effort to make capability-based protection practical for modern computing.

## Where next
{: .where-next-title }

### [Building the ecosystem behind memory-safe computing](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/)
{: .where-next-card-title }





[The CHERI Alliance.](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/)
{: .source-card-label }
