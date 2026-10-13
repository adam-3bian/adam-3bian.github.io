---
title: Kernel support - CHERI Roadmap for Linux
permalink: /reference/linux-roadmap/goals/kernel.html
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

## Kernel support

Topic: Hybrid kernel; Type: Engineering; Description: CheriBSD supports both hybrid (primarily integer-based pointers except where annotated to enable pure-capability userspace applications), and pure-capability kernels. In an ideal world, there would be no need for hybrid kernels, as adding qualifiers to pointers in system-call arguments, and implementing a translation layer between ABIs, is both disruptive and a noticeable development and maintenance burden. This is similar (but not identical) to the idea of supporting a 64-bit user space with a 32-bit kernel – possible, but ideally not required. The hybrid kernel is maintained in CheriBSD while evaluation continues as part of pure-capability kernel research, to permit side-by-side performance comparisons. Today, Morello Linux implements a hybrid kernel. As work on CHERI Linux continues, and the CheriBSD kernel research concludes, hopefully a conclusion will be drawn that hybrid support is not required, and this might be removed from the feature list.

Topic: Purecap kernel; Type: Engineering; Description: The Linux kernel can be compiled with LLVM and although a proof-of-concept MMU-enabled CHERI-RISC-V purecap kernel has been produced by Huawei, i however, it has not yet been fully ported to support CHERI’s memory-safety and compartmentalization features, and, it does not form a sound basis for further work. (see “Prior work on Linux adaptation” section below). A more robust proof-of-concept purecap port of MMU-less Linux is also available., and a more complete Linux kernel has previously been partially ported, but not yet been fully ported to support CHERI’s memory-safety and compartmentalization features. See “Prior work on Linux adaptation” section below for more details. Alfredo Mazzinghi’s PhD dissertation includes an initial analysis of areas of work required to replicate CheriBSD’s pure-capability kernel support in Linux. Note that work on kernel heap temporal safety is also planned for CheriBSD over the coming year – a feature that one would want to replicate in Linux. A practical approach would be to start with the Morello Linux kernel and use that as the starting point for a portable (including CHERI-RISC-V) work towards adding a clean CHERI-RISC-V purecap kernel implementation.

Topic: Kernel build utilities; Type: Engineering; Description: Changes to kernel types to support CHERI may lead to patch-checking tools such as smatch or sparse requiring modification.

Topic: Kernel compart-mentaliza-tion; Type: Research; Description: With a memory-safe kernel baseline, kernel compartmentalization is also an important (albeit currently very research-oriented) goal. An early prototype exists in CheriBSD on Morello, and the MMU-less Linux prototype includes linker-based compartmentalization that is able to sandbox simple kernel modules (e.g., device drivers). This is an area that is very much an active area of research, and so may not be an engineering goal for CHERI Linux in the short term – but its requirements should be taken into account when implementing, for example, kernel spatial and temporal safety. And, as the research prototypes and understanding evolve, it should be added to the engineering goals for CHERI Linux.

Topic: CheriABI; Type: Engineering; Description: Enables running spatially safe user space processes via capability-extended system calls, signal delivery, and so on. This is implemented in Morello Linux to a good level of technical maturity, and with care taken regarding ABI definition. Similar specification work needs to occur for CHERI-RISC-V, but can be built on the Morello definitions.

Topic: 64-bit compat; Type: Engineering; Description: Enables running 64-bit (legacy) processes on a capability-aware kernel. This is implemented in Morello Linux.

Topic: 32-bit compat; Type: Engineering; Description: Enables running 32-bit (legacy or x32) processes on a capability-aware kernel. The Morello ISA dropped armv7 support for simplicity and RISC-V designs do not typically support RV32 on an RV64 system due to a lack of legacy code, but an x32 approach might be viable (even critical for some vendors with pointer-heavy workloads or legacy binaries). This is a low priority and can wait for clear demand.

Topic: User space temporal safety; Type: Research; Description: A major recent feature of CHERI software-stack, heap temporal memory safety, requires kernel virtual-memory support to implement efficient capability revocation, used by user space heap allocators to prevent temporal heap aliasing enabled by use-after-reallocation vulnerabilities. There has not yet been a feasibility study for this feature in Linux. Further, temporal safety on CHERI remains an area of ongoing research, and it is reasonable to expect that thinking on this topic (as well as architectural support) will evolve considerably in coming years – both with respect to performance and the potential implications on system behavior (e.g., system-wide, not just process-local, impacts).

Topic: Co-

Topic: processes; Type: Research; Description: This remains immature on CheriBSD, but continues to show promise in some applications. It mostly requires kernel changes in the current state, but runtimes may require significant changes as the ideas mature (e.g., consider a per-address space allocator and perhaps garbage collection). There has not yet been a feasibility study for this feature in Linux, and this is an active area of research for CHERI.

Topic: KVM; Type: Engineering; Description: The ability to boot capability-enabled guests using hardware-assisted virtualisation extensions. CheriBSD has working support for pure-capability guests in FreeBSD’s bhyve on Morello. Arm has in-progress work to bring up KVM support on Morello Linux, it is in early stages of development and currently supports only aarch64 guests not CHERI-enabled guests. It has been verified even if not extensively with LTP test suite.
