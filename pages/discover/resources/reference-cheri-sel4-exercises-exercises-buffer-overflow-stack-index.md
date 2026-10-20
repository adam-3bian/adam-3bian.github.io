---
layout: page
title: Exercise an inter-stack-object buffer overflow
summary: 'This exercise demonstrates an inter-object buffer overflow on baseline and

  CHERI-enabled architectures, and asks you to characterize and fix the bug

  detected by CHERI bounds enforcement. It also asks you to use GDB for

  debugging purposes.'
permalink: /reference/CHERI-seL4-Exercises/exercises/buffer-overflow-stack/index.html
slug: reference-cheri-sel4-exercises-exercises-buffer-overflow-stack-index
navigation:
  header:
    category: Discover CHERI
    subcategory: Resources
---

## Overview

By contrast to [the globals-based example](/CHERI-seL4-Exercises/exercises/buffer-overflow-global/), this
example uses two *stack* objects to demonstrate the overflow. We will be able
to see the CHERI C compiler generate code to apply spatial bounds on the
capability used for the buffer pointer we pass around.

1. Compile `buffer-overflow-stack.c` for the baseline architecture to
   the binary `buffer-overflow-stack-baseline` and for the CHERI-aware
   architecture to `buffer-overflow-stack-cheri`.
2. Run both programs and observe their outputs.
3. Using GDB and/or the Monitor's error messages:
   Why has the CHERI program failed?
4. Compare and contrast the disassembly of the baseline and CHERI programs.
   In particular, focus on the `write_buf` function and `init`'s call to it
   and the information flow leading up to it.

## [Source](/reference/CHERI-seL4-Exercises/exercises/buffer-overflow-stack/index.html#source)

**buffer-overflow-stack.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (c) 2022 Microsoft Corporation
 */
#include <stddef.h>
#include <printf.h>
#include <sel4/assert.h>

#pragma weak write_buf
void
write_buf(char *buf, size_t ix)
{
	buf[ix] = 'b';
}

void
init(void)
{
	char upper[0x10];
	char lower[0x10];

	printf("upper = %p, lower = %p, diff = %zx\n",
	    upper, lower, (size_t)(upper - lower));

	/* Assert that these get placed how we expect */
	seL4_Assert((ptraddr_t)upper == (ptraddr_t)&lower[sizeof(lower)]);

	upper[0] = 'a';
	printf("upper[0] = %c\n", upper[0]);

	write_buf(lower, sizeof(lower));

	printf("upper[0] = %c\n", upper[0]);
}

void notified(){}
~~~
