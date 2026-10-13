---
title: Extending heap allocators for CHERI
permalink: /reference/CHERI-seL4-Exercises/exercises/cheri-allocator/index.html
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

# Extending heap allocators for CHERI

CHERI's architectural protection is driven by software -- the compiler, linker, OS kernel, run-time linker, run-time libraries, and so on all manage capabilities as part of their program execution. Heap allocators, which are integrally tied into our notions of spatial and temporal safety, are typically extended to use CHERI in five ways:

To implement spatial safety, bounds and permissions are set on returned pointers. (In this exercise.)

To prevent bounds overlap on larger allocations from arising due to imprecise bounds caused by capability compression, large allocations are aligned and padded more strongly. (Not in this exercise.)

If the allocator's free() implementation relies on reaching allocator metadata via its pointer argument (e.g., by looking immediately before or after to reach free-list pointers), then the implementation must be changed as access will otherwise be prevented by CHERI bounds and monotonicity. (In this exercise.)

To implement temporal safety, allocated memory is registered with a temporal-safety run-time library when allocated, to implement kernel-assisted revocation. On free, the memory is is held in quarantine until revocation has been performed. (Not in this exercise.)

To handle a further set of classes of misuse and pointer corruption, it is also important to perform validation of arguments to free(), such as by checking that the pointer is to the first byte of a valid allocation. (Not in this exercise.)

This exercise asks you to extend a simplified memory allocator with CHERI focusing only on (1) and (3) above. It supports only small fixed-size allocations that will not require further alignment or padding, and we will not consider temporal safety in this exercise.

The complete exercise is embodied in cheri-allocator.c, including the simplified allocator and also a main() routine that initializes and uses the allocator. main() allocates memory, and then overflows the allocation to corrupt internal allocator metadata, leading to a crash. Heap metadata corruption is a powerful exploitation tool; CHERI assists with mitigating it through pointer integrity features, but it is preferable to deterministically close vulnerabilities (e.g., via spatial safety).

Compile cheri-allocator.c with a CHERI-enabled target. Run the binary, which will crash.

Use GDB to demonstrate to yourself that the overflow has corrupted allocator metadata, leading to an eventual crash during a later call to alloc\_allocate().

Modify the allocator to use the cheri\_bounds\_set() API to set suitable bounds on the pointer returned by alloc\_allocate(). Recompile cheri-allocator.c with a CHERI-enabled target.

Use GDB to demonstrate to yourself that the overflow operation now causes an immediate crash as a result of attempting to store out of bounds, rather than triggering a later crash due to heap metadata corruption.

Remove the overflow (performed with memset()) from the program. Recompile cheri-allocator.c with a CHERI-enabled target.

Use GDB to explore why the program now crashes in alloc\_free(): How did adding bounds during allocation break later freeing of that memory?

Correct the bug through the use of the cheri\_address\_get() and cheri\_address\_set() APIs, which allow transferring an address from one capability (with one set of bounds) to another (with a different set of bounds). What capability should we be using to provide the new bounds? Recompile cheri-allocator.c with a CHERI-enabled target.

Demonstrate that the program now runs successfully to completion.

The resulting allocator is now substantially safer with respect to spatial safety, preventing underflows and overflows from corrupting allocator metadata or the contents of other allocations. However, to continue hardening the allocator against various attacks, further work would be required, including better validating the argument of the free() function. This would ideally test that the pointer being freed points to memory managed by the allocator, that the pointer is in bounds, and that it points to the start of a current allocation. Further temporal safety also requires quarantining freed memory until all pointers to it have been revoked.

## Source Files

cheri-allocator.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2022 Robert N. M. Watson

\*/

#include \<stdint.h\>

#include \<stddef.h\>

#include \<printf.h\>

#include \<sel4/assert.h\>

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

#include \<cheriintrin.h\>

#endif

#define \_\_containerof(ptr, type, member) \\

((type \*)((uintptr\_t)(ptr) - offsetof(type, member)))

/\*

\* Implement a very simple allocator for a fixed-size data type, with inline

\* metadata.  Calls to alloc\_allocate() return a pointer to a fixed-size byte

\* array.  Calls to alloc\_free() return it to the allocator for reuse.

\*

\* The implementation is simplistic, and is designed to support an exercise

\* relating to: (a) bounds setting; and (b) monotonicty and rederivation.

\* Each allocation is described by 'struct allocation', which consists of

\* free-list pointers and an array of bytes that make up the allocation

\* itself.  Those allocations are stored as a sequential array in a global

\* variable initialised by BSS:

\*

\*  /--------- index 0 ----------\\ /--------- index 1 ----------\\ /--...

\*

\* +--------+-----------------...-+--------+-----------------...-+---...

\* | a\_next | a\_bytes\[ALLOC\_SIZE\] | a\_next | a\_bytes\[ALLOC\_SIZE\] |

\* +--------+-----------------...-+--------+-----------------...-+---...

\*

\*                                ^                              ^

\*      \\\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_/    \\\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_/

\*        If unallocated, pointer        If unallocated, pointer

\*        to next free allocation.       to next free allocation.

\*

\* Allocation storage is sized below the threshold requiring extra alignment

\* or padding to account for capability bounds compression.

\*/

#define	ALLOC\_SIZE		128		/\* Allocation data size. \*/

struct alloc\_storage {

struct alloc\_storage	\*a\_next;		/\* Free list. \*/

uint8\_t			 a\_bytes\[ALLOC\_SIZE\];	/\* Allocated memory. \*/

};

#define	ALLOC\_MAX	16			/\* Availaable allocations. \*/

struct alloc\_storage alloc\_array\[ALLOC\_MAX\];	/\* Underlying storage. \*/

struct alloc\_storage \*alloc\_nextfree;		/\* Next available memory. \*/

/\*

\* Initialise the free list, pointing alloc\_nextfree at the array, and then

\* chaining array entries into the list.

\*/

static void

alloc\_init(void)

{

int i;

alloc\_nextfree = &alloc\_array\[0\];

for (i = 0; i \< ALLOC\_MAX - 1; i++)

alloc\_array\[i\].a\_next = &alloc\_array\[i + 1\];

alloc\_array\[ALLOC\_MAX - 1\].a\_next = NULL;

seL4\_Assert(alloc\_array\[ALLOC\_MAX - 1\].a\_next == NULL);

}

/\*

\* Allocate memory, pulling it off the free list and updating pointers as

\* needed.

\*/

static void \*

alloc\_allocate(void)

{

struct alloc\_storage \*alloc;

if (alloc\_nextfree == NULL)

return (NULL);

alloc = alloc\_nextfree;

alloc\_nextfree = alloc-\>a\_next;

alloc-\>a\_next = NULL;

/\* Return pointer to allocated memory. \*/

return (alloc-\>a\_bytes);

};

/\*

\* Free memory, inserting it back into the free list.  Note use of

\* \_\_containerof() to convert pointer to a\_bytes back into the container

\* struct pointer.

\*/

static void

alloc\_free(void \*ptr)

{

struct alloc\_storage \*alloc;

/\* Convert pointer to allocated memory into pointer to metadata. \*/

alloc = \_\_containerof(ptr, struct alloc\_storage, a\_bytes);

alloc-\>a\_next = alloc\_nextfree;

alloc\_nextfree = alloc;

}

void

init(void)

{

void \*ptr1, \*ptr2, \*ptr3;

/\* Initialise allocator. \*/

alloc\_init();

printf("Allocator initialised\\n");

/\*

\* Allocate some memory.

\*/

printf("Allocating memory\\n");

ptr1 = alloc\_allocate();

printf("Allocation returned %p\\n", ptr1);

/\*

\* Run off the end of the memory allocation, corrupting the next

\* allocation's metadata.  Free when done.

\*/

printf("Preparing to overflow %p\\n", ptr1);

memset(ptr1 + ALLOC\_SIZE, 'A', sizeof(void \*));

printf("Overflowed allocation %p\\n", ptr1);

printf("Freeing allocation %p\\n", ptr1);

alloc\_free(ptr1);

printf("Allocation %p freed\\n", ptr1);

/\*

\* Perform three sequential allocations to cause the allocator to

\* dereference the corrupted pointer, performing a store.

\*/

printf("Allocating memory\\n");

ptr1 = alloc\_allocate();

printf("Allocation returned %p\\n", ptr1);

printf("Allocating memory\\n");

ptr2 = alloc\_allocate();

printf("Allocation returned %p\\n", ptr2);

printf("Allocating memory\\n");

ptr3 = alloc\_allocate();

printf("Allocation returned %p\\n", ptr3);

/\*

\* Clear up the mess.

\*/

printf("Freeing allocation %p\\n", ptr3);

alloc\_free(ptr3);

printf("Allocation %p freed\\n", ptr3);

printf("Freeing allocation %p\\n", ptr2);

alloc\_free(ptr2);

printf("Allocation %p freed\\n", ptr2);

printf("Freeing allocation %p\\n", ptr1);

alloc\_free(ptr1);

printf("Allocation %p freed\\n", ptr1);

}

void notified(){}
