# Introduction to machine language

BASIC is easy to write and slow to run: every statement is read, decoded and
checked each time it runs. **Machine language** is the 6502's own language,
the bytes it executes directly. A program in machine language runs many times
faster than the same program in BASIC, and can do things BASIC cannot, such as
answering an interrupt.

Clementina's processor is the **W65C02S**, made by the Western Design Center.
It is the CMOS successor of the MOS 6502 in the Commodore 64, Apple II and
many other computers of the 1980s. Everything written for the 6502 runs on
it, and it adds some instructions and addressing modes of its own (see
[The 65C02 instruction set](instructions.md)).

This part of the book explains the 65C02 as Clementina uses it. It is not a
course in assembly language programming; many good books teach the 6502, and
everything they say holds here.

## Assembly language

Nobody writes machine language as bytes. An **assembler** turns
**assembly language**, a readable form of it, into bytes:

```asm
        lda #65         ; put 65, the code of "A", in the accumulator
        jsr $0406       ; call the kernel's CHROUT: print it
        rts             ; return
```

assembles to the six bytes `A9 41 20 06 04 60`. The examples in this book
are written for **ca65**, the assembler of the cc65 suite, which is what the
Clementina SDK uses. How to set up a project, assemble it and put the result
on the SD card is explained in the *SDK & Studio Guide*. The code itself is
the same with any 65C02 assembler, apart from the directives (the words that
start with a period).

## The registers

The 65C02 has six registers:

| Register | Size | Use |
| --- | --- | --- |
| A, the **accumulator** | 8 bits | Arithmetic and logic. |
| X, Y, the **index registers** | 8 bits each | Counters and offsets. |
| S, the **stack pointer** | 8 bits | The next free byte of the stack, in page 1. |
| P, the **status register** | 8 bits | The flags. |
| PC, the **program counter** | 16 bits | The address of the next instruction. |

The flags in P are set by most instructions and tested by the branches:

| Bit | Flag | Set when |
| --- | --- | --- |
| 7 | N, negative | The result's bit 7 is 1. |
| 6 | V, overflow | A signed addition or subtraction overflowed. |
| 5 | | Always 1. |
| 4 | B, break | Only in the copy of P pushed by `BRK`. |
| 3 | D, decimal | `ADC` and `SBC` work in binary-coded decimal. |
| 2 | I, interrupt disable | IRQs are masked. |
| 1 | Z, zero | The result is 0. |
| 0 | C, carry | An addition carried, a subtraction did not borrow, or a shift pushed out a 1. |

## Addressing modes

The **addressing mode** says where an instruction finds its data. The 65C02
has 16 of them; the common ones are:

| Mode | Example | The data is |
| --- | --- | --- |
| Immediate | `lda #$10` | The byte `$10` itself. |
| Zero page | `lda $98` | At address `$0098`. One byte shorter and faster than absolute. |
| Absolute | `lda $C001` | At address `$C001`. |
| Indexed | `lda $0300,x` | At `$0300` plus X. |
| Indirect indexed | `lda ($98),y` | At the address stored in `$98-$99`, plus Y. |
| Zero page indirect | `lda ($98)` | At the address stored in `$98-$99`. 65C02 only. |

**Zero page**, the first 256 bytes of memory, is precious because of this: an
address in it takes one byte, and only zero page can hold the pointers of the
indirect modes. Clementina gives programs `$98-$DF`, 72 bytes that BASIC, the
kernel and WozMon never touch (*Mapping Clementina*,
[Zero page](../../../mapping/src/cpu/zero-page.md)).

## The stack

Page 1, `$0100-$01FF`, is the **stack**. `JSR` pushes the return address on it
and `RTS` takes it back; `PHA` and `PLA` save and restore the accumulator, and
the 65C02 adds `PHX`, `PHY`, `PLX` and `PLY`. The stack grows down from
`$01FF`. BASIC keeps its `FOR` and `GOSUB` records on it too, so a routine
called from BASIC must leave it as it found it.

## Little-endian

The 6502 stores 16-bit values with the low byte first: the address `$0406` is
the bytes `06 04`. So does everything else in Clementina, from MIA's registers
to the files on the SD card.

## A first program

This program prints a message using the kernel. It is 19 bytes long, so it fits
at `$0280` (640), a small area that is free while BASIC runs.

<!-- example: org=$0280 prg=HELLO.PRG run="BLOAD \"HELLO.PRG\"|SYS 640" -->
```asm
.include "clementina.inc"
KPTR = $F0                      ; the kernel's string pointer

        lda #<message
        sta KPTR
        lda #>message
        sta KPTR+1
        jsr KERN_PRSTR          ; print the string KPTR points at
        rts                     ; back to BASIC
message:
        .byte "HELLO", 13, 0
```

```text
HELLO
```

Assembled, saved on the SD card as `HELLO.PRG`, it loads with `BLOAD` and runs
with `SYS 640`. `.include "clementina.inc"` brings in the SDK's names for the
kernel's entry points, MIA's registers and the rest of the machine; `KPTR` is
defined here because the include file does not name the kernel's zero page.
[Mixing BASIC and machine language](mixing.md) explains `BLOAD` and `SYS`,
and [The kernel](kernel.md) every kernel entry point.

## Where to put machine code

The 6502 sees 64 KiB of memory. While BASIC runs, most of it is BASIC's:

| Addresses | Holds | Machine code |
| --- | --- | --- |
| `$0000-$00FF` | Zero page. | Variables in `$98-$DF`. |
| `$0100-$01FF` | The stack. | No. |
| `$0200-$02FF` | Input buffer, clock snapshot. | `$0280-$02F7`, 120 bytes. |
| `$0300-$03FF` | Kernel variables. | No. |
| `$0400-$15FF` | Kernel and WozMon. | No. |
| `$1600-$BFFF` | BASIC and its program, variables and strings. | Above a lowered top of BASIC memory. |
| `$8000-$BFFF` | One of 32 banks of 16 KiB; bank 0 is BASIC's. | Banks 1-31. |
| `$C000-$DFFF` | Input/output: the VIA and expansion cards. | No. |
| `$E000-$FFFF` | MIA's registers. | No. |

A program that takes over the machine, and does not return to BASIC, can use
everything from `$1600` up. The full map is in *Mapping Clementina*,
[The 6502's address space](../../../mapping/src/cpu/decode.md).
