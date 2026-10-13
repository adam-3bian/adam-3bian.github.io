---
title: Corrupt a control-flow pointer using a subobject buffer overflow
permalink: /reference/CHERI-seL4-Exercises/exercises/control-flow-pointer/index.html
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

# Corrupt a control-flow pointer using a subobject buffer overflow

This exercise demonstrates how CHERI pointer integrity protection prevents a function pointer overwritten with data due to a buffer overflow from being used for further memory access.

Compile control-flow-pointer.c with a RISC-V target and binary name of control-flow-pointer-riscv, and a CHERI-RISC-V target and binary name of control-flow-pointer-cheri. Do not enable compilation with subobject bounds protection when compiling with the CHERI-RISC-V target.

control-flow-pointer.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 SRI International

\*/

#include \<printf.h\>

struct buf {

size\_t length;

int buffer\[30\];

size\_t (\*callback)(struct buf \*);

};

void

fill\_buf(struct buf \*bp)

{

bp-\>length = sizeof(bp-\>buffer)/sizeof(\*bp-\>buffer);

for (size\_t i = 0; i \<= bp-\>length; i++)

bp-\>buffer\[i\] = 0xAAAAAAAA;

}

size\_t

count\_screams(struct buf \*bp)

{

int screams = 0;

for (size\_t i = 0; i \< bp-\>length; i++)

screams += bp-\>buffer\[i\] == 0xAAAAAAAA ? 1 : 0;

return screams;

}

struct buf b = {.callback = count\_screams};

void

init(void)

{

fill\_buf(&b);

printf("Words of screaming in b.buffer %zu\\n", b.callback(&b));

}

void notified(void) {}

#include "asserts.inc"

Run the RISC-V program under QEMU; why does it crash?

Run the CHERI-RISC-V program under QEMU; why does it crash?

## Support code

asserts.inc

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 SRI International

\*/

#include \<stddef.h\>

\_Static\_assert(offsetof(struct buf, buffer) + sizeof(b.buffer) ==

offsetof(struct buf, callback),

"There must be no padding between buffer and callback members");
