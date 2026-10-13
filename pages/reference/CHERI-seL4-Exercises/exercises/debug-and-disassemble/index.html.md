---
title: Disassemble and debug RISC-V and CHERI-RISC-V programs
permalink: /reference/CHERI-seL4-Exercises/exercises/debug-and-disassemble/index.html
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

# Disassemble and debug RISC-V and CHERI-RISC-V programs

This exercise steps you through disassembling and debugging RISC-V and CHERI-RISC-V programs. It draws attention to differences in program structure and code generation, particularly relating to control flow, between the two compilation targets.

First, use llvm-objdump on the host (which you can find at \~/cheri/output/cheri-alliance-sdk/bin/llvm-objdump, unless you have altered cheribuild's default paths) to disassemble and explore the two binaries from the previous exercise:

Using llvm-objdump -dS, disassemble the print-pointer-riscv and print-pointer-cheri binaries.

What instructions are generated to load printf()'s format string argument in print-pointer-riscv? Where does the target address for the string pointer originate?

What instructions are generated to load printf()'s format string argument in print-pointer-cheri? Where does the target capability for the string pointer originate? (Hint, you may find it helpful to add the -s flag to your llvm-objdump command to see all sections.)

Next use GDB to explore binary execution for RISC-V:

Run print-pointer-riscv under GDB (same path as llvm-objdump), setting a breakpoint at the start of printf(). Note: You will need to run QEMU in halted mode and make it wait for GDB connections, then, from another shell, run GDB on the ELF, connect to QEMU, then debug. An example sequence of commands will look like the following:

\# run\_qemu print-pointer-riscv -s -S

\# gdb print-pointer-riscv

Reading symbols from print-pointer-riscv...

(gdb) target remote :1234

Remote debugging using :1234

0x0000000000001000 in ?? ()

(gdb) break printf\_

Breakpoint 1 at 0x200090: file src/printf.c, line 1151.

(gdb) c

Breakpoint 1, printf\_ (format=0x201f5d "size of pointer: %zu\\n") at src/printf.c:1151

Run the program and at the breakpoint, print out the value of the string pointer argument.

Print out the program counter (info reg pc). What memory mapping is it derived from?

And for CHERI-RISC-V:

Run print-pointer-cheri under GDB, setting a breakpoint at the start of printf().

Print out the value of the string pointer argument.

Print out the program counter (info reg pcc). Where do its bounds appear to originate from?

Print out the register file using info registers. What mappings do the capabilities in the register file point to? Notice that some capabilities have S in their permissions which means they are sentries. Sentry capabilities are sealed (cannot be modified or used to load or store), but can be used as a jump target (where they are unsealed and installed in pcc). What implications does this have for attackers?
