---
title: Cambridge and SRI
permalink: /discover/history/cambridge-and-sri/
where-next:
  url: /discover/history/development-of-cheri/
related-pages:
- url: /discover/history/early-capability-systems/
  description: A short account of early capability-based computer systems and the ideas that influenced later work.
  action: Read this page
summary: The University of Cambridge and SRI International combined systems, hardware, and assurance expertise to
  establish the modern CHERI architecture.
---

Fixing memory safety in one layer is difficult because the problem crosses several layers at once. The processor executes accesses, the compiler translates language rules, the operating system manages memory and authority, and applications bring decades of existing assumptions. CHERI needed a collaboration that could work across that whole stack.

In 2010, SRI International and the University of Cambridge began the joint CRASH-worthy Trustworthy Systems Research and Development project, known as CTSRD. CHERI became a central part of that work.

## Complementary foundations
{: id="complementary-foundations" }

The Cambridge team brought experience in operating systems, computer architecture, security, and practical compartmentalisation. Work such as Capsicum had already explored how applications could enter a restricted mode and use explicit capabilities for services. This showed the security value of least privilege, while also exposing the cost and complexity of building fine-grained compartments on conventional hardware.

SRI brought a long history of trustworthy systems, formal methods, capability-based protection, and security architecture. The collaboration connected these traditions with modern open-source software and reconfigurable hardware.

The result was a total-system approach. Rather than adding one check to one compiler, the teams investigated coordinated changes to:

- instruction-set architecture
- processor implementations
- compiler and language models
- operating-system kernels and application binary interfaces (ABIs)
- application compartmentalisation
- formal models and security analysis

## Starting from a clean question
{: id="starting-from-a-clean-question" }

The DARPA CRASH programme asked how computer systems could be redesigned to resist, adapt to, and recover from attacks. The CTSRD team focused on a basic source of insecurity: processors could not distinguish a legitimate pointer from a corrupted or invented address with the precision needed by software objects.

CHERI extended a conventional architecture with protected capabilities while retaining page-based virtual memory. This hybrid design was important. It allowed capability-aware software to coexist with established operating-system structures and supported a gradual path from conventional code to stronger protection.

## Building hardware and software together
{: id="building-hardware-and-software-together" }

The collaboration produced far more than an instruction-set document. Early CHERI work used the Bluespec Extensible RISC Implementation, or BERI, as an FPGA processor platform. The teams developed a CHERI-aware LLVM and Clang toolchain, adapted FreeBSD into CheriBSD, built QEMU support, and ported substantial C and C++ software.

This hardware-software co-design let each layer inform the others. Compiler experience influenced capability instructions. Porting software exposed ABI and pointer-model assumptions. Operating-system work tested process and compartment designs. FPGA implementations provided concrete performance and implementation evidence.

Formal models also became part of the architecture’s development and validation. They support precise reasoning about instruction behaviour and give implementers a reference beyond prose alone.

## From collaboration to ecosystem
{: id="from-collaboration-to-ecosystem" }

The Cambridge and SRI partnership remained central as CHERI expanded beyond its first MIPS-based prototypes. Work moved to CHERI-RISC-V, Arm collaborated on the Morello prototype, and embedded designs developed into the CHERIoT platform. Operating systems, compilers, simulators, applications, and assurance work grew around these architectures.

Today, CHERI development involves commercial companies, open-source communities, government programmes, standards bodies, universities, and the CHERI Alliance. The founding collaboration matters because it established the cross-layer method and the technical base on which that wider ecosystem builds.

The [University of Cambridge CHERI site](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/) maintains architecture reports, publications, software links, and project history.
