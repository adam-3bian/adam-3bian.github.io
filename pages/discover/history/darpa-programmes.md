---
title: DARPA Programmes
permalink: /discover/history/darpa-programmes/
summary: DARPA programmes funded the long-running cross-layer work that turned CHERI concepts into tested hardware, software, and compartmentalised systems.
parent: /discover/
next_page_url: /discover/history/ukri-digital-security-by-design/
related:
  pages:
  - /discover/history/early-capability-systems/
  - /discover/history/development-of-cheri/
---

# DARPA Programmes

Changing a processor architecture and its software stack takes sustained work. Early instruction ideas must survive implementation, real applications, security analysis, and repeated redesign. A sequence of programmes from the US Defense Advanced Research Projects Agency, or DARPA, provided important support for that process.

The programmes had broader goals than CHERI alone. CHERI was one technical approach developed and evaluated within them.

## CRASH

The Clean-slate design of Resilient, Adaptive, Secure Hosts programme asked how computer systems could be made highly resistant to cyberattack, continue useful service after compromise, and recover more effectively.

SRI International and the University of Cambridge began the CRASH-worthy Trustworthy Systems Research and Development project in 2010. This project, known as CTSRD, developed the early CHERI architecture and its hardware-software stack.

CRASH supported work including:

- capability extensions to a 64-bit MIPS architecture
- the BERI FPGA processor platform
- CHERI-aware compiler and operating-system support
- early compartmentalisation models
- formal methods and security analysis
- technology transfer and engagement with industry

The clean-slate framing did not mean ignoring existing systems. One of CHERI’s defining choices was a hybrid architecture that could coexist with conventional virtual memory and support incremental software adoption.

## Mission-oriented Resilient Clouds

DARPA’s Mission-oriented Resilient Clouds, or MRC, programme supported related work on cloud systems that could maintain mission objectives despite faults and attacks. Some CTSRD and CHERI work contributed to this wider resilience agenda, including compartmentalisation and operating-system protection.

The connection is important: memory safety prevents or stops invalid access, while compartmentalisation limits how far a successful compromise can spread. Resilient systems need both prevention and containment.

## SSITH

The System Security Integration Through Hardware and Firmware programme investigated hardware architectures that could block broad classes of software exploitation. Under SSITH, the Cambridge and SRI work extended CHERI for additional trustworthiness goals and brought the architecture to RISC-V.

This stage helped demonstrate that CHERI was not tied to its first MIPS implementation. It also supported embedded and real-time work, formal verification, compartmentalised software, and processor prototypes.

DARPA’s Finding Exploits to Thwart Tampering, or FETT, exercise invited security researchers to test systems developed under SSITH. The bug-bounty model gave projects adversarial feedback and evidence beyond their own development teams.

## Later compartmentalisation work

Subsequent DARPA support, including the Compartmentalization and Privilege Management programme, continued work on scalable CHERI compartmentalisation, formal methods, and practical software structures. This built on the pure-capability foundation and experience gained from earlier prototypes.

## Why programme continuity mattered

The sequence allowed the work to move through distinct questions:

1. Can capabilities be integrated with a modern RISC architecture?
2. Can a complete open-source operating system and C/C++ toolchain use them?
3. Can the model move to other instruction sets and processor scales?
4. Can security properties be tested through formal and adversarial methods?
5. Can compartments be made practical for large, real software systems?

No one programme produced the entire current ecosystem. Together, they helped create the technical evidence and open artifacts that later work on Morello, CHERI-RISC-V, CHERIoT, commercial products, and standards could use.

Authoritative background is available from the DARPA CRASH programme archive and the University of Cambridge CHERI project page.
