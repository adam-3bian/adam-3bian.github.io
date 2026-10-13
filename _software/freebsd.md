---
title: FreeBSD
image_url: /assets/software/freebsd/placeholder.svg
website_url: https://www.freebsd.org/
repository_urls:
- https://github.com/CTSRD-CHERI/cheribsd
type: null
status: null
related:
  organisations: []
  hardware: []
  software:
  - cheribsd
  - real-time-operating-systems
---

# FreeBSD

FreeBSD provides the upstream operating-system foundation from which [CheriBSD](/software/cheribsd/) develops application-class CHERI support.

FreeBSD is the general-purpose operating system on which CheriBSD is based. Its kernel, C library, runtime linker, command-line tools, ports framework, filesystems, and network stack provide the software foundation for much of the application-class CHERI work.

## FreeBSD and CheriBSD

CheriBSD maintains the substantial architecture, ABI, kernel, library, and tool changes needed for CHERI. It follows FreeBSD development closely enough for generally useful improvements to move between the projects, while experimental capability work can develop without requiring every change to be part of a standard FreeBSD release.

This relationship gives CHERI a mature Unix codebase and exposes capability pointers to large quantities of existing systems software.

## Upstream value

Work prompted by CHERI can reveal assumptions about pointer representation, integer casts, object bounds, interfaces, and portability. Some resulting fixes are useful to FreeBSD and other platforms even when they are not CHERI-specific.

FreeBSD also provides established project governance, review practice, continuous integration, release engineering, and a large third-party ports ecosystem around the CHERI-specific research.

## Current boundary

Complete CHERI support remains in CheriBSD rather than a stock FreeBSD release. The two names therefore describe related but distinct software environments: FreeBSD is the upstream foundation, and CheriBSD is the CHERI-enabled derivative.

## Project links

- [FreeBSD Project](https://www.freebsd.org/)
- [CheriBSD source](https://github.com/CTSRD-CHERI/cheribsd)
- [CheriBSD overview](/software/cheribsd/)
