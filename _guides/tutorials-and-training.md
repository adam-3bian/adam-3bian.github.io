---
title: Tutorials & Training
where-next:
  url: /guides/downloads/
related-pages:
- url: /guides/port-existing-software/
  description: Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.
  action: Read this page
- url: /guides/choose-a-platform/
  title: Choose a Platform
  description: Choose a platform, prepare an environment and run a first CHERI workload.
  action: Read this page
---

1. Build
2. Developers
3. Tutorials &amp; Training
{: .source-breadcrumbs }

# Tutorials &amp; Training
{: id="page-hero-title" .page-hero-title }

Follow maintained tutorials that match your platform, then progress from first builds to porting, compartments, debugging, and assurance.
{: .page-hero-summary }

CHERI spans hardware, compilers, operating systems, C and C++ semantics, and security architecture. A staged path connects these layers to practical work without requiring them all in the first exercise. Begin with one maintained platform and add concepts as the experiments need them.

## Recommended learning path
{: id="recommended-learning-path" }

### 1. Understand the problem
{: id="1-understand-the-problem" }

Begin with:

- [Vulnerabilities in Everyday Technology](/discover/why-cheri/vulnerabilities-in-everyday-technology/)
- [Why Existing Defences Are Not Enough](/discover/why-cheri/why-existing-defences-are-not-enough/)
- [Capabilities](/build/technology/capabilities/)

A useful outcome from this stage is the ability to explain bounds, permissions, tags, and least privilege without referring to a particular processor.

### 2. Run a prepared environment
{: id="2-run-a-prepared-environment" }

Use [Run CHERI in Simulation](/guides/run-cheri-in-simulation/) to boot CheriBSD in QEMU or run a CHERIoT example. Getting a supplied example working first gives later toolchain changes a known reference point.

Success means you can reproduce the build, name the architecture and application binary interface (ABI), and capture one deliberate capability fault.

### 3. Build and inspect code
{: id="3-build-and-inspect-code" }

Complete [Build Your First Application](/guides/build-your-first-application/). Inspect the binary or firmware image with the target tools. Use the debugger to view a capability and identify its address, bounds, permissions, and tag.

### 4. Port existing software
{: id="4-port-existing-software" }

Choose a small library with tests. Classify each change rather than patching until it compiles. Typical categories are pointer-integer conversions, object bounds, custom allocation, serialisation, inline assembly, and ABI boundaries.

### 5. Introduce a compartment
{: id="5-introduce-a-compartment" }

Move a parser or similarly narrow component behind a capability interface. Document what it receives and prove that it cannot reach an unrelated object or service.

## Maintained technical resources
{: id="maintained-technical-resources" }

### General CHERI and CheriBSD
{: id="general-cheri-and-cheribsd" }

- [CHERI Frequently Asked Questions](https://ctsrd-cheri.github.io/cheri-faq/) covers architecture, software, Morello, and CHERI-RISC-V questions.
- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild) documents build targets for compilers, QEMU, CheriBSD, software development kits (SDKs), ports, and debugging tools.
- [CheriBSD Getting Started](https://www.cheribsd.org/getting-started/) provides versioned guides for installing images, using hardware or emulation, compiling software, and benchmarking.
- The [University of Cambridge CHERI project](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/) links architecture reports, programming guides, publications, and source repositories.

### CHERIoT
{: id="cheriot" }

- The [CHERIoT Programmer’s Guide](https://cheriot.org/book/) teaches the platform from architecture concepts through threads, memory management, compartments, drivers, networking, auditing, and board support.
- The [CHERIoT getting-started chapter](https://cheriot.org/book/getting_started.html) covers the real-time operating-system (RTOS) repository, development container, simulator, and hardware targets.
- The [`cheriot-rtos` repository](https://github.com/CHERIoT-Platform/cheriot-rtos) includes examples, exercises, SDK code, and the issue tracker.
- The [CHERIoT project site](https://cheriot.org/) links current releases, community discussions, hardware, and articles.

### Linux, Zephyr, and ecosystem projects
{: id="linux-zephyr-and-ecosystem-projects" }

- The [CHERI Linux roadmap](/linux-roadmap/) describes the cross-architecture path for kernel and user-space support.
- The [CHERI Alliance GitHub organisation](https://github.com/CHERI-Alliance) hosts Linux, Zephyr, QEMU, debugger, and other collaborative repositories.
- [CHERI Alliance Working Groups](/alliance/leadership/working-groups/) describe the Alliance’s regular technical collaboration.

## Training for teams
{: id="training-for-teams" }

A useful team workshop should produce artifacts, not only slides. Ask participants to deliver:

- a reproducible environment description
- one valid program and one controlled fault
- a capability inspection from the debugger
- a short porting log with root-cause categories
- a proposed compartment boundary and authority map
- open questions tied to the intended product

Separate introductory learning from product assurance. A tutorial can show the mechanism, while an assurance claim needs a named architecture, implementation, build, workload, and threat model.

## Check material before relying on it
{: id="check-material-before-relying-on-it" }

CHERI toolchains and target names evolve. Prefer documentation versioned with the source or release you are using. When following a conference recording or older tutorial:

1. note its date and target architecture
2. compare commands with the current repository
3. avoid mixing Morello, generic CHERI-RISC-V, and CHERIoT flags
4. record any changes needed to reproduce the exercise

That reproduction log is useful learning in its own right and helps improve the documentation for the next developer.

## Where next
{: .where-next-title }

### [Downloads](/guides/downloads/)
{: .where-next-card-title }





[Find maintained source code, development kits, simulators, operating systems, documentation, and examples for the selected platform.](/guides/downloads/)
{: .where-next-summary }



[Continue](/guides/downloads/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Port Existing Software](/guides/port-existing-software/)
{: .related-pages-item-title }





[Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.](/guides/port-existing-software/)
{: .related-pages-item-summary }



[Read this page](/guides/port-existing-software/)
{: .source-card-label }





### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Choose a platform, prepare an environment and run a first CHERI workload.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
