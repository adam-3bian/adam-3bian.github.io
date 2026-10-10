---
title: Exercise integer-pointer type confusion bug
permalink: /reference/CHERI-seL4-Exercises/exercises/type-confusion/index.html
---

# [Exercise integer-pointer type confusion bug](/reference/CHERI-seL4-Exercises/exercises/type-confusion/index.html#exercise-integer-pointer-type-confusion-bug)
{: id="exercise-integer-pointer-type-confusion-bug" }

This exercise demonstrates how CHERI distinguishes between integer and pointer
types, preventing certain types of type confusion.
In this example, a union allows an integer value to be used as a pointer,
which cannot then be dereferenced.

1. Compile `type-confusion.c` with a RISC-V target and binary name of
   `type-confusion-riscv`, and with a CHERI-RISC-V target and binary name
   `type-confusion-cheri`.

**type-confusion.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

const char hello[] = "Hello World!";

union long_ptr {
	long l;
	const char *ptr;
} lp = { .ptr = hello };

void
inc_long_ptr(union long_ptr *lpp)
{
	lpp->l++;
}

void
init(void)
{
	printf("lp.ptr %s\n", lp.ptr);
	inc_long_ptr(&lp);
	printf("lp.ptr %s\n", lp.ptr);
}

void notified(void){}
~~~

2. Run the RISC-V program. What is the result?
3. Run the CHERI-RISC-V program. What is the result?
   Run under QEMU and `gdb` and explain why the program crashes in the second `printf`.
