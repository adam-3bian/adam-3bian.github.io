---
title: 👮 MMU-less Systems WG
image_url: /assets/groups/mmu-less-systems/bb889a4dc09e-cheri-alliance-working-groups.png
website_url: https://cheri-alliance.org/who-we-are/working-groups/mmu-less-systems/
repository_urls: []
leads:
- murali-vijayaraghavan
related:
  organisations:
  - google
  hardware:
  - cheriot
  software: []
---

# 👮 MMU-less Systems WG

Examines CHERI protection and compartmentalisation for systems that share an address space and do not depend on a conventional memory-management unit.

The goal of this WG is to discuss designs for a broad range of CHERI systems where the common theme is that they operate on a shared single address space between processes. The three main categories of systems that I have in mind are:

Embedded single-address space physical memory systems. This includes systems like [CHERIoT](/hardware/cheriot/).

Application-class single-address space physical memory systems. This expects large physical memories where processes reside permanently because dynamically managing process memory in this setting is difficult, and supporting disk swap may not be easy.

Application-class single-address space virtual memory systems. This uses virtual memory solely to virtualize physical memory, facilitating dynamic process memory management and supporting disk swap, while capabilities manage all access control.

It is important to discuss both the hardware and software aspects of such a design. For instance, a traditional POSIX fork call cannot work in a single-address space setting. In general, we should discuss how to redesign system calls to work in this single-address space setting.

We will also propose and discuss other designs that broadly fall into the category of CHERI-based single-address space systems, or systems that don’t require traditional MMUs.

Group type: Technical

## Areas of collaboration

- Shared-address-space systems
- Embedded compartment models
- Resource and real-time constraints
