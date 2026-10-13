---
title: Exploiting an uninitialized stack frame to manipulate control flow
permalink: /reference/CHERI-seL4-Exercises/missions/uninitialized-stack-frame-control-flow/index.html
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

# Exploiting an uninitialized stack frame to manipulate control flow

The objective of this mission is to demonstrate arbitrary code execution through the use of uninitialized variables on the stack, despite CHERI protections. You will attack three different versions of the program:

A baseline RISC-V compilation, to establish that the vulnerability is exploitable without any CHERI protections.

A hardened CHERI-RISC-V compilation with stack clearing, which should be non-exploitable.

A baseline CHERI-RISC-V compilation with no stack clearing, which should be non-exploitable due to pointer tagging.

The success condition for an exploit, given attacker-provided input overriding an on-stack buffer, is to modify control flow in the program such that the success function is executed.

### Program overview

Cookie monster is always hungry for more cookies. You can sate the monster's hunger by providing cookies as standard input. Cookies are provided as a pair of hexadecimal characters (case is ignored). Each cookie is stored at successive bytes in an on-stack character array. The character array aliases an uninitialized function pointer used in a subsequent function. A minus character ('-') can be used to skip over a character in the array without providing a new cookie. An equals sign ('=') can be used to skip over the number of characters in a pointer without providing any new cookies. Whitespace is ignored in the input line. Input is terminated either by a newline or end of file (EOF).

### Building and running

The hardened CHERI-RISC-V version with stack clearing is built by adding -ftrivial-auto-var-init=zero -enable-trivial-auto-var-init-zero-knowing-it-will-be-removed-from-clang to the compiler command line.

### Source code

stack-mission.c

/\*

\* SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

\* Copyright (c) 2020 SRI International

\*/

#include \<sel4/assert.h\>

#include \<stdalign.h\>

#include \<stddef.h\>

#include \<stdint.h\>

#include \<printf.h\>

#include \<microkit.h\>

#define SERIAL\_CHANNEL 1

uintptr\_t serial\_to\_client\_vaddr;

uintptr\_t client\_to\_serial\_vaddr;

// Helper functions since we don't have a C library

// ------------------------------------------------ //

static char getchar() {

microkit\_ppcall(SERIAL\_CHANNEL, microkit\_msginfo\_new(1, 0));

return ((char \*)serial\_to\_client\_vaddr)\[0\];

}

static int isxdigit(int c) {

return (c \>= '0' && c \<= '9') ||

(c \>= 'a' && c \<= 'f') ||

(c \>= 'A' && c \<= 'F');

}

static int digittoint(int c) {

if (c \>= '0' && c \<= '9')

return c - '0';

if (c \>= 'a' && c \<= 'f')

return c - 'a' + 10;

if (c \>= 'A' && c \<= 'F')

return c - 'A' + 10;

return -1;  // Not a valid hex digit

}

static int isspace(int c) {

return c == ' '  ||  // space

c == '\\t' ||  // horizontal tab

c == '\\n' ||  // newline

c == '\\v' ||  // vertical tab

c == '\\f' ||  // form feed

c == '\\r';    // carriage return

}

static void errx(int err, const char \*msg) {

printf("ERROR: %s\\n", msg);

microkit\_internal\_crash(err);  // Crash the component with a specific error code

}

static void exit(int status) {

microkit\_internal\_crash(status);

}

// ------------------------------------------------ //

void

success(void)

{

printf("Exploit successful, yum!\\n");

exit(42);

}

void

no\_cookies(void)

{

printf("No cookies??\\n");

exit(1);

}

#pragma weak init\_pointer

void

init\_pointer(void \*p)

{

}

static void \_\_attribute\_\_((noinline))

init\_cookie\_pointer(void)

{

void \*pointers\[12\];

void (\* volatile cookie\_fn)(void);

for (size\_t i = 0; i \< sizeof(pointers) / sizeof(pointers\[0\]); i++)

init\_pointer(&pointers\[i\]);

cookie\_fn = no\_cookies;

}

static void \_\_attribute\_\_((noinline))

get\_cookies(void)

{

alignas(void \*) char cookies\[sizeof(void \*) \* 32\];

char \*cookiep;

int ch, cookie;

printf("Cookie monster is hungry, provide some cookies!\\n");

printf("'=' skips the next %zu bytes\\n", sizeof(void \*));

printf("'-' skips to the next character\\n");

printf("XX as two hex digits stores a single cookie\\n");

printf("\> ");

cookiep = cookies;

for (;;) {

ch = getchar();

if (ch == '\\n' || ch == '\\r' || ch == -1)

break;

if (isspace(ch))

continue;

if (ch == '-') {

cookiep++;

continue;

}

if (ch == '=') {

cookiep += sizeof(void \*);

continue;

}

if (isxdigit(ch)) {

cookie = digittoint(ch) \<\< 4;

ch = getchar();

if (ch == -1)

errx(1, "Half-eaten cookie, yuck!");

if (!isxdigit(ch))

errx(1, "Malformed cookie");

cookie |= digittoint(ch);

\*cookiep++ = cookie;

continue;

}

errx(1, "Malformed cookie");

}

}

static void \_\_attribute\_\_((noinline))

eat\_cookies(void)

{

void \*pointers\[12\];

void (\* volatile cookie\_fn)(void);

for (size\_t i = 0; i \< sizeof(pointers) / sizeof(pointers\[0\]); i++)

init\_pointer(&pointers\[i\]);

cookie\_fn();

}

void

init(void)

{

init\_cookie\_pointer();

get\_cookies();

eat\_cookies();

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

uninitialized-stack-frame-control-flow.system

\<?xml version="1.0" encoding="UTF-8"?\>

\<system\>

\<!-- Define your system here --\>

\<memory\_region name="uart" size="0x1\_000" phys\_addr="0x10000000"/\>

\<memory\_region name="client\_to\_serial" size="0x1000" /\>

\<memory\_region name="serial\_to\_client" size="0x1000" /\>

\<protection\_domain name="serial\_server" priority="254"\>

\<program\_image path="serial\_server.elf" /\>

\<map mr="uart" vaddr="0x2000000" perms="rw" cached="false" setvar\_vaddr="uart\_base\_vaddr"/\>

\<map mr="serial\_to\_client" vaddr="0x4000000" perms="wr" setvar\_vaddr="serial\_to\_client\_vaddr"/\>

\<map mr="client\_to\_serial" vaddr="0x4001000" perms="r" setvar\_vaddr="client\_to\_serial\_vaddr"/\>

\</protection\_domain\>

\<protection\_domain name="uninitialized-stack-frame-control-flow" priority="253"\>

\<program\_image path="uninitialized-stack-frame-control-flow.elf" /\>

\<map mr="serial\_to\_client" vaddr="0x4000000" perms="r" setvar\_vaddr="serial\_to\_client\_vaddr"/\>

\<map mr="client\_to\_serial" vaddr="0x4001000" perms="rw" setvar\_vaddr="client\_to\_serial\_vaddr"/\>

\</protection\_domain\>

\<channel\>

\<end pd="uninitialized-stack-frame-control-flow" id="1" pp="true" /\>

\<end pd="serial\_server" id="2" /\>

\</channel\>

\</system\>
