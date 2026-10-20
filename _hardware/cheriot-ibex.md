---
title: CHERIoT Ibex Certification Record
where-next:
  url: /adopt/assurance-and-adoption/cheri-enabled-products/
related-pages:
- url: /adopt/assurance-and-adoption/about-cheri-enabled/
  title: About CHERI Enabled
  description: What the programme mark represents, and what remains outside its scope.
  action: Read this page
- url: /hardware/cheriot/
  description: The wider embedded platform, software model, and development environment around the core.
  action: Read this page
summary: The CHERIoT Ibex 1.0 record describes the certified processor core, its CHERI architecture, verification
  evidence, temporal-safety mechanism, and integration assumptions.
thumbnail:
  src: /assets/shared/source-assets/c53c4c1378ba-cheri-enabled-2026.webp
  alt: CHERI Enabled logo - 2026
  width: 400
  height: 120
  fit: contain
record_type: Certification record
organization_label: Microsoft
organization_type: commercial company
product_name: cheriot-ibex
product_type: processor intellectual property — CPU
reference: cheriot-ibex
version: '1.0'
links:
- label: Microsoft CHERIoT Ibex repository
  url: https://github.com/microsoft/cheriot-ibex/
  kind: repository
  primary: true
certification:
  date: '2026-03-26'
  programme_version: '1.0'
  derivative: false
---

## Product information
{: id="product-information" }

`cheriot-ibex` is a 32-bit RISC-V microcontroller core implementing the CHERIoT 1.0 instruction-set architecture.

## Certification answers
{: id="certification-answers" }

### Q2 - What CHERI ISA do you implement and what extensions do you have?
{: id="q2---what-cheri-isa-do-you-implement-and-what-extensions-do-you-have" }

The core implements the CHERIoT 1.0 ISA. This is a stable CHERI ISA targeted for embedded devices maintained by a coalition of vendors. The v1 ISA reference is rendered in human-readable form here:

https://github.com/CHERIoT-Platform/cheriot-sail/releases/download/v1.0/cheriot-architecture-v1.0.pdf

This is also available as a public Sail specification here:

https://github.com/CHERIoT-Platform/cheriot-sail/tree/v1.0

The executable model generated from the Sail version of the specification is used as the gold model, both for comparing explicit test cases and for tandem verification with TestRIG.

The core also implements a small number of extensions (C, M, D, Zb, Zicsr, Zifencei). Of these, only C impacts CHERI by providing compressed versions of some loads and stores, but these are all CHERI extensions.

The core does not support a Hybrid mode. It can be compiled in non-CHERI mode (as a pure RISC-V core). This mode is explicitly excluded from the certification request.

### How do you make sure that the hardware does what it is supposed to do?
{: id="how-do-you-make-sure-that-the-hardware-does-what-it-is-supposed-to-do" }

The core has been formally verified in two ways:

Tom Melham’s group in Oxford has verified trace equivalence to the Sail specification. This work is published as a preprint:

https://arxiv.org/abs/2502.04738

The team at RPTU has used VeriCHERI to verify that the configuration with caches disabled has no direct or indirect dataflow can violate the CHERI rules. In the configuration with caches, this indirect dataflow (timing side channels) can violate CHERI rules with respect to confidentiality, but not integrity.

This work is published here:

> Anna Lena Duque Antón, Johannes Müller, Philipp Schmitz, Tobias Jauch, Alex Wezel, Lucas Deutschmann, Mohammad Rahmani Fadiheh, Dominik Stoffel, and Wolfgang Kunz. 2025. VeriCHERI: Exhaustive Formal Security Verification of CHERI at the RTL. Proceedings of the 43rd IEEE/ACM International Conference on Computer-Aided Design. Association for Computing Machinery, New York, NY, USA, Article 182, 1–9. https://doi.org/10.1145/3676536.3676841

The combination of the two proofs (that CHERIoT Ibex implements the CHERIoT ISA, and that CHERIoT Ibex does not violate the security guarantees of a CHERI system) transitively prove that the CHERIoT ISA is a CHERI ISA.

The CHERIoT Ibex core has also been subject to more traditional DV (randomised testing, coverage-based testing), which achieved RTL coverage of 97%.

### Q3 - What operations can access memory without an explicit capability operand?
{: id="q3---what-operations-can-access-memory-without-an-explicit-capability-operand" }

A debug trap enters debug mode. This places the core under the control of the debug unit (which contains some ROM and RAM).

When in debug mode, CHERI checks are omitted, so code in the debug unit can access all of memory.

This mode is not controllable by software executing on the core, only by an external debugger (typically connected via JTAG).

SoCs that integrated this core are expected to fuse off the debug unit for production deployments, completely disabling this functionality. Alternatively, custom debug ROM code may also restrict the behaviour of the debug mode.

The hardware revoker is integrated with the load-store unit. It scans all of revokable memory and clears tags on capabilities that have been marked as revoked. This does not require a capability to authorise it, but its behaviour is strictly limited. It can clear tags, but not otherwise manipulate capabilities or values. This is part of the temporal safety mechanism and defines the abstract machine. Software can restrict the range over which the revoker runs and can instruct it to begin, but cannot make it do anything other than clear tags on capabilities that point to deallocated objects within that range.

### Q4 - What operations can set tags on arbitrary values?
{: id="q4---what-operations-can-set-tags-on-arbitrary-values" }

None.

The CHERIoT ISA does not include any hybrid modes or privilege levels that would require flows for setting tags on capabilities owned by less-privileged parts of the system. The system boots with three root capabilities (read+execute, read+write, sealing) and all capabilities in the system are derived from this.

The VeriCHERI work conforms that all operations implemented by the core respect the capability monotonicity properties: tags can be cleared, but not set.

Note that this property is specific to the core. A hypothetical implementation could expose the backing store for tags on the memory bus. SoCs using this core that are requesting certification should justify such a decision and describe appropriate safeguards.

### Q5 - How do you ensure integrity of tags with concurrent overlapping writes?
{: id="q5---how-do-you-ensure-integrity-of-tags-with-concurrent-overlapping-writes" }

The core does not support SMP configurations. It does support integration with DMA units that do not write tags.

The core is designed to be used both in new systems and those with existing 32-bit bus architectures with minimal changes. As such, it supports connecting to the memory in two ways. If the design has flexibility (and area) for a 65-bit memory interface, then capabilities are loaded and stored from the core in a single 65-bit transaction, carrying the tag and the data. Capability loads and stores are always aligned and so cannot cover part of a tagged value.

For incremental adoption, the memory bus can also be configured in 33-bit (typically using user-defined metadata bits on an existing bus design to carry the extra bit). This requires two bus transactions to load or store a capability.

In 65-bit mode, stores from the core carry the tag bit and so every capability store is atomic.

In 33-bit mode, capability stores are two 33-bit stores, which each carry the tag. When a normal 32-bit store is issued, it will clear the tag bit for that 33-bit word in memory. When the core loads a capability, it will issue two 33-bit loads and then AND together the resulting tag bits to give the architectural tag bit.

Consider two adjacent memory locations A and B. The core first does a store of a capability spanning both. The tag bits in both will be set. It then does a store of a 32-bit word (narrower stores use byte enables on a 32-bit bus transaction) over A, which clears A’s tag bit. When the core does a load-capability at this location, it sees 01 as the pair of tag bits. ANDing these together gives 0: the result is untagged.

Integrators who use the core with DMA in 33-bit mode must take some care, and certifying a product with such a mode raises some additional questions, depending on the integration:

If DMA can write capabilities then the memory controller must ensure that tag-setting stores from two bus masters are not interleaved and DV must ensure that this is the case.

If DMA cannot store capabilities, interleaving is normally not a problem: a 33-bit store from the CPU that sets a tag interleaved with a 32-bit store from DMA that clears a tag will result in one tag bit being zeroed. However, for area optimisation, an implementation may use a 33-bit bus but still store a single tag bit per 64-bit word. In a situation with no DMA, this is fine: the core will always set tags by writing two tag-setting values back to back. With DMA, the memory controller must ensure that the sequence of a tag-set store to A from the core, a tag-cleared store to A from DMA, and a tag-set store to B from the DMA results in a load of A having its tag bit cleared. DV results for certification of SoCs in this configuration should explicitly document that this has been tested.

### Q6 - How do you handle temporal safety?
{: id="q6---how-do-you-handle-temporal-safety" }

CHERIoT temporal safety is implemented in two parts, extensively documented in two papers describing the CHERIoT platform:

> Saar Amar, David Chisnall, Tony Chen, Nathaniel Filardo Wesley, Ben Laurie, Kunyan Liu, Robert Norton, Simon W. Moore, Yucong Tao, Robert N. M. Watson and Hongyan Xia. CHERIoT: Complete Memory Safety for Embedded Devices. proceedings of the 56th IEEE/ACM International Symposium on Microarchitecture, Association for Computing Machinery (2023).

and

> Saar Amar, Tony Chen, David Chisnall, Nathaniel Wesley Filardo, Ben Laurie, Hugo Lefeuvre, Kunyan Liu, Simon W. Moore, Robert Norton-Wright, Margo Seltzer, Yucong Tao, Robert N. M. Watson and Hongyan Xia. CHERIoT RTOS: An OS for Fine-Grained Memory-Safe Compartments on Low-Cost Embedded Devices. Proceedings of the ACM SIGOPS 31st Symposium on Operating Systems Principles, Association for Computing Machinery (2025), 67–84.

Each granule (8 bytes in the CHERIoT Ibex implementation) of memory that may be used as a heap has a one bit revocation bit associated with it. When an object is freed, the memory allocator sets the revocation bits corresponding to all memory that forms part of the freed object.

The ISA mandates a load filter, which checks the base of capabilities loaded capabilities against the revocation bitmap. The monotonicity properties of CHERI bounds ensure that one of the following is true:

The capability length is zero (in which case the base may point to the address immediately after the end of an allocation), or

The base address is within the range of the original allocation.

The load filter therefore ensures that it is impossible to load a capability that points to memory that is marked as freed. The memory allocator must ensure that, on return from free, all registers are either zeroed or spilled and reloaded. This happens automatically for other threads (context switching to another thread always involves spilling and restoring all registers).

This mechanism is enough to guarantee deterministic trapping on user-after-free bugs. It is not sufficient to allow deallocated memory to be reused.

The CHERIoT-Ibex also implements a revocation engine, which steals cycles from the load-store unit when not executing a load or store. This scans all memory and clears the tag on any capability that points to heap memory that has been marked as free (using the same check as the load filter). This, in combination with the load filter, guarantees that all memory that was freed at the start of a sweep is safe to reuse at the end. The allocator may then clear the revocation bits in such objects and reuse their memory.

These mechanism do, in theory, allow zero-length capabilities to the end of an object to survive revocation. This is not a security issue because zero-length capabilities convey no rights to access memory. The default CHERIoT allocator uses the revocation bit as a defence-in-depth protection for heap metadata and so a capability one past the end will always have its base refer to memory marked as freed and so, in normal operation, these zero-length capabilities cannot escape revocation.

### Q7 - What have you done to evaluate security of the CHERI properties of the system?
{: id="q7---what-have-you-done-to-evaluate-security-of-the-cheri-properties-of-the-system" }

See above with respect to formal and traditional DV. Most notably, the VeriCHERI work formally verifies that there are no ways of running instructions that access memory in a way that is not permitted by the capability model.

### Q8 - What compilers do you support?
{: id="q8---what-compilers-do-you-support" }

We have an LLVM (clang + lld) fork that tracks upstream:

https://github.com/CHERIoT-Platform/llvm-project

This is currently LLVM 21 and LLVM head (which will become 22), with merges from the upstream branches every few days. This is well tested and supported and en route to upstreaming (slowly).

This was used to build the CHERI compliance test suite.

We also have a Rust compiler port:

https://github.com/CHERIoT-Platform/cheri-rust

This is in early stages and passes smoke tests, but it not yet fully supported.

There are also various ports of interpreters, such as MicroPython and Microvium (JavaScript).
