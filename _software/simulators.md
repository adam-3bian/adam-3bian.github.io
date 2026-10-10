---
title: Simulators
---

1. Build
2. Platforms
3. Simulators
{: .source-breadcrumbs }

# Simulators
{: id="page-hero-title" .page-hero-title }

CHERI simulators trade speed, architectural precision, and hardware detail differently, so choose the model that matches the question.
{: .page-hero-summary }

A simulator is often the first CHERI platform a developer uses, but different simulators answer different questions. One prioritises booting a complete operating system quickly. Another serves as an executable reference for instruction semantics. A third models a particular processor implementation cycle by cycle.

## Main simulator types
{: id="main-simulator-types" }

- **A system emulator, such as CHERI QEMU,** runs complete operating systems and applications relatively quickly. It suits CheriBSD or Linux porting and automated tests, but it does not model the final processor design or timing.
- **An executable formal model, often written in Sail,** stays close to the architectural specification. It is slower than optimised emulation and suits instruction behaviour, reference testing, and instruction-set development.
- **Register-transfer-level (RTL) simulation** executes the processor’s hardware description. It exposes implementation details but is much slower and specific to that processor design.
- **Verilator or another compiled implementation model** can run many hardware designs faster than event-driven RTL. It remains implementation-specific and is not identical to silicon.
- **A supplier simulator** may closely match a commercial processor and software development kit (SDK). Its availability and level of detail depend on the supplier.

## QEMU for full systems
{: id="qemu-for-full-systems" }

The CHERI-enabled QEMU work supports architectures used by CheriBSD and related development. `cheribuild` can build QEMU together with a matching compiler, operating system, and disk image.

Choose QEMU when you need to:

- boot a pure-capability Unix environment
- compile and test application ports
- run automated test suites
- inspect architectural capability faults
- work without physical hardware

QEMU execution time is not a prediction of processor performance. It also may not model caches, speculation, precise interrupt timing, or implementation-specific features.

## Sail and executable specifications
{: id="sail-and-executable-specifications" }

Sail is used to describe instruction-set semantics in an executable form. CHERI projects use Sail models for architecture development, reference simulation, test generation, and formal reasoning.

A formal model is valuable when the question is “What should this instruction do according to the model?” It helps compare processor implementations with an independent reference.

The model and prose specification must still be versioned together. A simulator built from one instruction-set architecture (ISA) revision should not be used as evidence for another without checking the differences.

## CHERIoT simulation
{: id="cheriot-simulation" }

The CHERIoT development environment includes simulator routes for its formal model and processor implementations. The real-time operating-system (RTOS) board descriptions connect firmware builds to an appropriate run command.

This lets developers run the same compartmentalised firmware through a reference simulator, implementation simulation, and supported hardware. Use the official example configuration before creating a new board definition.

## RTL simulation
{: id="rtl-simulation" }

RTL simulation executes the processor and system hardware description. It can expose bugs in:

- capability instruction implementation
- tag storage and propagation
- cache and memory interfaces
- exceptions and interrupts
- reset and privilege behaviour
- integration with buses and peripherals

Its speed usually limits the size of software workloads. Use small, targeted tests and combine them with higher-speed system emulation.

## Selecting the right simulator
{: id="selecting-the-right-simulator" }

Ask:

- Do I need a complete operating system or one instruction test?
- Is architectural behaviour enough, or do I need implementation cycles?
- Which CHERI ISA and revision is implemented?
- Does the model preserve capability tags through all memory paths?
- Can the debugger inspect capability state?
- Is the simulator deterministic and suitable for continuous integration?
- Which platform tests compare it with FPGA or silicon?

## Record limitations with results
{: id="record-limitations-with-results" }

Every result should name the simulator, revision, architecture, software stack, and configuration. State explicitly when timing, power, cache, or physical behaviour is outside the model.

Use [Run CHERI in Simulation](/guides/run-cheri-in-simulation/) for a first practical setup, and move to [FPGA Platforms](/hardware/fpga-platforms/) when the question depends on hardware implementation.

## Where next
{: .where-next-title }

### [CheriBSD](/software/cheribsd/)
{: .where-next-card-title }





[Use CheriBSD for a complete CHERI-enabled Unix environment, including pure-capability applications, ports, tests, and debugging.](/software/cheribsd/)
{: .where-next-summary }



[Continue](/software/cheribsd/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Platform Comparison](/build/platforms/platform-comparison/)
{: .related-pages-item-title }





[No single CHERI platform is best for every workload.](/build/platforms/platform-comparison/)
{: .related-pages-item-summary }



[Read this page](/build/platforms/platform-comparison/)
{: .source-card-label }





### [FPGA Platforms](/hardware/fpga-platforms/)
{: .related-pages-item-title }





[FPGA platforms put a CHERI processor and system design onto reconfigurable hardware.](/hardware/fpga-platforms/)
{: .related-pages-item-summary }



[Read this page](/hardware/fpga-platforms/)
{: .source-card-label }





### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Choose a platform, prepare an environment and run a first CHERI workload.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
