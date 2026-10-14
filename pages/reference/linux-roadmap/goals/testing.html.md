---
title: Testing - CHERI Roadmap for Linux
permalink: /reference/linux-roadmap/goals/testing.html
summary: null
image_url: null
updated_date: null
parent: /linux-roadmap/
next_page_url: null
related:
  pages: []
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

## Testing

- Topic: Linux Test Project; Type: Engineering; Description: This code may require adaptation to CHERI C, and may also require adaptation to OS-related changes in a CHERI-enabled environment. Ideally these will be run and pass well for both hybrid and CHERI-enabled ABIs.
- Topic: cheribsdtest; Type: Engineering; Description: Port over / adapt the CheriBSD test suite, which confirms properties such as suitable bounds setting during process setup, VM interactions with tagged memory, aspects of system-call argument handling, and various other properties we would like to hold true. This might become a cheritest (again) rather than being a cheribsdtest so as to maintain a common test suite over time?
