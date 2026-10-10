---
title: Platform Comparison
permalink: /build/platforms/platform-comparison/
---

1. Build
2. Platforms
3. Platform Comparison
{: .source-breadcrumbs }

# Platform Comparison
{: id="page-hero-title" .page-hero-title }

Compare CHERI platforms by workload, architecture, operating system, access route, compartment model, and evidence rather than by name alone.
{: .page-hero-summary }

There is no single machine called “a CHERI platform”. CHERI appears in application processors, embedded cores, FPGA systems, formal simulators, and operating-system stacks. A useful comparison must name the complete environment.

## At-a-glance comparison
{: id="at-a-glance-comparison" }

- **CheriBSD in QEMU** is a local, application-class environment for 64-bit CHERI-RISC-V. It suits pure-capability learning, Unix application porting, and continuous integration without specialist hardware.
- **A Morello board** is an Arm application-class prototype that runs matching CheriBSD, LLVM/Clang, and Linux work. It suits Morello-specific evaluation and hardware measurements through a physical board or remote access.
- **CHERI Linux on supported RISC-V** combines an implementation-specific CHERI-RISC-V processor with a Linux kernel and supported user space. Access may be through an emulator, FPGA, or supplier board.
- **The CHERIoT simulator** runs 32-bit CHERIoT firmware and its compartmentalised real-time operating system (RTOS) locally. It suits embedded learning, automated tests, and memory-protection or compartment experiments.
- **Sonata** is a purchasable FPGA board for physical CHERIoT prototyping, peripheral integration, and firmware that has already been tested in simulation.
- **A general FPGA platform** may host a CHERI-RISC-V or CHERIoT core with a platform-specific operating system, RTOS, or bare-metal software. It suits processor development and hardware integration.
- **A commercial software development kit (SDK) and evaluation kit** provides a supplier-defined architecture, tools, supported software, and access route. It is the relevant path when product support and supply matter more than architecture exploration.

Availability and supported versions change. Use these descriptions to narrow the choice, then verify the current release with the project or supplier.

## Architecture is only one layer
{: id="architecture-is-only-one-layer" }

For a reproducible result, record:

- CHERI architecture and version
- processor implementation
- capability width and application binary interface (ABI)
- operating system or RTOS
- compiler and target system headers and libraries (sysroot)
- simulator, FPGA image, or silicon revision
- compartment and temporal-safety mechanisms

“CHERI-RISC-V” alone may describe several instruction-set versions and processor scales. “Morello” identifies a prototype architecture and platform, not every CHERI design. “CHERIoT” identifies a coordinated embedded hardware-software platform with its own instruction-set architecture (ISA) profile.

## Choose by workload
{: id="choose-by-workload" }

### Unix applications and libraries
{: id="unix-applications-and-libraries" }

Start with CheriBSD in QEMU when you need a complete pure-capability environment without hardware. It provides mature compiler, operating-system, ports, and debugging routes. Move to Morello or commercial CHERI-RISC-V hardware when performance or device integration matters.

### Linux-based products
{: id="linux-based-products" }

Use CHERI Linux and a matching processor SDK. Check the current kernel base, user-space scope, C library, supported devices, and roadmap. A CheriBSD binary or sysroot is not automatically compatible with Linux.

### Embedded firmware
{: id="embedded-firmware" }

Use CHERIoT when you want a compact RTOS, fine-grained compartments, and temporal-safety support designed together. Begin in the formal simulator, then move to Sonata or another supported hardware target.

Use CHERI-enabled Zephyr or another RTOS path when compatibility with that ecosystem is the main requirement. Compare current feature coverage and security model rather than the RTOS name alone.

### Processor and architecture work
{: id="processor-and-architecture-work" }

Formal Sail models are useful as executable architectural references. Register-transfer-level (RTL) simulation and FPGA platforms expose implementation behaviour. QEMU provides higher-speed system emulation for supported application stacks. A complete processor project normally uses more than one.

## Choose by evidence
{: id="choose-by-evidence" }

- **To check whether source compiles as pure capability,** use the matching SDK and system headers and libraries, known as a sysroot.
- **To check whether an invalid access causes an architectural fault,** use a formal simulator, QEMU, RTL simulation, FPGA, or silicon that implements the selected architecture.
- **To check whether a compartment lacks access to a secret,** use a platform with a documented compartment runtime and tests that attempt the denied access.
- **To check instruction behaviour,** consult the architecture specification and its executable formal model.
- **To measure performance or power,** use representative FPGA hardware or silicon, preferably the intended product platform.
- **To assess supply and support,** use current lifecycle and support information from the commercial supplier.

Simulator results should not be presented as silicon performance. Prototype-board results should not be generalised to a different processor implementation.

## A low-risk starting decision
{: id="a-low-risk-starting-decision" }

- Choose **CheriBSD in QEMU** for a first application-class port.
- Choose **CHERIoT in simulation** for first embedded or compartment work.
- Choose **Morello** for an existing Morello programme or Morello-specific evidence.
- Choose a **commercial SDK** when the goal is a product rather than architecture learning.

After the first functional result, repeat the experiment on the hardware and operating environment that matches the intended deployment.

## Where next
{: .where-next-title }

### [Morello](/hardware/morello/)
{: .where-next-card-title }





[Morello is an Arm-based CHERI technology demonstrator created for architecture and software research.](/hardware/morello/)
{: .where-next-summary }



[Continue](/hardware/morello/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Choose a platform, prepare an environment and run a first CHERI workload.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
