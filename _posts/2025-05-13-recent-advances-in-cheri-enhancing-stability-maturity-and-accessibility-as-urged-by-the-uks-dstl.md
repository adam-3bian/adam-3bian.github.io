---
layout: article
title: Recent advances in CHERI enhancing stability, maturity, and accessibility as urged by the UK’s DSTL
summary: 'The DSTL paper “[Biting the CHERI bullet: Blockers, Enablers and Security Implications of CHERI in Defence](https://arxiv.org/pdf/2504.17904)” collates and analyzes feedback on CHERI development by 15 independent teams across industry and academia on the Morello research platform.'
permalink: /news/recent-advances-in-cheri-enhancing-stability-maturity-and-accessibility-as-urged-by-the-uks-dstl/
slug: recent-advances-in-cheri-enhancing-stability-maturity-and-accessibility-as-urged-by-the-uks-dstl
navigation:
  header:
    category: News & Events
    subcategory: News & Analysis
date: '2025-05-13T13:12:20+01:00'
post:
  category: cheri-alliance-news
  tags:
  - CHERI Alliance news
  authors:
  - person: andrew-lindsay
  - person: carl-shaw
---

## Overview

This work provides a useful set of feedback based on their Morello experience that highlights what is important to end users regarding CHERI software development. Many of the issues highlighted in the DSTL paper have already been addressed through an updated standard, new CHERI-native processors (instead of retro-fitting CHERI into existing cores), the creation of the CHERI Alliance, and new versions of software and the operating systems. This blog post delves into the likely reasons behind their experiences based on current knowledge, the status of CHERI today, and how the CHERI community is working together to ensure we provide everything necessary for companies to start using CHERI.

The paper had three common threads: stability, maturity, and accessibility.

## Stability

Many of the companies involved commented on the stability of the hardware, the operating system (which was primarily CheriBSD), and the tooling.

It is important to note that the Morello chip was created as a research platform and not as a commercial product. It was an implementation of CHERI based on the “version 8” specification of CHERI from the [University of Cambridge](/organisations/university-of-cambridge/) and [SRI International](/organisations/sri/), who had been developing CHERI for nearly a decade at that point. That version of the specification still contained unanswered research questions and hence the Morello architecture was created with a wide range of functionality to enable further exploration. The University of Cambridge and Arm were able to use this platform to refine CHERI and this led to a subsequent “version 9” of the CHERI specification. Version 9 was then used as the base specification for subsequent CHERI work, such as the currently ongoing RISC-V International standardization of CHERI (called “CHERI-RISC-V”) in which Codasip is heavily involved. The Morello platform was instrumental in getting CHERI to the stage where it could be commercialized in both CHERI-RISC-V and CHERIoT (for tiny cores) variants, and in particular demonstrating CHERI protection applied to real-world, large-scale software applications and ecosystems such as nginx and Chromium.

As the timescales and budget to create Morello were very limited, CHERI had to be retrofitted to an existing Arm design – the Neoverse N1. Given these constraints, compromises in the implementation had to be made (for example, not widening memory bus widths to match the capability size or extending the branch predictor to predict bounds) and the verification of the hardware could not be expected to be as high as for the commercial chips that the participants in this study were used to using. The Morello chip was amazingly successful given the development constraints and was an excellent research and demonstration platform for CHERI that enabled validation of the technology across microarchitecture and software. The results from the Morello project confirmed the viability of the CHERI approach as well as the fulfilment of its memory-protection and compartmentalization promises. However, as a first-generation prototype, Morello has known CHERI performance and implementation issues and is not an optimal implementation of a CHERI processor.

As this was a research project, the software was evolving very rapidly and sometimes even with multiple experimental implementations of security features. This naturally led to rapidly evolving software, tools (including the compiler) and associated documentation. Some architecture-specific features, such as CHERI debug, were not provided in the CHERI specification from the [University of Cambridge](/organisations/university-of-cambridge/) and were developed specifically for Morello. It is unsurprising that the participants encountered stability issues as everything would have been evolving under their feet and they were dealing with early-stage silicon.

## Maturity

Morello was a platform released in January 2022 to explore how CHERI could be used, and as the [CHERI ISA implementation on Arm](https://developer.arm.com/documentation/ddi0606/latest/) offered a range of options, there was sometimes no prescribed “right way to do things”. This is why the companies in the paper, often projects in the early stages, found the technology to be immature. Over the course of the Digital-Security-by-Design (DSbD) program, the knowledge and consensus solidified, providing more guidance later on.

Morello provided the knowledge to allow refinement of the CHERI ISA for commercial use and you can see this clearly if you compare the Arm Morello instruction set with the latest [CHERI-RISC-V](https://github.com/riscv/riscv-cheri/releases) or [CHERIoT](https://cheriot.org/cheriot-sail/cheriot-architecture.pdf) equivalents which have more limited ISA extensions. Going forward, Morello still has the flexibility to aid further research into more advanced uses of CHERI and is still likely to contribute to the evolution of the more commercially oriented specifications.

From the start of the project, CheriBSD was the most mature Operating System (OS) and, although it was based on the very mature FreeBSD, it had not been used on commercial projects and had only been worked on by a small team. Morello drove forward the work and throughout the DSbD program, CheriBSD was evolving to take advantage of the hardware features and integrate new research. As an example, temporal safety based on the Cornucopia capability revocation work **has been** added to provide temporal safety for user-level code. CheriBSD now has mature temporal safety and compartmentalization mechanisms and evolving library compartmentalization and even hypervisor support (see [CheriBSD](https://www.cheribsd.org/)).

Morello Linux development only started during the Morello program, so it was always going to be a very immature target for software. It also only supported a hybrid kernel for expediency, where the kernel does not run in CHERI mode. This explains why many participants chose to port their software to CheriBSD, although it may not have been the best platform for them. Porting from other POSIX-based OS may have been easier to port to Linux, which can be seen in the comments where participants first ported their software to Linux and then to CheriBSD. Recent work has been on developing a pure capability Linux kernel and userspace (see [CHERI Linux](https://cheri-linux.org/)), with attention being paid to security, stability and performance.

Some of the participants in this study may also have been better off porting their software to a more suitable OS such as [CHERIoT-RTOS](https://github.com/CHERIoT-Platform/cheriot-rtos), but unfortunately this was not available during the time of this project. Recent participants in the DSbD program reported a very positive experience with this OS on the Sonata development system.

When a technology is first introduced, the focus is normally on functionality. In the case of CHERI, the focus was on security and then functional correctness. Once that is done, the experience allows for a period of optimization and then productization. The projects surveyed used the technology during the first phase, thus finding a number of sub-optimal implementations in both the hardware and the software. We now have more optimal hardware designs, such as [Codasip’s X730 64-bit application processor](https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/) that was designed from the ground up for CHERI. The LLVM compiler has been improved, with better optimization and better testing against compiler test suites. Operating systems such as Linux are currently being optimized to best use the CHERI hardware. Recent benchmarks are showing an average CHERI overhead of 3.8%, so rebuilding the study’s software today against more recent hardware and software releases is likely to give a much better experience.

## Accessibility

The paper highlighted how the dissemination of knowledge is critical to speed the adoption of a new technology such as CHERI. The maturity and distribution of the CHERI documentation in particular was viewed as problematic. This is extremely useful as it identifies documentation, training and support for the hardware, technology fundamentals, operating systems, and development environments as being vital to enable companies to use CHERI with the same ease as existing technologies.

Since this paper was written, a new industry body – the [CHERI Alliance](/) – has been created to act as a focal point for CHERI promotion and development. The CHERI Alliance represents a range of companies, academic institutions and government agencies (including DSTL). It now hosts an increasing number of software packages in its [Github repositories](https://github.com/CHERI-Alliance) and contains a number of active Working Groups looking at both the technical and non-technical aspects of CHERI. The CHERI Alliance will become the source of information and knowledge sharing for CHERI and should, over time, remove the problem of out-of-date knowledge being spread over a number of different sites. Of course, as CHERI becomes more commonplace, this knowledge will be included in the mainstream documentation as we aim to upstream CHERI support, for example, in the Linux kernel.

From this paper, the CHERI Alliance will need to continue to build its collection of training material, example code and documentation.

As an example, the issue of CHERI compartmentalization documentation was highlighted in the paper. It is clear that each CHERI Operating System should create guidance on how to implement compartmentalization and how it links to the fundamental CHERI features implemented in capabilities. CHERI operating systems now include BSD, Linux, FreeRTOS, Zephyr and CHERIoT OS and most of these are now managed within the CHERI Alliance and will have their own dedicated websites to provide OS-specific CHERI details.

## Other points of note

The paper briefly comments on the use of CHERI in systems that have certification requirements. Two issues were raised: that of stability and the reliance on open-source dependencies. The issues of stability have been addressed above and, importantly, with the ratification of the CHERI-RISC-V specification, these industries will have a concrete base for their products. Open-source tools and operating systems are not the only options for those wishing to adopt CHERI. Defense and aerospace veterans AdaCore and Wind River have already invested significantly in porting toolchains and operating systems to CHERI.

The paper discusses the porting of legacy C/C++ applications to CHERI and questions how easy this is. It is important to distinguish here between the porting to gain improved memory safety vs the re-architecting needed to implement compartmentalization. The porting approach is comparable to completely re-writing software in a memory-safe language. Compartmentalization adds additional protection **beyond** what can currently be supported in any memory-safe language and is a way to implement the security principle of *least privilege* within code. Adding compartmentalization usually requires software architecture changes that will require more extensive software changes.

It is important to realize that CHERI is not a solution for all security problems. CHERI protects against memory corruption (spatial and temporal), control flow integrity attacks (although this was not mentioned in the paper) and adds efficient support for compartmentalization (including co-existence with MMUs and hypervisors). It must be implemented correctly in hardware and software to be effective. A review of the top ten CWEs by the author highlighted that only two were mitigated, and a third (use after free) may be. This is correct as CHERI is a mitigation to memory safety weaknesses, not a panacea. It is also interesting to note that the weaknesses CHERI mitigates are the most **exploited** CWEs, with the \#1 Known Exploited Vulnerabilities (KEV) being “Out of bounds write” ([CWE – 2024 CWE Top 10 KEV Weaknesses](https://cwe.mitre.org/top25/archive/2024/2024_kev_list.html)).

## Conclusion

This paper is an important reflection on the deployment of a new technology, highlighting the importance of stability and knowledge dissemination. The findings provide useful signposts for where the CHERI Alliance will continue to focus the efforts of its working groups and knowledge dissemination.

It is also encouraging to see the progress the CHERI community has made since the participants of this research engaged with Morello, which is a true testament to the hard work everyone has contributed.

If you would like to develop your software against the latest CHERI hardware and software, then you can start today with the [Codasip Prime](https://codasip.com/press-release/2025/04/29/codasip-prime-launch/) platform.

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
