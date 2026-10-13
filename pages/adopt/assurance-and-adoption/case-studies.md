---
title: Case Studies
permalink: /adopt/assurance-and-adoption/case-studies/
summary: Applying CHERI in real products and platforms
image_url: null
updated_date: null
parent: /adopt/
next_page_url: /adopt/assurance-and-adoption/assurance-and-certification/
related:
  pages:
  - /adopt/business-case/the-business-case/
  people: []
  organisations: []
  groups: []
  news: []
  events: []
  papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

# Case Studies

From experimental research systems to commercial processor IP, CHERI has been applied across a growing range of platforms. These case studies illustrate how capability-based protection can be integrated into existing software, embedded devices, and modern processor architectures.

No single project can represent every possible use case. Together, however, these examples demonstrate that capability protection can coexist with substantial software stacks, resource-constrained devices, and existing C and C++ code.

- Project: Morello; Demonstrates: CHERI at application and server scale
- Project: CheriBSD; Demonstrates: Protection of large existing software stacks
- Project: CHERIoT; Demonstrates: CHERI for constrained embedded systems
- Project: Codasip X730; Demonstrates: Commercially application-class CHERI processor

## Morello: a complete experimental stack

![Arm Morello board](/assets/pages/adopt--assurance-and-adoption--case-studies/bfeebb3ac676-morello-board.webp){: .image-left }

The Arm Morello programme demonstrated that CHERI concepts can scale to a modern high-performance 64-bit processor and support real operating systems, toolchains, and applications.

Morello gave research and industry teams a realistic platform for porting operating systems and applications, examining compatibility, and measuring performance. It showed that CHERI could be applied to the most demanding high-performance processors.

Morello remains an experimental platform. Its importance lies in the full-stack evidence and experience it created, not in representing a production Arm architecture.

## CheriBSD: established software at operating-system scale

CheriBSD demonstrates how a large existing operating system (FreeBSD, from the FreeBSD foundation) can be adapted to take advantage of CHERI protection.

This work also showed how to perform a software migration, porting a large C codebase incrementally. The operating-system environment also provides a base for running and studying substantial applications.

This makes CheriBSD relevant to products that depend on mature native software and need evidence about the cost and effect of protecting it.

## CHERIoT: protection for small embedded devices

![CHERIoT processor on a Sonata board](/assets/pages/adopt--assurance-and-adoption--case-studies/645cc3b9a905-sonata-cheriot.webp){: .image-right }

CHERIoT brings CHERI protection to resource-constrained embedded systems and microcontrollers. The CHERIoT platform combines a 32-bit CHERI-RISC-V architecture, processor core, toolchain, and real-time operating system. It is designed around small compartments that do not trust one another and can communicate through controlled interfaces.

CHERIoT shows why CHERI can fit microcontrollers that lack the memory-management hardware used for process isolation on larger systems. It also combines capability protection with mechanisms intended to support temporal memory safety in constrained devices.

The cheriot-ibex core has been certified under the CHERI Enabled programme.

## CHERI in commercial processor products

![Codsaip X730 on FPGA](/assets/pages/adopt--assurance-and-adoption--case-studies/e8738d5ec725-codasip-prime-kit.webp){: .image-left }

Codasip has decided to adopt CHERI throughout its whole line of products. X730-MP4-Lux is the first commercial 64-bit application-class processor implementing CHERI-RISC-V. It has been certified under the CHERI Enabled programme and can run rich operating systems like CheriBSD or Linux.

This demonstrates that CHERI processor technology is available now for commercial system-on-chip designs.

## What these case studies demonstrate

Together, these examples show that CHERI is not limited to a single class of system. CHERI has been applied to the whole spectrum of computing applications:

- From the most constrained embedded devices to traditional application-class and large high-performance systems
- From tiny real-time operating systems to rich multi-user operating systems
- In open-source platforms and commercial processor products
- While reusing substantial existing C and C++ software

While each project has different goals and constraints, all demonstrate how capability protection can be introduced into real hardware and software systems, across the diversity of use cases, while reusing existing software. These examples also demonstrate that CHERI can often be introduced while reusing significant amounts of existing software, reducing the need for complete rewrites.

The examples also show that CHERI is an ecosystem change rather than one processor feature. These projects have demonstrated mature toolchains, operating systems, libraries, runtimes, and debugging support, showing readiness for product development.
