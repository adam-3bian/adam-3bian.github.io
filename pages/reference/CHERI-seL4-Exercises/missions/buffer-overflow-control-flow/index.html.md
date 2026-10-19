---
title: Exploiting a buffer overflow to manipulate control flow
permalink: /reference/CHERI-seL4-Exercises/missions/buffer-overflow-control-flow/index.html
---

# [Exploiting a buffer overflow to manipulate control flow](/reference/CHERI-seL4-Exercises/missions/buffer-overflow-control-flow/index.html#exploiting-a-buffer-overflow-to-manipulate-control-flow)
{: id="exploiting-a-buffer-overflow-to-manipulate-control-flow" }

The objective of this mission is to demonstrate arbitrary code execution
through a control-flow attack, despite CHERI protections. You will attack three
different versions of the program:

1. A baseline RISC-V compilation, to establish that the vulnerability is
   exploitable without any CHERI protections.
2. A baseline CHERI-RISC-V compilation, offering strong spatial safety between
   heap allocations, including accounting for imprecision in the bounds of large
   capabilities.
3. A weakened CHERI-RISC-V compilation, reflecting what would occur if a memory
   allocator failed to pad allocations to account for capability bounds
   imprecision.

The success condition for an exploit, given attacker-provided input overflowing
a buffer, is to modify control flow in the program such that the `success`
function is executed.

1. Compile `buffer-overflow.c` and `btpalloc.c` together with a RISC-V target
   and exploit the binary to execute the `success` function. You also need
   to compile `serial_server.c` to an ELF and place it in a separate
   Microkit protection domain, with the highest priority, then generate an
   image using the Microkit tool.

**buffer-overflow.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include <stdint.h>
#include <printf.h>
#include <microkit.h>
#include <sel4/sel4.h>

#include "btpalloc.h"

#define SERIAL_CHANNEL 1

uintptr_t serial_to_client_vaddr;
uintptr_t client_to_serial_vaddr;

#define MOVE_CURSOR_UP "\033[5A"
#define CLEAR_TERMINAL_BELOW_CURSOR "\033[0J"
#define GREEN "\033[32;1;40m"
#define YELLOW "\033[39;103m"
#define DEFAULT_COLOUR "\033[0m"

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

static uint16_t
ipv4_checksum(uint16_t *buf, size_t words)
{
	uint16_t *p;
	uint_fast32_t sum;

	sum = 0;
	for (p = buf; words > 0; --words, ++p) {
		sum += *p;
		if (sum > 0xffff)
			sum -= 0xffff;
	}

	return (~sum & 0xffff);
}

#include "main-asserts.inc"

static char getchar() {
    microkit_ppcall(SERIAL_CHANNEL, microkit_msginfo_new(1, 0));
    return ((char *)serial_to_client_vaddr)[0];
}

void
init(void)
{
	int ch;
	char *buf, *p;
	uint16_t sum;
	void (**fptr)(void);

	buf = btpmalloc(25000);
	fptr = btpmalloc(sizeof(*fptr));
	main_asserts(buf, fptr);

	*fptr = &failure;

	p = buf;
	while ((ch = getchar()) != -1) {
    if(ch == '\n' || ch == '\r')
        break;

		*p++ = (char)ch;
  }

	if ((uintptr_t)p & 1)
		*p++ = '\0';

	sum = ipv4_checksum((uint16_t *)buf, (p - buf) / 2);
	printf("Checksum: 0x%04x\n", sum);

	btpfree(buf);

	(**fptr)();

	btpfree(fptr);
}

void notified(microkit_channel channel) {
    switch (channel) {
        case SERIAL_CHANNEL: {
            char ch = ((char *)serial_to_client_vaddr)[0];
            microkit_dbg_putc(ch);
            break;
        }
    }
}
~~~

2. Recompile with a CHERI-RISC-V target, attempt to exploit the binary and, if
   it cannot be exploited, explain why.
3. Recompile with a CHERI-RISC-V target but this time adding
   `-DCHERI_NO_ALIGN_PAD`, attempt to exploit the binary and, if it cannot be
   exploited, explain why.

**btpalloc.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include "btpalloc.h"

#include <stddef.h>
#include <printf.h>
#include <sel4/assert.h>

#ifdef __CHERI_PURE_CAPABILITY__
#include <cheriintrin.h>
#endif

void *btpmem;
size_t btpmem_size;

void *
btpmalloc(size_t size)
{
	void *alloc;
	size_t allocsize;

	/* Microkit should have mapped and patched btpmem memory region during bootstrapping */
	seL4_Assert(btpmem != NULL);
	seL4_Assert(btpmem_size != 0);

	printf("btpmem = 0x%lx\n", (size_t) btpmem);
	printf("btpmemsize = 0x%lx\n", (size_t) btpmem_size);

	alloc = btpmem;
	/* RISC-V ABIs require 16-byte alignment */
	allocsize = __builtin_align_up(size, 16);

#if defined(__CHERI_PURE_CAPABILITY__) && !defined(CHERI_NO_ALIGN_PAD)
	allocsize = cheri_representable_length(allocsize);
	alloc = __builtin_align_up(alloc,
	    ~cheri_representable_alignment_mask(allocsize) + 1);
	allocsize += (char *)alloc - (char *)btpmem;
#endif

	if (allocsize > btpmem_size)
		return (NULL);

	btpmem = (char *)btpmem + allocsize;
	btpmem_size -= allocsize;
#ifdef __CHERI_PURE_CAPABILITY__
	alloc = cheri_bounds_set(alloc, size);
#endif
	printf("Returning alloc = 0x%lx\n", (size_t) alloc);
	return (alloc);
}

void
btpfree(void *ptr)
{
	(void)ptr;
}
~~~

## [Support code](/reference/CHERI-seL4-Exercises/missions/buffer-overflow-control-flow/index.html#support-code)
{: id="support-code" }

**btpalloc.h**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include <stddef.h>

void	*btpmalloc(size_t size);
void	 btpfree(void *ptr);
~~~

**serial\_server.c**

~~~C
#include <stdint.h>
#include <microkit.h>

#if defined(BOARD_qemu_virt_riscv64)
typedef uint8_t uart_reg_t;
#elif defined(BOARD_ariane)
typedef uint32_t uart_reg_t;
#else
#error "Unsupported board for the serial driver"
#endif
// This variable will have the address of the UART device
uintptr_t uart_base_vaddr;

/* QEMU RISC-V virt emulates a 16550 compatible UART. */
#define BIT(n) (1ul<<(n))

#define UART_IER_ERBFI   BIT(0)   /* Enable Received Data Available Interrupt */
#define UART_IER_ETBEI   BIT(1)   /* Enable Transmitter Holding Register Empty Interrupt */
#define UART_IER_ELSI    BIT(2)   /* Enable Receiver Line Status Interrupt */
#define UART_IER_EDSSI   BIT(3)   /* Enable MODEM Status Interrupt */

#define UART_FCR_ENABLE_FIFOS   BIT(0)
#define UART_FCR_RESET_RX_FIFO  BIT(1)
#define UART_FCR_RESET_TX_FIFO  BIT(2)
#define UART_FCR_TRIGGER_1      (0u << 6)
#define UART_FCR_TRIGGER_4      (1u << 6)
#define UART_FCR_TRIGGER_8      (2u << 6)
#define UART_FCR_TRIGGER_14     (3u << 6)

#define UART_LCR_DLAB    BIT(7)   /* Divisor Latch Access */

#define UART_LSR_DR      BIT(0)   /* Data Ready */
#define UART_LSR_THRE    BIT(5)   /* Transmitter Holding Register Empty */

typedef volatile struct {
    uart_reg_t rbr_dll_thr; /* 0x00 Receiver Buffer Register (Read Only)
                             *   Divisor Latch (LSB)
                             *   Transmitter Holding Register (Write Only)
                             */
    uart_reg_t dlm_ier;     /* 0x04 Divisor Latch (MSB)
                             *   Interrupt Enable Register
                             */
    uart_reg_t iir_fcr;     /* 0x08 Interrupt Identification Register (Read Only)
                             *   FIFO Control Register (Write Only)
                             */
    uart_reg_t lcr;         /* 0xC Line Control Register */
    uart_reg_t mcr;         /* 0x10 MODEM Control Register */
    uart_reg_t lsr;         /* 0x14 Line Status Register */
    uart_reg_t msr;         /* 0x18 MODEM Status Register */
} uart_regs_t;

#define REG_PTR(base, offset) ((volatile uint32_t *)((base) + (offset)))
/*
 *******************************************************************************
 * UART access primitives
 *******************************************************************************
 */

static int internal_uart_is_tx_empty(uart_regs_t *regs)
{
    /* The THRE bit is set when the FIFO is fully empty. On real hardware, there
     * seems no way to detect if the FIFO is partially empty only, so we can't
     * implement a "tx_ready" check. Since QEMU does not emulate a FIFO, this
     * does not really matter.
     */
    return (0 != (regs->lsr & UART_LSR_THRE));
}

static void internal_uart_tx_byte(uart_regs_t *regs, uint8_t byte)
{
    /* Caller has to ensure TX FIFO is ready */
    regs->rbr_dll_thr = byte;
}

static int internal_uart_is_rx_empty(uart_regs_t *regs)
{
    return (0 == (regs->lsr & UART_LSR_DR));
}


static int internal_uart_rx_byte(uart_regs_t *regs)
{
    /* Caller has to ensure RX FIFO has data */
    return regs->rbr_dll_thr;
}

void uart_init() {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;
    regs->dlm_ier = 0; // disable interrupts

    /* Baudrates and serial line parameters are not emulated by QEMU, so the
     * divisor is just a dummy.
     */
    uint16_t clk_divisor = 1; /* dummy, would be for 115200 baud */
    regs->lcr = UART_LCR_DLAB; /* baud rate divisor setup */
    regs->dlm_ier = (clk_divisor >> 8) & 0xFF;
    regs->rbr_dll_thr = clk_divisor & 0xFF;
    regs->lcr = 0x03; /* set 8N1, clear DLAB to end baud rate divisor setup */

    /* enable and reset FIFOs, interrupt for each byte */
    regs->iir_fcr = UART_FCR_ENABLE_FIFOS
                    | UART_FCR_RESET_RX_FIFO
                    | UART_FCR_RESET_TX_FIFO
                    | UART_FCR_TRIGGER_1;

    /* enable RX interrupts */
    regs->dlm_ier = UART_IER_ERBFI;
}

void uart_put_char(int c) {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;

    /* There is no way to check for "TX ready", the only thing we have is a
     * check for "TX FIFO empty". This is not optimal, as we might wait here
     * even if there is space in the FIFO. Seems the 16550 was built based on
     * the idea that software keeps track of the FIFO usage. A driver would
     * know how much space is left in the FIFO, so it can write new data
     * either immediately or buffer it. If the FIFO empty interrupt arrives,
     * data can be written from the buffer to fill the FIFO.
     * However, since QEMU does not emulate a FIFO, we can just implement a
     * simple model here and block - expecting to never block practically.
     */
    while (!internal_uart_is_tx_empty(regs)) {
        /* busy waiting loop */
    }

    /* Extract the byte to send, drop any flags. */
    uint8_t byte = (uint8_t)c;

    internal_uart_tx_byte(regs, byte);
}

void uart_handle_irq() {
}

void uart_put_str(char *str) {
    while (*str) {
        uart_put_char(*str);
        str++;
    }
}

int uart_get_char() {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;

    /* if UART is empty return an error */
    while(internal_uart_is_rx_empty(regs));

    return internal_uart_rx_byte(regs) & 0xFF;
}

void init(void) {
    // First we initialise the UART device, which will write to the
    // device's hardware registers. Which means we need access to
    // the UART device.
    uart_init();
    // After initialising the UART, print a message to the terminal
    // saying that the serial server has started.
    uart_put_str("SERIAL SERVER: starting\n");
}

#define UART_IRQ_CH 0
#define CLIENT_CH 2

uintptr_t serial_to_client_vaddr;
uintptr_t client_to_serial_vaddr;

microkit_msginfo protected(microkit_channel channel, microkit_msginfo msginfo)
{
    switch (channel) {
        case CLIENT_CH: {
            ((char *)serial_to_client_vaddr)[0] = (char) uart_get_char();
            return microkit_msginfo_new(0, 1);
            break;
        }
    }
    return microkit_msginfo_new(0, 0);
}

void notified(microkit_channel channel) {
    switch (channel) {
        case CLIENT_CH:
            uart_put_str((char *)client_to_serial_vaddr);
            break;
    }
}
~~~

**buffer-overflow-control-flow.system**

~~~XML
<?xml version="1.0" encoding="UTF-8"?>
<system>
    <!-- Define your system here -->

    <memory_region name="uart" size="0x1_000" phys_addr="0x10000000"/>
    <memory_region name="client_to_serial" size="0x1000" />
    <memory_region name="serial_to_client" size="0x1000" />
    <memory_region name="mr0" size="0x100000" />

    <protection_domain name="serial_server" priority="254">
        <program_image path="serial_server.elf" />
        <map mr="uart" vaddr="0x2000000" perms="rw" cached="false" setvar_vaddr="uart_base_vaddr"/>
        <map mr="serial_to_client" vaddr="0x4000000" perms="wr" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="r" setvar_vaddr="client_to_serial_vaddr"/>
    </protection_domain>

    <protection_domain name="buffer-overflow-control-flow" priority="253">
        <program_image path="buffer-overflow-control-flow.elf" />
        <map mr="serial_to_client" vaddr="0x4000000" perms="r" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="rw" setvar_vaddr="client_to_serial_vaddr"/>
        <map mr="mr0" vaddr="0x4002000" perms="rw" setvar_vaddr="btpmem" setvar_size="btpmem_size"/>
    </protection_domain>

    <channel>
        <end pd="buffer-overflow-control-flow" id="1" pp="true" />
        <end pd="serial_server" id="2" />
    </channel>
</system>
~~~

**main-asserts.inc**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include <sel4/assert.h>
#include <stdint.h>
#ifdef __CHERI_PURE_CAPABILITY__
#include <cheriintrin.h>
#endif

static void
main_asserts(void *buf, void *fptr)
{
	uintptr_t ubuf = (uintptr_t)buf;
	uintptr_t ufptr = (uintptr_t)fptr;
#ifdef __CHERI_PURE_CAPABILITY__
	ptraddr_t ubuf_top;
#endif

#ifdef __CHERI_PURE_CAPABILITY__
	ubuf_top = cheri_base_get(ubuf) + cheri_length_get(ubuf);
#endif

#if defined(__CHERI_PURE_CAPABILITY__) && !defined(CHERI_NO_ALIGN_PAD)
	/*
	 * For the normal pure-capability case, `buf`'s allocation should be
	 * adequately padded to ensure precise capability bounds and `fptr`
	 * should be adjacent.
	 */
	seL4_Assert(ubuf_top == ufptr);
#else
	/*
	 * Otherwise `fptr` should be 8 bytes (not 0 due to malloc's alignment
	 * requirements) after the end of `buf`.
	 */
	seL4_Assert(ubuf + 25008 == ufptr);
#ifdef __CHERI_PURE_CAPABILITY__
	/*
	 * For pure-capability code this should result in the bounds of the
	 * large `buf` allocation including all of `fptr`.
	 */
	seL4_Assert(ubuf_top >= ufptr + sizeof(void *));
#endif
#endif
}
~~~
