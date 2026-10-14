---
title: Bootloaders and firmware - CHERI Roadmap for Linux
permalink: /reference/linux-roadmap/goals/bootloaders-firmware.html
summary: null
image_url: null
updated_date: null
parent: /linux-roadmap/
next_page_url: null
related:
  pages: []
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

## Bootloaders and firmware

- Topic: U-Boot; Type: Engineering; Description: U-Boot is a very common bootloader for Linux on embedded systems and is often seen as a critical component for Linux-based stacks on these devices. An early stage implementation of U-Boot with CHERI exists for RISC-V.
- Topic: SBI; Type: Engineering; Description: The Supervisor Binary Interface (SBI) specification is RISC-V specific and is used to abstract hardware implementation from an OS or bare-metal application. It is implemented as part of bbl used by CheriBSD and in OpenSBI which is commonly used with the Linux kernel. Both implementations now support the latest CHERI-RISC-V draft specification but will need to track any further changes.
- Topic: UEFI; Type: Engineering; Description: The Unified Extensible Firmware Interface (UEFI) is a specification that defines a software interface between an operating system and platform firmware and which is predominantly used for booting desktop and server systems. It has been adopted by Arm, RISC-V, Intel and AMD and so is an obvious target for CHERI support in these classes of systems. No work has been done to date to add CHERI support to UEFI loaders.
