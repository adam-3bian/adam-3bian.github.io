---
title: Answers - Compile and run RISC-V and CHERI-RISC-V programs
permalink: /reference/CHERI-seL4-Exercises/exercises/compile-and-run/answers.html
summary: null
image_url: null
updated_date: null
parent: /CHERI-seL4-Exercises/
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

# Answers - Compile and run RISC-V and CHERI-RISC-V programs

This exercise explores the difference in size between addresses and pointers, drawing attention to the pointer-focused nature of CHERI memory protection.

Expected output:

\# run\_qemu ./print-pointer-riscv

...

size of pointer: 8

size of address: 8

Expected output:

\# run\_qemu ./print-pointer-cheri

...

size of pointer: 16

size of address: 8

Expected output:

...

\# run\_qemu ./print-capability

cap to int length: 4

cap to cap length: 16
