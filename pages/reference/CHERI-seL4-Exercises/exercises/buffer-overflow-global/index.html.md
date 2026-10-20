---
title: Exercise an inter-global-object buffer overflow
permalink: /reference/CHERI-seL4-Exercises/exercises/buffer-overflow-global/index.html
---

This exercise demonstrates an inter-object buffer overflow on baseline and
CHERI-enabled architectures, and asks you to characterize and fix the bug
detected by CHERI bounds enforcement. It also asks you to use GDB for
debugging purposes.

This example uses two *global* objects (in `.data`) to demonstrate an overflow.
It is worth pondering how the bounds for pointers to globals come to be set!

1. Compile `buffer-overflow-global.c` for the baseline architecture to
   the binary `buffer-overflow-global-baseline` and for the CHERI-aware
   architecture to `buffer-overflow-global-cheri`.

   **For this exercise, add `-G0` to your
   compiler flags** (this ensures `c` is not placed in the small data section
   away from `buffer`).
2. Run both programs and observe the output.
3. Using GDB on the core dump (or run the CHERI program under `gdb`):
   Why has the CHERI program failed?
4. Modify `buffer-overflow-global.c` to increase the buffer size from 128 bytes
   to 1Mbyte + 1 byte.
5. Recompile and re-run `buffer-overflow-global-cheri`. Why does it no longer
   crash, even though the buffer overflow exists in the source code? Is
   the adjacent field still corrupted (i.e., has spatial safety been
   violated between allocations)?
6. Modify `buffer-overflow-global.c` to restore the original buffer size of 128
   bytes, and fix the bug by correcting accesses to the allocated array.
7. Recompile and run `buffer-overflow-global-cheri` to demonstrate that the
   program is now able to continue.

## [Source Files](/reference/CHERI-seL4-Exercises/exercises/buffer-overflow-global/index.html#source-files)
{: id="source-files" }

**buffer-overflow-global.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <stdint.h>
#include <printf.h>

struct globals {
    char buffer[128];
    char c;
};

struct globals globals;

#define buffer globals.buffer
#define c      globals.c

#pragma weak fill_buf
void
fill_buf(char *buf, size_t len)
{
	for (size_t i = 0; i <= len; i++)
		buf[i] = 'b';
}

#include "main-asserts.inc"

void
init(void)
{
	(void)buffer;
	main_asserts();

	c = 'c';
	printf("c = %c\n", c);

	fill_buf(buffer, sizeof(buffer));

	printf("c = %c\n", c);
}

void notified(){}
~~~

### [Support code](/reference/CHERI-seL4-Exercises/exercises/buffer-overflow-global/index.html#support-code)
{: id="support-code" }

**main-asserts.inc**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <sel4/assert.h>
#include <stddef.h>
#ifdef __CHERI_PURE_CAPABILITY__
#include <cheriintrin.h>
#endif

#ifndef nitems
#define	nitems(x)	(sizeof((x)) / sizeof((x)[0]))
#endif

static void
main_asserts(void)
{
	/*
	 * Ensure that overflowing `buffer` by 1 will hit `c`.
	 * In the pure-capabilty case, don't assert if the size of
	 * `buffer` requires padding.
	 */
	seL4_Assert((ptraddr_t)&buffer[nitems(buffer)] == (ptraddr_t)&c
#ifdef __CHERI_PURE_CAPABILITY__
	    || sizeof(buffer) < cheri_representable_length(sizeof(buffer))
#endif
	    );
}
~~~
