---
title: Answers - Compile and run RISC-V and CHERI-RISC-V programs
layout: source
permalink: /sources/cheri-alliance.github.io/html-pages/CHERI-seL4-Exercises/exercises/compile-and-run/answers.html
---

# [Answers - Compile and run RISC-V and CHERI-RISC-V programs](https://cheri-alliance.github.io/CHERI-seL4-Exercises/exercises/compile-and-run/answers.html#answers---compile-and-run-risc-v-and-cheri-risc-v-programs)
{: id="answers---compile-and-run-risc-v-and-cheri-risc-v-programs" }

This exercise explores the difference in size between addresses and
pointers, drawing attention to the pointer-focused nature of CHERI memory
protection.

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
