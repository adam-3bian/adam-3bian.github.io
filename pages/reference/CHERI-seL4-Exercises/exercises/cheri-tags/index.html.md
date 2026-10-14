---
title: Demonstrate CHERI Tag Protection
permalink: /reference/CHERI-seL4-Exercises/exercises/cheri-tags/index.html
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

# Demonstrate CHERI Tag Protection

This exercise demonstrates CHERI's capability provenance tags, in particular by showing that capabilities and their constituent bytes are subtly different things!

Compile cheri-tags.c for the baseline architecture to the binary cheri-tags-baseline and for the CHERI-aware architecture to cheri-tags-cheri.

Run both programs and observe the output.

Inspect the error thrown to the CHERI program, and the registers dump.

Examine the disassembly of the construction of q,

`uint8_t *q = (uint8_t*)(((uintptr_t)p.ptr) & ~0xFF);`

and the byte-wise mutation of p.ptr to construct r,

```text
p.bytes[0] = 0;
uint8_t *r = p.ptr;
```

in both baseline and CHERI-enabled programs.

What stands out?

Given that q and r appear to have identical byte representation in memory, why does the CHERI version crash when dereferencing r?

## Source

cheri-tags.c

```c
/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (c) 2022 Microsoft Corporation
 */
#include <stdint.h>
#include <printf.h>

#ifdef __CHERI_PURE_CAPABILITY__
#include <cheri.h>
#define PRINTF_PTR "#p"
#else
#define PRINTF_PTR "p"
#endif

void
init(void)
{
	char buf[0x1FF];

	volatile union {
		char *ptr;
		char bytes[sizeof(char*)];
	} p;

	for (size_t i = 0; i < sizeof(buf); i++) {
		buf[i] = i;
	}
	p.ptr = &buf[0x10F];

	printf("buf=%" PRINTF_PTR " &p=%" PRINTF_PTR "\n", buf, &p);
	printf("p.ptr=%" PRINTF_PTR " (0x%zx into buf) *p.ptr=%02x\n",
	    p.ptr, p.ptr - buf, *p.ptr);

	/* One way to align the address down */
	char *q = (char*)(((uintptr_t)p.ptr) & ~0xFF);
	printf("q=%" PRINTF_PTR " (0x%zx into buf)\n", q, q - buf);

	printf("*q=%02x\n", *q);

	/* Maybe another, assuming a little-endian machine. */
	p.bytes[0] = 0;
	char *r = p.ptr;

	printf("r=%" PRINTF_PTR " (0x%zx)\n", r, r - buf);
	printf("*r=%02x\n", *r);
}

void notified(void){}
```
