---
title: Explore Subobject Bounds
permalink: /reference/CHERI-seL4-Exercises/exercises/subobject-bounds/index.html
summary: null
image_url: null
updated_date: null
parent: /CHERI-seL4-Exercises/
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

# Explore Subobject Bounds

In the CHERI-Microkit run-time environment, bounds are typically associated with memory region and mapped setvar\_vaddr allocations rather than C types. For example, if a memory region allocation is made for 1024 bytes, and the structure within it is 768 bytes, then the bounds associated with a pointer will be for the allocation size rather than the structure size.

## Subobject Overflows

With subobject bounds, enforcement occurs on C-language objects within allocations. This exercise is similar to earlier buffer-overflow exercises, but is for such an intra-object overflow. In our example, we consider an array within another structure, overflowing onto an integer in the same allocation.

1. Compile subobject-bounds.c with a baseline target and binary name of subobject-bounds-baseline, and with a CHERI-enabled target and binary name of subobject-bounds-cheri.

2. As in the prior exercises, run the binaries.

3. Explore why the CHERI binary didn't fail. Run subobject-bounds-cheri under gdb and examine the bounds of the buffer argument to fill\_buf(). To what do they correspond?

4. Recompile the subobject-bounds-cheri binary with the compiler flags -Xclang -cheri-bounds=subobject-safe.

5. Run the program to demonstrate that the buffer overflow is now caught.

6. Run the program under gdb and examine the bounds again. What has changed?

## Source Files

### Subobject Overflows

subobject-bounds.c

```c
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

struct buf {
	char buffer[128];
	int i;
} b;

#pragma weak fill_buf
void
fill_buf(char *buf, size_t len)
{
	for (size_t i = 0; i <= len; i++)
		buf[i] = 'b';
}

void
init(void)
{
	b.i = 'c';
	printf("b.i = %c\n", b.i);

	fill_buf(b.buffer, sizeof(b.buffer));

	printf("b.i = %c\n", b.i);
}

void notified(void){}

#include "asserts.inc"
```

asserts.inc

```c
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <stddef.h>

_Static_assert(sizeof(b.buffer) == offsetof(struct buf, i),
    "There must be no padding in struct buf between buffer and i members");
```
