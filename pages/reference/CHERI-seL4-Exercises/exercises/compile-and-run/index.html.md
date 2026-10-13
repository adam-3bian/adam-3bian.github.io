---
title: Compile and run RISC-V and CHERI-RISC-V programs
permalink: /reference/CHERI-seL4-Exercises/exercises/compile-and-run/index.html
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

# Compile and run RISC-V and CHERI-RISC-V programs

This exercise steps you through getting up and running with code compilation and execution for RISC-V and CHERI-RISC-V programs.

The first test program is written in conventional C, and can be compiled to RISC-V or CHERI-RISC-V targets:

1. Compile print-pointer.c with a RISC-V target and a binary name of print-pointer-riscv.

print-pointer.c:

```c
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

void
init(void)
{
	printf("size of pointer: %zu\n", sizeof(void *));
	/* XXX: ideally we'd use ptraddr_t below */
	printf("size of address: %zu\n", sizeof(size_t));
}

void notified(void){}
```

2. Run the binary.

3. Compile print-pointer.c with a CHERI-RISC-V target and a binary name of print-pointer-cheri.

4. Run the binary: it should print a pointer size of 16 and address size of 8.

The second test program is written in CHERI C:

5. Compile print-capability.c with a CHERI-RISC-V target and a binary name of print-capability.

```c
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

void
init(void)
{
	int i;
	char *c;
	void *cap_to_int = &i;
	void *cap_to_cap = &c;

	printf("cap to int length: %lu\n", __builtin_cheri_length_get(cap_to_int));
	printf("cap to cap length: %lu\n", __builtin_cheri_length_get(cap_to_cap));
}

void notified(void){}
```

6. Run the binary: note how the length of the capability depends on the size of the type it points to.
