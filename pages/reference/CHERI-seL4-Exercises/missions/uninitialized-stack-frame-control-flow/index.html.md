---
title: Exploiting an uninitialized stack frame to manipulate control flow
permalink: /reference/CHERI-seL4-Exercises/missions/uninitialized-stack-frame-control-flow/index.html
---

The objective of this mission is to demonstrate arbitrary code
execution through the use of uninitialized variables on the stack,
despite CHERI protections. You will attack three different versions
of the program:

1. A baseline RISC-V compilation, to establish that the vulnerability is
   exploitable without any CHERI protections.
2. A hardened CHERI-RISC-V compilation with stack clearing, which
   should be non-exploitable.
3. A baseline CHERI-RISC-V compilation with no stack clearing, which
   should be non-exploitable due to pointer tagging.

The success condition for an exploit, given attacker-provided input
overriding an on-stack buffer, is to modify control flow in the program
such that the `success` function is executed.

## [Program overview](/reference/CHERI-seL4-Exercises/missions/uninitialized-stack-frame-control-flow/index.html#program-overview)
{: id="program-overview" }

Cookie monster is always hungry for more cookies. You can sate the
monster's hunger by providing cookies as standard input. Cookies are
provided as a pair of hexadecimal characters (case is ignored). Each
cookie is stored at successive bytes in an on-stack character array.
The character array aliases an uninitialized function pointer used in
a subsequent function. A minus character ('-') can be used to skip
over a character in the array without providing a new cookie. An
equals sign ('=') can be used to skip over the number of characters in
a pointer without providing any new cookies. Whitespace is ignored in
the input line. Input is terminated either by a newline or end of
file (EOF).

## [Building and running](/reference/CHERI-seL4-Exercises/missions/uninitialized-stack-frame-control-flow/index.html#building-and-running)
{: id="building-and-running" }

The hardened CHERI-RISC-V version with stack clearing is built by
adding `-ftrivial-auto-var-init=zero -enable-trivial-auto-var-init-zero-knowing-it-will-be-removed-from-clang`
to the compiler command line.

## [Source code](/reference/CHERI-seL4-Exercises/missions/uninitialized-stack-frame-control-flow/index.html#source-code)
{: id="source-code" }

***stack-mission.c***

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */

#include <sel4/assert.h>
#include <stdalign.h>
#include <stddef.h>
#include <stdint.h>
#include <printf.h>
#include <microkit.h>

#define SERIAL_CHANNEL 1
uintptr_t serial_to_client_vaddr;
uintptr_t client_to_serial_vaddr;

// Helper functions since we don't have a C library
// ------------------------------------------------ //
static char getchar() {
    microkit_ppcall(SERIAL_CHANNEL, microkit_msginfo_new(1, 0));
    return ((char *)serial_to_client_vaddr)[0];
}

static int isxdigit(int c) {
    return (c >= '0' && c <= '9') ||
           (c >= 'a' && c <= 'f') ||
           (c >= 'A' && c <= 'F');
}

static int digittoint(int c) {
    if (c >= '0' && c <= '9')
        return c - '0';
    if (c >= 'a' && c <= 'f')
        return c - 'a' + 10;
    if (c >= 'A' && c <= 'F')
        return c - 'A' + 10;
    return -1;  // Not a valid hex digit
}

static int isspace(int c) {
    return c == ' '  ||  // space
           c == '\t' ||  // horizontal tab
           c == '\n' ||  // newline
           c == '\v' ||  // vertical tab
           c == '\f' ||  // form feed
           c == '\r';    // carriage return
}

static void errx(int err, const char *msg) {
    printf("ERROR: %s\n", msg);
    microkit_internal_crash(err);  // Crash the component with a specific error code
}

static void exit(int status) {
    microkit_internal_crash(status);
}
// ------------------------------------------------ //

void
success(void)
{
	printf("Exploit successful, yum!\n");
	exit(42);
}

void
no_cookies(void)
{
	printf("No cookies??\n");
	exit(1);
}

#pragma weak init_pointer
void
init_pointer(void *p)
{
}

static void __attribute__((noinline))
init_cookie_pointer(void)
{
	void *pointers[12];
	void (* volatile cookie_fn)(void);

	for (size_t i = 0; i < sizeof(pointers) / sizeof(pointers[0]); i++)
		init_pointer(&pointers[i]);
	cookie_fn = no_cookies;
}

static void __attribute__((noinline))
get_cookies(void)
{
	alignas(void *) char cookies[sizeof(void *) * 32];
	char *cookiep;
	int ch, cookie;

	printf("Cookie monster is hungry, provide some cookies!\n");
	printf("'=' skips the next %zu bytes\n", sizeof(void *));
	printf("'-' skips to the next character\n");
	printf("XX as two hex digits stores a single cookie\n");
	printf("> ");

	cookiep = cookies;
	for (;;) {
		ch = getchar();

		if (ch == '\n' || ch == '\r' || ch == -1)
			break;

		if (isspace(ch))
			continue;

		if (ch == '-') {
			cookiep++;
			continue;
		}

		if (ch == '=') {
			cookiep += sizeof(void *);
			continue;
		}

		if (isxdigit(ch)) {
			cookie = digittoint(ch) << 4;
			ch = getchar();
			if (ch == -1)
				errx(1, "Half-eaten cookie, yuck!");
			if (!isxdigit(ch))
				errx(1, "Malformed cookie");
			cookie |= digittoint(ch);
			*cookiep++ = cookie;
			continue;
		}

		errx(1, "Malformed cookie");
	}
}

static void __attribute__((noinline))
eat_cookies(void)
{
	void *pointers[12];
	void (* volatile cookie_fn)(void);

	for (size_t i = 0; i < sizeof(pointers) / sizeof(pointers[0]); i++)
		init_pointer(&pointers[i]);
	cookie_fn();
}

void
init(void)
{
	init_cookie_pointer();
	get_cookies();
	eat_cookies();
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

**uninitialized-stack-frame-control-flow.system**

~~~XML
<?xml version="1.0" encoding="UTF-8"?>
<system>
    <!-- Define your system here -->

    <memory_region name="uart" size="0x1_000" phys_addr="0x10000000"/>
    <memory_region name="client_to_serial" size="0x1000" />
    <memory_region name="serial_to_client" size="0x1000" />

    <protection_domain name="serial_server" priority="254">
        <program_image path="serial_server.elf" />
        <map mr="uart" vaddr="0x2000000" perms="rw" cached="false" setvar_vaddr="uart_base_vaddr"/>
        <map mr="serial_to_client" vaddr="0x4000000" perms="wr" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="r" setvar_vaddr="client_to_serial_vaddr"/>
    </protection_domain>

    <protection_domain name="uninitialized-stack-frame-control-flow" priority="253">
        <program_image path="uninitialized-stack-frame-control-flow.elf" />
        <map mr="serial_to_client" vaddr="0x4000000" perms="r" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="rw" setvar_vaddr="client_to_serial_vaddr"/>
    </protection_domain>

    <channel>
        <end pd="uninitialized-stack-frame-control-flow" id="1" pp="true" />
        <end pd="serial_server" id="2" />
    </channel>
</system>
~~~
