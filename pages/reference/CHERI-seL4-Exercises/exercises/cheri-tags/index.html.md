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
  groups: []
  news: []
  events: []
  papers: []
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

uint8\_t \*q = (uint8\_t\*)(((uintptr\_t)p.ptr) & \~0xFF);

and the byte-wise mutation of p.ptr to construct r,

p.bytes\[0\] = 0;

uint8\_t \*r = p.ptr;

in both baseline and CHERI-enabled programs.

What stands out?

Given that q and r appear to have identical byte representation in memory, why does the CHERI version crash when dereferencing r?

## Source

cheri-tags.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause

\* Copyright (c) 2022 Microsoft Corporation

\*/

#include \<stdint.h\>

#include \<printf.h\>

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

#include \<cheri.h\>

#define PRINTF\_PTR "#p"

#else

#define PRINTF\_PTR "p"

#endif

void

init(void)

{

char buf\[0x1FF\];

volatile union {

char \*ptr;

char bytes\[sizeof(char\*)\];

} p;

for (size\_t i = 0; i \< sizeof(buf); i++) {

buf\[i\] = i;

}

p.ptr = &buf\[0x10F\];

printf("buf=%" PRINTF\_PTR " &p=%" PRINTF\_PTR "\\n", buf, &p);

printf("p.ptr=%" PRINTF\_PTR " (0x%zx into buf) \*p.ptr=%02x\\n",

p.ptr, p.ptr - buf, \*p.ptr);

/\* One way to align the address down \*/

char \*q = (char\*)(((uintptr\_t)p.ptr) & \~0xFF);

printf("q=%" PRINTF\_PTR " (0x%zx into buf)\\n", q, q - buf);

printf("\*q=%02x\\n", \*q);

/\* Maybe another, assuming a little-endian machine. \*/

p.bytes\[0\] = 0;

char \*r = p.ptr;

printf("r=%" PRINTF\_PTR " (0x%zx)\\n", r, r - buf);

printf("\*r=%02x\\n", \*r);

}

void notified(void){}
