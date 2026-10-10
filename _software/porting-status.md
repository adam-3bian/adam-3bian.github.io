---
title: Porting Status
where-next:
  url: /adopt/business-case/the-business-case/
  title: The Business Case
related-pages:
- url: /software/debugging-tools/
  description: Capability-aware tools make faults, metadata, and binary structure visible within supported environments.
  action: Read this page
- url: /build/platforms/platform-comparison/
  description: Compare the hardware and simulation environments around current CHERI software stacks.
  action: Read this page
- url: /build/software-ecosystem/
  description: Return to the full overview of compilers, languages, operating systems, and tools.
  action: Read this page
---

1. Build
2. Software Ecosystem
3. Porting Status
{: .source-breadcrumbs }

# Porting Status
{: id="page-hero-title" .page-hero-title }

CHERI software support is reported by platform, architecture, ABI, operating system, package set, and project revision rather than by one ecosystem-wide percentage.
{: .page-hero-summary }

CHERI porting is not one centrally versioned programme. It spans processor architectures, compilers, operating systems, real-time environments, runtimes, applications, packages, emulators, and hardware platforms maintained by different projects.

## Why status varies
{: id="why-status-varies" }

A project can support capability instructions without providing a pure-capability application ABI. An operating system can boot before it has broad driver or package coverage. A library can compile while still depending on untested pointer assumptions. These are different forms of progress rather than steps on one universal scale.

Status claims also change with architecture revisions, toolchain branches, kernel versions, board support, and release processes.

## Current areas of public work
{: id="current-areas-of-public-work" }

- **CheriBSD** combines a capability-aware kernel, hybrid and pure-capability user space, developer tools, and a substantial history of third-party software ports.
- **CHERI Linux** spans kernel, user-space, toolchain, and platform work across active branches and processor environments.
- **CHERIoT** provides an embedded architecture, RTOS, compartment model, SDK, and growing application ecosystem designed together.
- **CHERI-enabled Zephyr and FreeRTOS** bring capability work into established embedded operating-system communities.
- **Rust and managed runtimes** extend CHERI beyond established C and C++ toolchains, with support varying between target projects.

## Where status is recorded
{: id="where-status-is-recorded" }

The most current information lives with the project that owns a branch, release, SDK, board configuration, package set, or test environment. Alliance Working Groups connect several of these projects and publish roadmaps, repositories, articles, and event updates where shared coordination is useful.

This page describes the structure of that landscape. Individual platform and software pages link to the corresponding public project records.

## Where next
{: .where-next-title }

### [The Business Case](/adopt/business-case/the-business-case/)
{: .where-next-card-title }





[The business case places software maturity alongside security, engineering, lifecycle, and strategic considerations.](/adopt/business-case/the-business-case/)
{: .where-next-summary }



[Continue](/adopt/business-case/the-business-case/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Debugging Tools](/software/debugging-tools/)
{: .related-pages-item-title }





[Capability-aware tools make faults, metadata, and binary structure visible within supported environments.](/software/debugging-tools/)
{: .related-pages-item-summary }



[Read this page](/software/debugging-tools/)
{: .source-card-label }





### [Platform Comparison](/build/platforms/platform-comparison/)
{: .related-pages-item-title }





[Compare the hardware and simulation environments around current CHERI software stacks.](/build/platforms/platform-comparison/)
{: .related-pages-item-summary }



[Read this page](/build/platforms/platform-comparison/)
{: .source-card-label }





### [Software Ecosystem](/build/software-ecosystem/)
{: .related-pages-item-title }





[Return to the full overview of compilers, languages, operating systems, and tools.](/build/software-ecosystem/)
{: .related-pages-item-summary }



[Read this page](/build/software-ecosystem/)
{: .source-card-label }
