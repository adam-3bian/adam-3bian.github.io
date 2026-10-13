---
title: Prior work on Linux adaptation
permalink: /reference/linux-roadmap/prior-work.html
summary: null
image_url: null
updated_date: null
parent: /linux-roadmap/
next_page_url: null
related:
  pages: []
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

# Prior work on Linux adaptation

Morello Linux contains a hybrid Linux kernel (not purecap) which supports running and building simple user space applications in purecap mode using a new CHERI-aware ABI called PCuABI. Two software stacks are supported; BusyBox and Debian. However, Debian still runs in vanilla AArch64 mode, but new simple programs can be built in purecap mode:

ARM, Morello Linux, https://www.morello-project.org/

Morello pure capability kernel user Linux ABI specification

Linaro, Porting Linux tools into Morello Architecture, 2021

Many (but not all) Linux-based user space environments depend on GCC for compilation. Arm has developed an initial Morello GCC adaptation believed to be sufficient to compile glibc. However, in their Morello Linux work, they have been using musl in order to bootstrap a user environment even without GCC support. It is not clear how mature the GCC work is, and unlike Morello LLVM, ongoing development and maintenance plans are unclear. Unless a pure LLVM-based compilation of a complete glibc-based Linux distribution can be achieved in the medium term, pushing forward Morello GCC support (and generalizing it to be CHERI GCC support) will be important:

Jonathan Corbet, Supporting CHERI capabilities in GCC and glibc, LWN, 2022

Adhemerval Zanella, Building GLIBC with LLVM: The How and Why, Linaro, April 2023

Linaro, Active development branch for work-in-progress building glibc with LLVM, 2024

The MMU-less CHERI-RISC-V Linux port is entirely purecap; both the kernel and userspace. The userspace stack includes a simple CHERI-aware run-time linker, uclibc-ng, and BusyBox, all built in purecap mode. It does support an initial implementation of the CompartOS compartmentalisation model which could isolate device drivers built as kernel modules, and user ELF programs built in FDPIC ELF format. This builds with the CHERI-LLVM toolchain without the use of GCC:

Hesham Almatary, Alfredo Mazzinghi, Robert N. M. Watson, Case Study: Securing MMU-less Linux Using CHERI, In SE 2024 - Companion, February 2024, pages 69-92

Hesham Almatary, CHERI compartmentalisation for embedded systems, Technical Report UCAM-CL-TR-976, University of Cambridge Computer Laboratory, November 2022

There is also work by Huawei on a CHERI-enabled Linux, which they have recently published a workshop paper on. For both serious policy and technical reasons, this is not a suitable input to the CHERI Linux project beyond a simple proof-of-concept demonstration. In particular, it appears that there is frequent rederivation of capabilities from integer pointers without suitable boundsetting throughout the kernel and userspace, such as capability derivation and bounding for mmap being performed within the userspace wrapper, effectively leading to referential and spatial safety protections being ineffectual. However, we include these references for awareness purposes:

Huawei, Linux kernel on CHERI RISC-V, https://github.com/cheri-linux

Kui Wang, Dmitry Kasatkin, Vincent Ahlrichs, Lukas Auer, Konrad Hohentanner, Julian Horsch, and Jan-Erik Ekberg, Cherifying Linux: A Practical View on using CHERI, In EuroSec '24: Proceedings of the 17th European Workshop on Systems Security, April 2024, Pages 15–21
