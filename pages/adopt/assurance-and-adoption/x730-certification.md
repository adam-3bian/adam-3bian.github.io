---
layout: page
title: X730 Certification Record
summary: The X730-MP4-Lux 1.0 record describes the certified application-processor core, its CHERI-RISC-V modes, verification evidence, and system-integration assumptions.
permalink: /adopt/assurance-and-adoption/x730-certification/
slug: adopt-assurance-and-adoption-x730-certification
navigation:
  header:
    category: Adopt
    subcategory: Assurance & Adoption
image:
  src: /assets/images/shared/cheri-enabled-2026.webp
  alt: CHERI Enabled logo - 2026
  width: 400
  height: 120
  fit: contain
resources:
- type: website
  label: Codasip X730
  url: https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/
related:
- type: page
  slug: adopt-assurance-and-adoption-cheri-enabled-products
  relation: next_step
- type: page
  slug: adopt-assurance-and-adoption-about-cheri-enabled
  relation: related
- type: page
  slug: build-technology-pure-capability-systems
  relation: related
- type: organisation
  slug: codasip
  relation: organisation
---

## Product information

The X730 is a commercially licensable 64-bit application-processor core implementing CHERI-RISC-V. The baseline design is described as an in-order, dual-issue, nine-stage processor with a memory-management unit, extended to handle capabilities and CHERI instructions.

![X730 block diagram](/assets/images/shared/x730-block-diagram.webp){: .image-full }

## Certification answers

### Q2 - What CHERI ISA do you implement and what extensions do you have?

The X730 is an RVA22 compliant processor with the following optional/extra extensions.

| Extension | Version | Comment |
| --- | --- | --- |
| Zfhmin | v1.0 | half precision floating point |
| Zam | v0.1 | Misaligned atomics |
| Zbkb | v1.0.1 | Bitmanip instructions for cryptography |
| Zbkc | v1.0.1 | Carry-less multiply instructions |
| Zkt | v1.0.1 | Data independent execution latency |
| Ss1p12 | v1.12 | Supervisor architecture |
| Svpbmt | v1.0 | Page-based memory types |
| Svinval | v1.0 | Fine-grained address translation cache invalidation |
| Sm1p12 | v1.12 | Machine architecture |
| Sdext | v1.0 | External debug interface |
| Sdtrig | v1.0 | Debug triggers |
| Zcheripurecap | v0.9.3 | CHERI-RISC-V Extension |
| Zcherihybrid | v0.9.3 | Integer pointer mode support |
| Zabhlrsc | v0.9.3 | Byte and half loads and stores |
| Zstid | v0.9.3 | Software thread identification |
| Zish4add | v0.9.3 | Addition using wider registers |
| Zcheripte | v0.9.3 | PTE control of capability storage |
| Zcherilevels | v0.9.3 | CHERI capability levels |
| Svyrg | v0.9.7 | 4-bit PTE scheme for revocation |

### How do you make sure that the HW does what it is supposed to do?

 Verification of X730 has been extensive. It has followed a strategy of deconstructing the design into its constituent components and major subsystems, then verifying those independently. This has been done with a mixture of formal property-based environments and simulation, and resulted in ~17 different verification environments, including:

- CHERI checks and calculations have their own set of formal proofs to ensure accuracy and robustness.
- The memory subsystem has its own simulation environment focused on data coherency in multi-core configurations.
- The execution pipeline is simulated in isolation, allowing all instruction semantics to be verified by randomised instruction streams against the RISC-V Sail model.
- Formal equivalence proofs are performed to ensure that power-saving techniques such as clock-gating do not change the functionality of the design.

These separate environments allow the verification of each component to explore corner cases far easier than if they were only tested when integrated into the full design. The layering of verification environments (like the CHERI formal and the full execution pipeline above) allows the detection and tracking of “escapes” from one layer to the next. These then drive the improvement of the verification.

All verification results are tracked against requirements to ensure that everything that has been specified has been covered by at least one of the environments and gaps do not form between environments. Codasip’s processes have been reviewed by TUV/SUD and 32-bit configurations generated from the same code-base has received ISO 26262 certification for use in automotive applications.

In total, over 40 person-years of engineering effort has been put into X730’s verification.

### Q3 - What operations can access memory without an explicit capability operand?

In pure-cap mode: None.

In hybrid/integer mode: PCC and DDC are implicitly added to integer pointers.

Page table walks are not bounded by capabilities.

Capabilities are checked within their own virtual address space. The software that manages the address space is bound by capabilities (within its address space) but may abuse address translation to allow lesser privileged code to breach its isolation. Thus these software elements must form part of the trusted code base of the system.

Debug mode disables all CHERI checks. Debug mode is not expected to be active in normal operation. Debug mode can only be entered via RISC-V standard methods. SoC-level security controls are expected on the external debug interface.

### Q4 - What operations can set tags on arbitrary values?

X730 only transforms tagged capabilities according to the proposed RVY extension, which does not allow any tagged values to be written to a register that are not derived from capabilities with equal or greater privilege. In addition, only aligned, capability-wide writes and reads preserve the tag from the register, and all other writes clear the capability tag.  There are therefore no instructions that can set a tag on arbitrary values in a register or overwrite a tagged value in memory with an arbitrary value without clearing the tag.

Beyond the scope of this certification, we have carefully engineered the memory subsystems to ensure that the commitment to memory of capabilities preserves atomicity with their tags.

### Q5 - How do you ensure integrity of tags with concurrent overlapping writes?

Our CPU core has a single bus master for data accesses and so cannot make concurrent writes. When in a multi-core configuration the cores cannot make concurrent writes to the same cache line due to the coherent memory system. Cores can make concurrent writes to the same uncached memory address, and these are ordered by the L2 cache before being sent to the SoC memory system. The L2 cache treats the capabilities as atomic units that cannot be partially overwritten. The L2 cache, by its nature, cannot make concurrent accesses to the system memories.

### Q6 - How do you handle temporal safety?

The X730 implements RV64Y Svyrg, which enables temporal safety for allocated memory in virtual address spaces: a supervisor can entirely remove access to freed virtual addresses before the memory is reallocated by placing freed memory regions in quarantine and using a background sweeper thread to find any dangling references before reallocation.

CHERI uses a combination of hardware and software to implement temporal safety on the MMU-based X730 core. CHERI allows temporal safety to be enforced by making it possible to accurately identify pointers, and check the memory which they are permitted to access. There have been various papers published on this topic (CHERIvoke, Cornucopia and Cornucopia Reloaded). Each offers improved performance over the previous paper. The X730 implements a 4-bit PTE scheme to accelerate revocation using the scheme from Cornucopia Reloaded allowing virtual memory pages to have their capabilities accurately tracked. It provides Capability Dirty Tracking to identify which pages have had capabilities stored to them, and a load barrier to prevent capabilities from being loaded from pages which have not yet been swept for stale capabilities which would allow use-after-reallocation vulnerabilities. Freed memory regions are held in quarantine until all stale capabilities which refer to them have been swept (located and invalidated).

### Q7 - What have you done to evaluate security of the CHERI properties of the system?

- We perform formal verification of CHERI-related components within the microarchitecture to ensure compliance with the specification.
- We perform a security analysis of the microarchitecture (including CHERI-specific threat modelling) and generate a set of security requirements and mitigations for required behaviour. For example, this includes the expected behaviour during transient execution.
- We have a security test suite and fuzzing framework to cover known transient execution attacks, prediction-based non-transient execution attacks, cache attacks, timing attacks, etc.
- We evaluate out-of-context attacks e.g. the impact of RowHammer on CHERI capability tag storage.
- We run security test suites against OS and RTOS. e.g. the Juliet test suite as well as kernel test suites (such as syscall fuzzers) adapted for CHERI ABIs.
- Vulnerabities have been identified and resolved in both hardware and software (e.g. an incorrectly ordered bounds check during speculative execution)

### Q8 - What compilers do you support?

LLVM19.1.7 Clang and Rust


## Certification record

| Field | Published value |
| --- | --- |
| Organisation | Codasip |
| Organisation type | commercial company |
| Product | X730-MP4-Lux |
| Product type | processor intellectual property — CPU |
| Reference | release-Orleans-Lux-1833-FRZ-rc01-11.3.1 |
| Version | 1.0 |
| Certification date | 2026-03-26 |
| Programme version | 1.0 |
| Derivative of a qualified product | false |
