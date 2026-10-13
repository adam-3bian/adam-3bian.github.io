---
title: Exercise an inter-stack-object buffer overflow
permalink: /reference/CHERI-seL4-Exercises/exercises/buffer-overflow-stack/index.html
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

# Exercise an inter-stack-object buffer overflow

This exercise demonstrates an inter-object buffer overflow on baseline and CHERI-enabled architectures, and asks you to characterize and fix the bug detected by CHERI bounds enforcement. It also asks you to use GDB for debugging purposes.

By contrast to the globals-based example, this example uses two stack objects to demonstrate the overflow. We will be able to see the CHERI C compiler generate code to apply spatial bounds on the capability used for the buffer pointer we pass around.

Compile buffer-overflow-stack.c for the baseline architecture to the binary buffer-overflow-stack-baseline and for the CHERI-aware architecture to buffer-overflow-stack-cheri.

Run both programs and observe their outputs.

Using GDB and/or the Monitor's error messages: Why has the CHERI program failed?

Compare and contrast the disassembly of the baseline and CHERI programs. In particular, focus on the write\_buf function and init's call to it and the information flow leading up to it.

## Source

buffer-overflow-stack.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause

\* Copyright (c) 2022 Microsoft Corporation

\*/

#include \<stddef.h\>

#include \<printf.h\>

#include \<sel4/assert.h\>

#pragma weak write\_buf

void

write\_buf(char \*buf, size\_t ix)

{

buf\[ix\] = 'b';

}

void

init(void)

{

char upper\[0x10\];

char lower\[0x10\];

printf("upper = %p, lower = %p, diff = %zx\\n",

upper, lower, (size\_t)(upper - lower));

/\* Assert that these get placed how we expect \*/

seL4\_Assert((ptraddr\_t)upper == (ptraddr\_t)&lower\[sizeof(lower)\]);

upper\[0\] = 'a';

printf("upper\[0\] = %c\\n", upper\[0\]);

write\_buf(lower, sizeof(lower));

printf("upper\[0\] = %c\\n", upper\[0\]);

}

void notified(){}
