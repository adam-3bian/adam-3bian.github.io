---
title: Debugging Tools
where-next:
  url: /software/porting-status/
related-pages:
- url: /software/cheribsd/
  description: A full-system CHERI environment with capability-aware faults, tracing, core dumps, and developer tools.
  action: Read this page
- url: /groups/cheri-qemu/
  title: QEMU Working Group
  description: Alliance collaboration around maintained CHERI architecture and platform emulation.
  action: Read this page
- url: /hardware/cheriot/
  description: An embedded CHERI platform with compartment-aware firmware and diagnostic tooling.
  action: Read this page
---

1. Build
2. Software Ecosystem
3. Debugging Tools
{: .source-breadcrumbs }

# Debugging Tools
{: id="page-hero-title" .page-hero-title }

Understand CHERI faults and inspect capabilities alongside familiar program state.
{: .page-hero-summary }

CHERI adds information to pointers, including bounds, permissions and protected validity information. Capability-aware debugging tools make this state visible alongside familiar addresses, registers, variables, symbols and stack traces.

When CHERI prevents an invalid memory access, these tools can help developers understand what the program tried to do, which capability it used, and why the operation was rejected.

## Debugging capability faults
{: id="debugging-capability-faults" }

A CHERI capability fault occurs when software attempts an operation that is not permitted by the capability it is using.

Depending on the platform and tools, diagnostics may show information such as:

- the capability involved
- the attempted memory address and operation
- capability bounds
- permissions
- tag and sealing state
- the instruction that caused the fault
- the process, thread or compartment in which it occurred

This can make CHERI faults valuable during development: rather than allowing an invalid access to silently corrupt memory, the hardware can **stop** it at the point where protection is violated.

The exact diagnostics and terminology vary between CHERI platforms.

## GDB and LLDB
{: id="gdb-and-lldb" }

Capability-aware versions of GDB and LLDB extend familiar debugging workflows with support for CHERI capabilities.

Alongside source code, breakpoints, registers, memory and stack traces, supported debugger builds can expose capability registers and their associated bounds, permissions and state.

Debugger support depends on the target architecture, ABI and platform, so use the debugger supplied or recommended for your CHERI development environment.

## Debugging with QEMU
{: id="debugging-with-qemu" }

QEMU provides a convenient environment for investigating capability faults without requiring physical hardware.

It is particularly useful for:

- developing and debugging CHERI software
- reproducing capability faults
- remote debugging
- automated testing
- running tests consistently across development and continuous-integration environments

Because QEMU provides an architectural rather than physical implementation model, hardware-specific behaviour may require an FPGA or silicon platform.

## Operating-system and embedded diagnostics
{: id="operating-system-and-embedded-diagnostics" }

Different CHERI software environments integrate capability debugging in different ways.

- **CheriBSD** carries capability information through operating-system facilities such as faults, signals, core dumps and process debugging, providing an application-class environment for investigating CHERI software.
- **CHERI Linux** development similarly needs capability-aware kernel and user-space diagnostic support as the platform evolves.
- **CHERIoT** provides diagnostics in a compartment-oriented embedded environment, where faults can be investigated in the context of individual software compartments and the authority available to them.

## Inspecting binaries
{: id="inspecting-binaries" }

Debugging sometimes starts before the program runs. CHERI-aware binary tools can help developers inspect how capabilities are represented in compiled software.

Tools such as `llvm-readelf`, `llvm-objdump`, and `nm` can be used, with appropriate CHERI support, to examine areas such as symbols, sections, relocations, generated instructions and capability-related information in executable files.

These tools can be particularly useful when investigating compiler, linker, loader or ABI issues.

## Choosing debugging tools
{: id="choosing-debugging-tools" }

Capability-aware debugging is currently closely tied to the underlying CHERI architecture, ABI, operating system and software environment. A conventional debugger may be able to display the raw contents of a capability-sized value without understanding all of its CHERI-specific state.

## From fault to fix
{: id="from-fault-to-fix" }

CHERI changes an important part of the debugging experience: memory errors that might otherwise cause corruption or appear much later can instead become explicit capability faults.

Capability-aware diagnostics help developers trace those faults back to incorrect pointer use, insufficient authority or other software assumptions, making debugging tools an important part of the CHERI development environment.

## Project links
{: id="project-links" }

- [CHERI Alliance GDB](https://github.com/CHERI-Alliance/gdb)
- [CTSRD-CHERI GDB](https://github.com/CTSRD-CHERI/gdb)
- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild)
- [CHERIoT Programmer’s Guide](https://cheriot.org/book/)

## Where next
{: .where-next-title }

### [Porting Status](/software/porting-status/)
{: .where-next-card-title }





[Porting status varies across platforms, ABIs, operating systems, packages, and project revisions.](/software/porting-status/)
{: .where-next-summary }



[Continue](/software/porting-status/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CheriBSD](/software/cheribsd/)
{: .related-pages-item-title }





[A full-system CHERI environment with capability-aware faults, tracing, core dumps, and developer tools.](/software/cheribsd/)
{: .related-pages-item-summary }



[Read this page](/software/cheribsd/)
{: .source-card-label }





### [QEMU Working Group](/groups/cheri-qemu/)
{: .related-pages-item-title }





[Alliance collaboration around maintained CHERI architecture and platform emulation.](/groups/cheri-qemu/)
{: .related-pages-item-summary }



[Read this page](/groups/cheri-qemu/)
{: .source-card-label }





### [CHERIoT](/hardware/cheriot/)
{: .related-pages-item-title }





[An embedded CHERI platform with compartment-aware firmware and diagnostic tooling.](/hardware/cheriot/)
{: .related-pages-item-summary }



[Read this page](/hardware/cheriot/)
{: .source-card-label }
