---
title: Exploiting a buffer overflow to manipulate control flow
permalink: /reference/CHERI-seL4-Exercises/missions/buffer-overflow-control-flow/index.html
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

# Exploiting a buffer overflow to manipulate control flow

The objective of this mission is to demonstrate arbitrary code execution through a control-flow attack, despite CHERI protections. You will attack three different versions of the program:

A baseline RISC-V compilation, to establish that the vulnerability is exploitable without any CHERI protections.

A baseline CHERI-RISC-V compilation, offering strong spatial safety between heap allocations, including accounting for imprecision in the bounds of large capabilities.

A weakened CHERI-RISC-V compilation, reflecting what would occur if a memory allocator failed to pad allocations to account for capability bounds imprecision.

The success condition for an exploit, given attacker-provided input overflowing a buffer, is to modify control flow in the program such that the success function is executed.

Compile buffer-overflow.c and btpalloc.c together with a RISC-V target and exploit the binary to execute the success function. You also need to compile serial\_server.c to an ELF and place it in a separate Microkit protection domain, with the highest priority, then generate an image using the Microkit tool.

buffer-overflow.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 Jessica Clarke

\*/

#include \<stdint.h\>

#include \<printf.h\>

#include \<microkit.h\>

#include \<sel4/sel4.h\>

#include "btpalloc.h"

#define SERIAL\_CHANNEL 1

uintptr\_t serial\_to\_client\_vaddr;

uintptr\_t client\_to\_serial\_vaddr;

#define MOVE\_CURSOR\_UP "\\033\[5A"

#define CLEAR\_TERMINAL\_BELOW\_CURSOR "\\033\[0J"

#define GREEN "\\033\[32;1;40m"

#define YELLOW "\\033\[39;103m"

#define DEFAULT\_COLOUR "\\033\[0m"

void

success(void)

{

printf("Exploit successful!");

}

void

failure(void)

{

printf("Exploit unsuccessful!");

}

static uint16\_t

ipv4\_checksum(uint16\_t \*buf, size\_t words)

{

uint16\_t \*p;

uint\_fast32\_t sum;

sum = 0;

for (p = buf; words \> 0; --words, ++p) {

sum += \*p;

if (sum \> 0xffff)

sum -= 0xffff;

}

return (\~sum & 0xffff);

}

#include "main-asserts.inc"

static char getchar() {

microkit\_ppcall(SERIAL\_CHANNEL, microkit\_msginfo\_new(1, 0));

return ((char \*)serial\_to\_client\_vaddr)\[0\];

}

void

init(void)

{

int ch;

char \*buf, \*p;

uint16\_t sum;

void (\*\*fptr)(void);

buf = btpmalloc(25000);

fptr = btpmalloc(sizeof(\*fptr));

main\_asserts(buf, fptr);

\*fptr = &failure;

p = buf;

while ((ch = getchar()) != -1) {

if(ch == '\\n' || ch == '\\r')

break;

\*p++ = (char)ch;

}

if ((uintptr\_t)p & 1)

\*p++ = '\\0';

sum = ipv4\_checksum((uint16\_t \*)buf, (p - buf) / 2);

printf("Checksum: 0x%04x\\n", sum);

btpfree(buf);

(\*\*fptr)();

btpfree(fptr);

}

void notified(microkit\_channel channel) {

switch (channel) {

case SERIAL\_CHANNEL: {

char ch = ((char \*)serial\_to\_client\_vaddr)\[0\];

microkit\_dbg\_putc(ch);

break;

}

}

}

Recompile with a CHERI-RISC-V target, attempt to exploit the binary and, if it cannot be exploited, explain why.

Recompile with a CHERI-RISC-V target but this time adding -DCHERI\_NO\_ALIGN\_PAD, attempt to exploit the binary and, if it cannot be exploited, explain why.

btpalloc.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 Jessica Clarke

\*/

#include "btpalloc.h"

#include \<stddef.h\>

#include \<printf.h\>

#include \<sel4/assert.h\>

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

#include \<cheriintrin.h\>

#endif

void \*btpmem;

size\_t btpmem\_size;

void \*

btpmalloc(size\_t size)

{

void \*alloc;

size\_t allocsize;

/\* Microkit should have mapped and patched btpmem memory region during bootstrapping \*/

seL4\_Assert(btpmem != NULL);

seL4\_Assert(btpmem\_size != 0);

printf("btpmem = 0x%lx\\n", (size\_t) btpmem);

printf("btpmemsize = 0x%lx\\n", (size\_t) btpmem\_size);

alloc = btpmem;

/\* RISC-V ABIs require 16-byte alignment \*/

allocsize = \_\_builtin\_align\_up(size, 16);

#if defined(\_\_CHERI\_PURE\_CAPABILITY\_\_) && !defined(CHERI\_NO\_ALIGN\_PAD)

allocsize = cheri\_representable\_length(allocsize);

alloc = \_\_builtin\_align\_up(alloc,

\~cheri\_representable\_alignment\_mask(allocsize) + 1);

allocsize += (char \*)alloc - (char \*)btpmem;

#endif

if (allocsize \> btpmem\_size)

return (NULL);

btpmem = (char \*)btpmem + allocsize;

btpmem\_size -= allocsize;

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

alloc = cheri\_bounds\_set(alloc, size);

#endif

printf("Returning alloc = 0x%lx\\n", (size\_t) alloc);

return (alloc);

}

void

btpfree(void \*ptr)

{

(void)ptr;

}

## Support code

btpalloc.h

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 Jessica Clarke

\*/

#include \<stddef.h\>

void	\*btpmalloc(size\_t size);

void	 btpfree(void \*ptr);

serial\_server.c

#include \<stdint.h\>

#include \<microkit.h\>

#if defined(BOARD\_qemu\_virt\_riscv64)

typedef uint8\_t uart\_reg\_t;

#elif defined(BOARD\_ariane)

typedef uint32\_t uart\_reg\_t;

#else

#error "Unsupported board for the serial driver"

#endif

// This variable will have the address of the UART device

uintptr\_t uart\_base\_vaddr;

/\* QEMU RISC-V virt emulates a 16550 compatible UART. \*/

#define BIT(n) (1ul\<\<(n))

#define UART\_IER\_ERBFI   BIT(0)   /\* Enable Received Data Available Interrupt \*/

#define UART\_IER\_ETBEI   BIT(1)   /\* Enable Transmitter Holding Register Empty Interrupt \*/

#define UART\_IER\_ELSI    BIT(2)   /\* Enable Receiver Line Status Interrupt \*/

#define UART\_IER\_EDSSI   BIT(3)   /\* Enable MODEM Status Interrupt \*/

#define UART\_FCR\_ENABLE\_FIFOS   BIT(0)

#define UART\_FCR\_RESET\_RX\_FIFO  BIT(1)

#define UART\_FCR\_RESET\_TX\_FIFO  BIT(2)

#define UART\_FCR\_TRIGGER\_1      (0u \<\< 6)

#define UART\_FCR\_TRIGGER\_4      (1u \<\< 6)

#define UART\_FCR\_TRIGGER\_8      (2u \<\< 6)

#define UART\_FCR\_TRIGGER\_14     (3u \<\< 6)

#define UART\_LCR\_DLAB    BIT(7)   /\* Divisor Latch Access \*/

#define UART\_LSR\_DR      BIT(0)   /\* Data Ready \*/

#define UART\_LSR\_THRE    BIT(5)   /\* Transmitter Holding Register Empty \*/

typedef volatile struct {

uart\_reg\_t rbr\_dll\_thr; /\* 0x00 Receiver Buffer Register (Read Only)

\*   Divisor Latch (LSB)

\*   Transmitter Holding Register (Write Only)

\*/

uart\_reg\_t dlm\_ier;     /\* 0x04 Divisor Latch (MSB)

\*   Interrupt Enable Register

\*/

uart\_reg\_t iir\_fcr;     /\* 0x08 Interrupt Identification Register (Read Only)

\*   FIFO Control Register (Write Only)

\*/

uart\_reg\_t lcr;         /\* 0xC Line Control Register \*/

uart\_reg\_t mcr;         /\* 0x10 MODEM Control Register \*/

uart\_reg\_t lsr;         /\* 0x14 Line Status Register \*/

uart\_reg\_t msr;         /\* 0x18 MODEM Status Register \*/

} uart\_regs\_t;

#define REG\_PTR(base, offset) ((volatile uint32\_t \*)((base) + (offset)))

/\*

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

\* UART access primitives

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

\*/

static int internal\_uart\_is\_tx\_empty(uart\_regs\_t \*regs)

{

/\* The THRE bit is set when the FIFO is fully empty. On real hardware, there

\* seems no way to detect if the FIFO is partially empty only, so we can't

\* implement a "tx\_ready" check. Since QEMU does not emulate a FIFO, this

\* does not really matter.

\*/

return (0 != (regs-\>lsr & UART\_LSR\_THRE));

}

static void internal\_uart\_tx\_byte(uart\_regs\_t \*regs, uint8\_t byte)

{

/\* Caller has to ensure TX FIFO is ready \*/

regs-\>rbr\_dll\_thr = byte;

}

static int internal\_uart\_is\_rx\_empty(uart\_regs\_t \*regs)

{

return (0 == (regs-\>lsr & UART\_LSR\_DR));

}

static int internal\_uart\_rx\_byte(uart\_regs\_t \*regs)

{

/\* Caller has to ensure RX FIFO has data \*/

return regs-\>rbr\_dll\_thr;

}

void uart\_init() {

uart\_regs\_t \*regs = (uart\_regs\_t \*) uart\_base\_vaddr;

regs-\>dlm\_ier = 0; // disable interrupts

/\* Baudrates and serial line parameters are not emulated by QEMU, so the

\* divisor is just a dummy.

\*/

uint16\_t clk\_divisor = 1; /\* dummy, would be for 115200 baud \*/

regs-\>lcr = UART\_LCR\_DLAB; /\* baud rate divisor setup \*/

regs-\>dlm\_ier = (clk\_divisor \>\> 8) & 0xFF;

regs-\>rbr\_dll\_thr = clk\_divisor & 0xFF;

regs-\>lcr = 0x03; /\* set 8N1, clear DLAB to end baud rate divisor setup \*/

/\* enable and reset FIFOs, interrupt for each byte \*/

regs-\>iir\_fcr = UART\_FCR\_ENABLE\_FIFOS

| UART\_FCR\_RESET\_RX\_FIFO

| UART\_FCR\_RESET\_TX\_FIFO

| UART\_FCR\_TRIGGER\_1;

/\* enable RX interrupts \*/

regs-\>dlm\_ier = UART\_IER\_ERBFI;

}

void uart\_put\_char(int c) {

uart\_regs\_t \*regs = (uart\_regs\_t \*) uart\_base\_vaddr;

/\* There is no way to check for "TX ready", the only thing we have is a

\* check for "TX FIFO empty". This is not optimal, as we might wait here

\* even if there is space in the FIFO. Seems the 16550 was built based on

\* the idea that software keeps track of the FIFO usage. A driver would

\* know how much space is left in the FIFO, so it can write new data

\* either immediately or buffer it. If the FIFO empty interrupt arrives,

\* data can be written from the buffer to fill the FIFO.

\* However, since QEMU does not emulate a FIFO, we can just implement a

\* simple model here and block - expecting to never block practically.

\*/

while (!internal\_uart\_is\_tx\_empty(regs)) {

/\* busy waiting loop \*/

}

/\* Extract the byte to send, drop any flags. \*/

uint8\_t byte = (uint8\_t)c;

internal\_uart\_tx\_byte(regs, byte);

}

void uart\_handle\_irq() {

}

void uart\_put\_str(char \*str) {

while (\*str) {

uart\_put\_char(\*str);

str++;

}

}

int uart\_get\_char() {

uart\_regs\_t \*regs = (uart\_regs\_t \*) uart\_base\_vaddr;

/\* if UART is empty return an error \*/

while(internal\_uart\_is\_rx\_empty(regs));

return internal\_uart\_rx\_byte(regs) & 0xFF;

}

void init(void) {

// First we initialise the UART device, which will write to the

// device's hardware registers. Which means we need access to

// the UART device.

uart\_init();

// After initialising the UART, print a message to the terminal

// saying that the serial server has started.

uart\_put\_str("SERIAL SERVER: starting\\n");

}

#define UART\_IRQ\_CH 0

#define CLIENT\_CH 2

uintptr\_t serial\_to\_client\_vaddr;

uintptr\_t client\_to\_serial\_vaddr;

microkit\_msginfo protected(microkit\_channel channel, microkit\_msginfo msginfo)

{

switch (channel) {

case CLIENT\_CH: {

((char \*)serial\_to\_client\_vaddr)\[0\] = (char) uart\_get\_char();

return microkit\_msginfo\_new(0, 1);

break;

}

}

return microkit\_msginfo\_new(0, 0);

}

void notified(microkit\_channel channel) {

switch (channel) {

case CLIENT\_CH:

uart\_put\_str((char \*)client\_to\_serial\_vaddr);

break;

}

}

buffer-overflow-control-flow.system

\<?xml version="1.0" encoding="UTF-8"?\>

\<system\>

\<!-- Define your system here --\>

\<memory\_region name="uart" size="0x1\_000" phys\_addr="0x10000000"/\>

\<memory\_region name="client\_to\_serial" size="0x1000" /\>

\<memory\_region name="serial\_to\_client" size="0x1000" /\>

\<memory\_region name="mr0" size="0x100000" /\>

\<protection\_domain name="serial\_server" priority="254"\>

\<program\_image path="serial\_server.elf" /\>

\<map mr="uart" vaddr="0x2000000" perms="rw" cached="false" setvar\_vaddr="uart\_base\_vaddr"/\>

\<map mr="serial\_to\_client" vaddr="0x4000000" perms="wr" setvar\_vaddr="serial\_to\_client\_vaddr"/\>

\<map mr="client\_to\_serial" vaddr="0x4001000" perms="r" setvar\_vaddr="client\_to\_serial\_vaddr"/\>

\</protection\_domain\>

\<protection\_domain name="buffer-overflow-control-flow" priority="253"\>

\<program\_image path="buffer-overflow-control-flow.elf" /\>

\<map mr="serial\_to\_client" vaddr="0x4000000" perms="r" setvar\_vaddr="serial\_to\_client\_vaddr"/\>

\<map mr="client\_to\_serial" vaddr="0x4001000" perms="rw" setvar\_vaddr="client\_to\_serial\_vaddr"/\>

\<map mr="mr0" vaddr="0x4002000" perms="rw" setvar\_vaddr="btpmem" setvar\_size="btpmem\_size"/\>

\</protection\_domain\>

\<channel\>

\<end pd="buffer-overflow-control-flow" id="1" pp="true" /\>

\<end pd="serial\_server" id="2" /\>

\</channel\>

\</system\>

main-asserts.inc

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 Jessica Clarke

\*/

#include \<sel4/assert.h\>

#include \<stdint.h\>

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

#include \<cheriintrin.h\>

#endif

static void

main\_asserts(void \*buf, void \*fptr)

{

uintptr\_t ubuf = (uintptr\_t)buf;

uintptr\_t ufptr = (uintptr\_t)fptr;

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

ptraddr\_t ubuf\_top;

#endif

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

ubuf\_top = cheri\_base\_get(ubuf) + cheri\_length\_get(ubuf);

#endif

#if defined(\_\_CHERI\_PURE\_CAPABILITY\_\_) && !defined(CHERI\_NO\_ALIGN\_PAD)

/\*

\* For the normal pure-capability case, \`buf\`'s allocation should be

\* adequately padded to ensure precise capability bounds and \`fptr\`

\* should be adjacent.

\*/

seL4\_Assert(ubuf\_top == ufptr);

#else

/\*

\* Otherwise \`fptr\` should be 8 bytes (not 0 due to malloc's alignment

\* requirements) after the end of \`buf\`.

\*/

seL4\_Assert(ubuf + 25008 == ufptr);

#ifdef \_\_CHERI\_PURE\_CAPABILITY\_\_

/\*

\* For pure-capability code this should result in the bounds of the

\* large \`buf\` allocation including all of \`fptr\`.

\*/

seL4\_Assert(ubuf\_top \>= ufptr + sizeof(void \*));

#endif

#endif

}
