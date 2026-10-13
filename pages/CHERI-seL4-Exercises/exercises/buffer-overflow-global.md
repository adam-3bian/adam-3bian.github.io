---
title: Exercise an inter-global-object buffer overflow
permalink: /CHERI-seL4-Exercises/exercises/buffer-overflow-global/
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

# Exercise an inter-global-object buffer overflow

This exercise demonstrates an inter-object buffer overflow on baseline and CHERI-enabled architectures, and asks you to characterize and fix the bug detected by CHERI bounds enforcement. It also asks you to use GDB for debugging purposes.

This example uses two global objects (in .data) to demonstrate an overflow. It is worth pondering how the bounds for pointers to globals come to be set!

Compile buffer-overflow-global.c for the baseline architecture to the binary buffer-overflow-global-baseline and for the CHERI-aware architecture to buffer-overflow-global-cheri.

For this exercise, add -G0 to your compiler flags (this ensures c is not placed in the small data section away from buffer).

Run both programs and observe the output.

Using GDB on the core dump (or run the CHERI program under gdb): Why has the CHERI program failed?

Modify buffer-overflow-global.c to increase the buffer size from 128 bytes to 1Mbyte + 1 byte.

Recompile and re-run buffer-overflow-global-cheri. Why does it no longer crash, even though the buffer overflow exists in the source code? Is the adjacent field still corrupted (i.e., has spatial safety been violated between allocations)?

Modify buffer-overflow-global.c to restore the original buffer size of 128 bytes, and fix the bug by correcting accesses to the allocated array.

Recompile and run buffer-overflow-global-cheri to demonstrate that the program is now able to continue.

## Source Files

buffer-overflow-global.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 SRI International

\*/

#include \<stdint.h\>

#include \<printf.h\>

struct globals {

char buffer\[128\];

char c;

};

struct globals globals;

#define buffer globals.buffer

#define c      globals.c

#pragma weak fill\_buf

void

fill\_buf(char \*buf, size\_t len)

{

for (size\_t i = 0; i \<= len; i++)

buf\[i\] = 'b';

}

#include "main-asserts.inc"

void

init(void)

{

(void)buffer;

main\_asserts();

c = 'c';

printf("c = %c\\n", c);

fill\_buf(buffer, sizeof(buffer));

printf("c = %c\\n", c);

}

void notified(){}

### Support code

main-asserts.inc

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 SRI International

\*/

#include \<sel4/assert.h\>

#include \<stddef.h\>

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

#include \<cheriintrin.h\>

#endif

#ifndef nitems

#define	nitems(x)	(sizeof((x)) / sizeof((x)\[0\]))

#endif

static void

main\_asserts(void)

{

/\*

\* Ensure that overflowing \`buffer\` by 1 will hit \`c\`.

\* In the pure-capabilty case, don't assert if the size of

\* \`buffer\` requires padding.

\*/

seL4\_Assert((ptraddr\_t)&buffer\[nitems(buffer)\] == (ptraddr\_t)&c

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

|| sizeof(buffer) \< cheri\_representable\_length(sizeof(buffer))

#endif

);

}
