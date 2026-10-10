---
title: Testing - CHERI Roadmap for Linux
permalink: /reference/linux-roadmap/goals/testing.html
---

## [Testing](/reference/linux-roadmap/goals/testing.html#testing)
{: id="testing" }

| Topic | Type | Description |
| --- | --- | --- |
| Linux Test Project | Engineering | This code may require adaptation to CHERI C, and may also require adaptation to OS-related changes in a CHERI-enabled environment. Ideally these will be run and pass well for both hybrid and CHERI-enabled ABIs. |
| cheribsdtest | Engineering | Port over / adapt the CheriBSD test suite, which confirms properties such as suitable bounds setting during process setup, VM interactions with tagged memory, aspects of system-call argument handling, and various other properties we would like to hold true. This might become a cheritest (again) rather than being a cheribsdtest so as to maintain a common test suite over time? |
