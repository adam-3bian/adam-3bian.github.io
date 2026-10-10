---
title: FPGA Platforms
---

1. Build
2. Platforms
3. FPGA Platforms
{: .source-breadcrumbs }

# FPGA Platforms
{: id="page-hero-title" .page-hero-title }

FPGA platforms let teams run and modify CHERI processor and system designs before committing to fixed silicon.
{: .page-hero-summary }

A software simulator can model an instruction set, but processor developers also need to test caches, buses, memory tagging, interrupts, peripherals, and real timing. Fabricating a chip for every change would be slow and expensive.

A **field-programmable gate array**, or FPGA, can be configured to implement a processor and system design. This makes it a practical bridge between simulation and silicon.

## What an FPGA platform includes
{: id="what-an-fpga-platform-includes" }

Running CHERI on an FPGA usually requires more than a processor core:

- CHERI-capable processor design in register-transfer-level (RTL) form
- tagged-memory support through caches and memory controllers
- buses, interrupt controllers, timers, and peripherals
- a board-specific system-on-chip design
- an FPGA bitstream and programming route
- boot firmware, linker layout, and software development kit (SDK)
- a matching operating system, real-time operating system (RTOS), or bare-metal runtime

The capability tag path is critical. A core may implement CHERI instructions correctly while an incomplete memory or direct-memory-access (DMA) design loses tag state.

## Common platform routes
{: id="common-platform-routes" }

### Purpose-built CHERIoT boards
{: id="purpose-built-cheriot-boards" }

Sonata provides an integrated development route for CHERIoT firmware and physical peripherals. It is a strong choice for software teams that want hardware without becoming FPGA system integrators.

### General FPGA development boards
{: id="general-fpga-development-boards" }

CHERIoT and other CHERI-RISC-V cores can target supported commercial FPGA boards. These are useful when a team already owns the hardware or needs a different FPGA size and peripheral set.

The core, system design, board constraints, and SDK must all match. A bitstream for one board cannot normally be moved to another without rebuilding the hardware design.

### Application-class CHERI-RISC-V
{: id="application-class-cheri-risc-v" }

Larger FPGA systems can run 64-bit CHERI-RISC-V cores, sometimes with memory-management units and CheriBSD or Linux support. They enable operating-system and processor development where QEMU is too abstract and commercial silicon is not yet the selected target.

### Supplier evaluation images
{: id="supplier-evaluation-images" }

Processor-IP vendors may provide FPGA images and SDKs for their own cores. These can offer a supported route to product evaluation, but access, licences, peripherals, and redistribution terms differ.

## What FPGA evidence can support
{: id="what-fpga-evidence-can-support" }

An FPGA is useful for:

- validating RTL and tagged-memory integration
- booting an operating system or RTOS
- testing interrupts, drivers, and peripherals
- exercising compartment transitions on hardware
- measuring functional cycle counts and relative changes
- developing software before silicon arrives
- running hardware-in-the-loop continuous integration

## What not to infer
{: id="what-not-to-infer" }

FPGA measurements do not directly establish:

- production clock frequency
- silicon power consumption
- final chip area
- production cache and memory latency
- resistance to physical attacks
- final safety or security certification

An FPGA implementation may use different memories, clocks, interconnects, and processor-design trade-offs from the production device.

## Selecting a board
{: id="selecting-a-board" }

Check:

1. **Core and architecture:** Which CHERI instruction-set architecture (ISA) and version does the bitstream implement?
2. **Software:** Which compiler, application binary interface (ABI), operating system, and examples are supported?
3. **Resources:** Does the FPGA have enough logic, memory, and tagged-memory support?
4. **Peripherals:** Are the required interfaces present and supported by drivers?
5. **Debug:** Are hardware-debug and serial-console connections, trace, and fault diagnostics available?
6. **Licence:** Can you modify and redistribute the RTL, bitstream, and software as required?
7. **Lifecycle:** Is the board a learning target, a maintained development platform, or part of a supplier product route?

## Reproducibility
{: id="reproducibility" }

Store the RTL revision, tool version, synthesis settings, board constraints, bitstream checksum, firmware, and SDK together. FPGA vendor tools can produce different results across versions, so the hardware build environment is part of the evidence.

[Sonata](/hardware/sonata/) provides a CHERIoT environment for software development, while the [CHERI product directory](/build/platforms/cheri-products/) describes current cores, chips, boards, operating systems, and tools.

## Where next
{: .where-next-title }

### [Simulators](/software/simulators/)
{: .where-next-card-title }





[Simulation is often the best first CHERI platform.](/software/simulators/)
{: .where-next-summary }



[Continue](/software/simulators/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Platform Comparison](/build/platforms/platform-comparison/)
{: .related-pages-item-title }





[No single CHERI platform is best for every workload.](/build/platforms/platform-comparison/)
{: .related-pages-item-summary }



[Read this page](/build/platforms/platform-comparison/)
{: .source-card-label }





### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Choose a platform, prepare an environment and run a first CHERI workload.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
