---
title: Answers
permalink: /reference/CHERI-seL4-Exercises/exercises/cheri-allocator/answers.html
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

# Answers

## Introducing heap-allocator bounds

QEMU and GDB will show a CHERI tag violation resulting from memset() overwriting the a\_next field in the second allocation entry, which is tripped over by a later call to alloc\_allocate():

Allocator initialised

Allocating memory

Allocation returned 00000000000000000000000000203340

Preparing to overflow 00000000000000000000000000203340

Overflowed allocation 00000000000000000000000000203340

Freeing allocation 00000000000000000000000000203340

Allocation 00000000000000000000000000203340 freed

Allocating memory

Allocation returned 00000000000000000000000000203340

Allocating memory

Allocation returned 000000000000000000000000002033D0

Allocating memory

MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008

MON|ERROR: faulting PD: cheri-allocator

Registers:

ddc : 0x0

pcc : 0x20023e \[rxCM1111,0x200000-0x204000\] (capmode)

cra : 0x200238 \[rxCM1111,0x200000-0x204000\] (capmode) (sentry)

csp : 0x3fffffeef0 \[rwCM1111,0x3fffffe000-0x3ffffff000\]

cgp : 0x0

cs0 : 0x203340 \[rwCM1111,0x203330-0x203c30\]

cs1 : 0x0

cs2 : 0x203c30 \[rwCM1111,0x203c30-0x203c40\]

cs3 : 0x203340 \[rwCM1111,0x203330-0x203c30\]

cs4 : 0x2033d0 \[rwCM1111,0x203330-0x203c30\]

cs5 : 0x0

cs6 : 0x0

cs7 : 0x0

cs8 : 0x0

cs9 : 0x0

cs10 : 0x0

cs11 : 0x0

ca0 : 0x4141414141414141

ca1 : 0x3fffffeecf \[rwCM1111,0x3fffffeecf-0x3fffffeed0\]

ca2 : 0x12

ca3 : 0xffffffffffffffff

ca4 : 0x0

ca5 : 0x0

ca6 : 0x0

ca7 : 0xfffffffffffffff4

ct0 : 0x0

ct1 : 0x201f4a \[rxCM1111,0x200000-0x202fc0\] (capmode)

ct2 : 0x0

ct3 : 0x20

ct4 : 0x21

ct5 : 0x0

ct6 : 0x0

ctp : 0x0

MON|ERROR: CHERI Security Violation: ip=0x000000000020023e  fault\_addr=0x4141414141414141  fsr=0x0000000000000810  (data fault)

MON|ERROR: description of fault: Tag violation

MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO

(gdb) target remote :1234

Remote debugging using :1234

0x0000000000001000 in ?? ()

(gdb) break \*0x20023e

Breakpoint 1 at 0x20023e: file cheri-allocator.c, line 82.

(gdb) c

Continuing.

Breakpoint 1, alloc\_allocate () at cheri-allocator.c:82

82              alloc\_nextfree = alloc-\>a\_next;

(gdb) disassemble

Dump of assembler code for function init:

0x0000000000200238 \<+480\>:   lc      ca0,0(cs2)

0x000000000020023c \<+484\>:   beqz    a0,0x20024e \<init+502\>

=\> 0x000000000020023e \<+486\>:   c.lc    ca1,0(ca0)

(gdb) p alloc

$1 = (struct alloc\_storage \*) 0x4141414141414141 \[I:0101:C:r...a...:0:.:0x41414141400a0000-0x4141414140a80000\]

(gdb) info reg $ca0

ca0            0x41414141414141414141414141414141       0x4141414141414141 \[I:0101:C:r...a...:0:.:0x41414141400a0000-0x4141414140a80000\]

When compiling for CHERI C, use cheri\_bounds\_set() to set bounds on the returned pointer:

/\* Return pointer to allocated memory. \*/

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

return (cheri\_bounds\_set(alloc-\>a\_bytes, ALLOC\_SIZE));

#else

return (alloc-\>a\_bytes);

#endif

With this change, the memset() call in init() triggers a bounds violation exception on overflow:

\# run\_qemu ./cheri-allocator

...

Allocator initialised

Allocating memory

Allocation returned 00000000000000000000000000203340

Preparing to overflow 00000000000000000000000000203340

MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008

MON|ERROR: faulting PD: cheri-allocator

Registers:

ddc : 0x0

pcc : 0x202018 \[rxCM1111,0x200000-0x204000\] (capmode)

cra : 0x200172 \[rxCM1111,0x200000-0x204000\] (capmode) (sentry)

csp : 0x3fffffeef0 \[rwCM1111,0x3fffffe000-0x3ffffff000\]

cgp : 0x0

cs0 : 0x203340 \[rwCM1111,0x203340-0x2033c0\]

cs1 : 0x0

cs2 : 0x203c30 \[rwCM1111,0x203c30-0x203c40\]

cs3 : 0x203000 \[rwCM1111,0x203000-0x203010\]

cs4 : 0x0

cs5 : 0x0

cs6 : 0x0

cs7 : 0x0

cs8 : 0x0

cs9 : 0x0

cs10 : 0x0

cs11 : 0x0

ca0 : 0x2033c0 \[rwCM1111,0x203340-0x2033c0\]

ca1 : 0x41

ca2 : 0x10

ca3 : 0x2033c0 \[rwCM1111,0x203340-0x2033c0\]

ca4 : 0x0

ca5 : 0x0

ca6 : 0x0

ca7 : 0xfffffffffffffff4

ct0 : 0x0

ct1 : 0x201f6a \[rxCM1111,0x200000-0x202fe0\] (capmode)

ct2 : 0x0

ct3 : 0x20

ct4 : 0x21

ct5 : 0x0

ct6 : 0x0

ctp : 0x0

MON|ERROR: CHERI Security Violation: ip=0x0000000000202018  fault\_addr=0x00000000002033c0  fsr=0x0000000000000814  (data fault)

MON|ERROR: description of fault: Bounds violation

MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO

## Reaching allocator metadata

Following this change, alloc\_free() crashes with a bounds violation, due to reaching outside the bounds of the passed memory allocation:

\# gdb ./cheri-allocator

(gdb) break \*0x000000000020018c # Faulting address (ip=...) extracted from a previous QEMU run

Breakpoint 1 at 0x20018c: file cheri-allocator.c, line 105.

(gdb) target remote :1234

Remote debugging using :1234

0x0000000000001000 in ?? ()

(gdb) c

Continuing.

...

Allocator initialised

Allocating memory

Allocation returned 00000000000000000000000000203340

Preparing to overflow 00000000000000000000000000203340

Overflowed allocation 00000000000000000000000000203340

Freeing allocation 00000000000000000000000000203340

Breakpoint 1, alloc\_free (ptr=0x203340 \<alloc\_array+16\> \[V:1111:C:rw.C.l..:1:.:0x203340-0x2033c0\]) at cheri-allocator.c:105

105             alloc-\>a\_next = alloc\_nextfree;

(gdb) p alloc

$1 = (struct alloc\_storage \*) 0x203330 \<alloc\_array\> \[V:1111:C:rw.C.l..:1:.:0x203340-0x2033c0\]

We need to create a new capability, derived from alloc\_array but with the address generated from pointer to the memory being freed. One way to do this is using the cheri\_address\_get() and cheri\_address\_set(), reading the address from one capability and setting it on the other:

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

/\*

\* Generate a new pointer to the allocation that is derived from the

\* one passed by the consumer.

\*/

ptr = cheri\_address\_set(alloc\_array, cheri\_address\_get(ptr));

#endif

Note that this is not a complete solution to providing spatial safety here: software could still accidentally pass an out-of-bounds pointer.
