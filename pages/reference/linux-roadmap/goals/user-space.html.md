---
title: User space support - CHERI Roadmap for Linux
permalink: /reference/linux-roadmap/goals/user-space.html
summary: null
image_url: null
updated_date: null
parent: /linux-roadmap/
next_page_url: null
related:
  pages: []
  people: []
  organisations: []
  groups: []
  news: []
  events: []
  papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

## User space support

- Topic: Dynamic linker c18n; Type: Research; Description: A significant focus of recent CHERI software research, this feature allows dynamically linked binaries and libraries to be placed in affordable sandboxes. It requires modest kernel changes combined with substantial run-time linker work, as well as testing and validation. There has not yet been a feasibility study for this feature in Linux.
- Topic: glibc; Type: Engineering; Description: Similar to the Linux kernel, this will require substantial porting work to use CHERI’s features in the CheriABI process environment, as well as implement user space portions of temporal safety and library compartmentalisation. Ports of FreeBSD’s libc, bionic, musl, and newlib have demonstrated paths forward, and initial porting work of glibc on Morello has been performed. We need to come to consensus on the changes required, document them (e.g., produce an annotated POSIX spec), and bring these ideas to glibc.
- Topic: Libraries + applications; Type: Engineering; Description: There is a significant overlap between Linux and FreeBSD in 10,000 open source packages that have already been ported to CheriBSD. Some of the fixes to these packages for CHERI are generally useful (good pointer hygiene) and have been contributed back upstream. The fixes that aren’t pushed upstream are maintained as forks, so the patchsets are available to be reused on the Linux packages of the same open source project. More porting work will be necessary for the subset of packages that are unique to Linux. The CheriBSD work has also been mostly focused on the desktop use case, so the server and embedded use cases will require expanding the set of packages ported to both CheriBSD and Linux.
