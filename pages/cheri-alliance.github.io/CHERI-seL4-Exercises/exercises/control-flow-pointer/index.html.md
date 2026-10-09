---
title: Corrupt a control-flow pointer using a subobject buffer overflow
layout: source
permalink: /sources/cheri-alliance.github.io/html-pages/CHERI-seL4-Exercises/exercises/control-flow-pointer/index.html
---

# [Corrupt a control-flow pointer using a subobject buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/exercises/control-flow-pointer/index.html#corrupt-a-control-flow-pointer-using-a-subobject-buffer-overflow)
{: id="corrupt-a-control-flow-pointer-using-a-subobject-buffer-overflow" }

This exercise demonstrates how CHERI pointer integrity protection prevents
a function pointer overwritten with data due to a buffer overflow from being
used for further memory access.

1. Compile `control-flow-pointer.c` with a RISC-V target and binary name
   of `control-flow-pointer-riscv`, and a CHERI-RISC-V target and binary
   name of `control-flow-pointer-cheri`. Do not enable compilation with
   subobject bounds protection when compiling with the CHERI-RISC-V target.

**control-flow-pointer.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

struct buf {
	size_t length;
	int buffer[30];
	size_t (*callback)(struct buf *);
};

void
fill_buf(struct buf *bp)
{
	bp->length = sizeof(bp->buffer)/sizeof(*bp->buffer);
	for (size_t i = 0; i <= bp->length; i++)
		bp->buffer[i] = 0xAAAAAAAA;
}

size_t
count_screams(struct buf *bp)
{
	int screams = 0;

	for (size_t i = 0; i < bp->length; i++)
		screams += bp->buffer[i] == 0xAAAAAAAA ? 1 : 0;
	return screams;
}

struct buf b = {.callback = count_screams};

void
init(void)
{
	fill_buf(&b);

	printf("Words of screaming in b.buffer %zu\n", b.callback(&b));
}

void notified(void) {}

#include "asserts.inc"
~~~

2. Run the RISC-V program under QEMU; why does it crash?
3. Run the CHERI-RISC-V program under QEMU; why does it crash?

## [Support code](https://cheri-alliance.github.io/CHERI-seL4-Exercises/exercises/control-flow-pointer/index.html#support-code)
{: id="support-code" }

**asserts.inc**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <stddef.h>

_Static_assert(offsetof(struct buf, buffer) + sizeof(b.buffer) ==
    offsetof(struct buf, callback),
    "There must be no padding between buffer and callback members");
~~~
