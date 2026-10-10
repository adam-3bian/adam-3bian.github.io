---
title: FreeBSD
---

1. Build
2. Software Ecosystem
3. FreeBSD
{: .source-breadcrumbs }

# FreeBSD
{: id="page-hero-title" .page-hero-title }

FreeBSD provides the upstream operating-system foundation from which CheriBSD develops application-class CHERI support.
{: .page-hero-summary }

FreeBSD is the general-purpose operating system on which CheriBSD is based. Its kernel, C library, runtime linker, command-line tools, ports framework, filesystems, and network stack provide the software foundation for much of the application-class CHERI work.

## FreeBSD and CheriBSD
{: id="freebsd-and-cheribsd" }

CheriBSD maintains the substantial architecture, ABI, kernel, library, and tool changes needed for CHERI. It follows FreeBSD development closely enough for generally useful improvements to move between the projects, while experimental capability work can develop without requiring every change to be part of a standard FreeBSD release.

This relationship gives CHERI a mature Unix codebase and exposes capability pointers to large quantities of existing systems software.

## Upstream value
{: id="upstream-value" }

Work prompted by CHERI can reveal assumptions about pointer representation, integer casts, object bounds, interfaces, and portability. Some resulting fixes are useful to FreeBSD and other platforms even when they are not CHERI-specific.

FreeBSD also provides established project governance, review practice, continuous integration, release engineering, and a large third-party ports ecosystem around the CHERI-specific research.

## Current boundary
{: id="current-boundary" }

Complete CHERI support remains in CheriBSD rather than a stock FreeBSD release. The two names therefore describe related but distinct software environments: FreeBSD is the upstream foundation, and CheriBSD is the CHERI-enabled derivative.

## Project links
{: id="project-links" }

- [FreeBSD Project](https://www.freebsd.org/)
- [CheriBSD source](https://github.com/CTSRD-CHERI/cheribsd)
- [CheriBSD overview](/software/cheribsd/)

## Where next
{: .where-next-title }

### [CHERI Linux](/software/cheri-linux/)
{: .where-next-card-title }





[CHERI Linux brings capability support to a different general-purpose operating-system ecosystem.](/software/cheri-linux/)
{: .where-next-summary }



[Continue](/software/cheri-linux/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CheriBSD](/software/cheribsd/)
{: .related-pages-item-title }





[The FreeBSD-derived operating system containing the complete CHERI kernel and user-space environment.](/software/cheribsd/)
{: .related-pages-item-summary }



[Read this page](/software/cheribsd/)
{: .source-card-label }





### [Real-Time Operating Systems](/software/real-time-operating-systems/)
{: .related-pages-item-title }





[Compare the embedded and real-time operating-system routes being explored across CHERI.](/software/real-time-operating-systems/)
{: .related-pages-item-summary }



[Read this page](/software/real-time-operating-systems/)
{: .source-card-label }
