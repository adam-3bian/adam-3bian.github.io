---
layout: page
title: Answers - Compile and run RISC-V and CHERI-RISC-V programs
summary: 'This exercise explores the difference in size between addresses and

  pointers, drawing attention to the pointer-focused nature of CHERI memory

  protection.'
permalink: /reference/CHERI-seL4-Exercises/exercises/compile-and-run/answers.html
slug: reference-cheri-sel4-exercises-exercises-compile-and-run-answers
navigation:
  header:
    category: Discover CHERI
    subcategory: Resources
---

## Overview

2. Expected output:

~~~
# run_qemu ./print-pointer-riscv
...
size of pointer: 8
size of address: 8
~~~

4. Expected output:

~~~
# run_qemu ./print-pointer-cheri
...
size of pointer: 16
size of address: 8
~~~

6. Expected output:

~~~
...
# run_qemu ./print-capability
cap to int length: 4
cap to cap length: 16
~~~
