# Extended RAM and banking

The 6502 can address 64 KiB. Clementina has more RAM than that: besides the
32 KiB from `$0000` to `$7FFF`, it has 512 KiB of **extended RAM**, seen 16 KiB
at a time through a window at `$8000-$BFFF`. The 512 KiB are 32 **banks** of
16 KiB, numbered 0-31, and one of them is in the window at any moment.

## Choosing the bank

Bits 0-4 of the VIA's port A choose the bank. Machine code switches by writing
the bank number to `VIA_ORA` (`$C001`):

```asm
        lda #5
        sta VIA_ORA             ; bank 5 at $8000-$BFFF
        lda $8000               ; read and write it like any RAM
        stz VIA_ORA             ; bank 0 again
```

The whole byte may be written: bits 5-7 of port A are not connected. The kernel
sets bits 0-4 as outputs at reset, so nothing else needs setting up.

## Bank 0 belongs to BASIC

BASIC's memory runs from the end of BASIC's code to `$BFFF`, so its upper 16
KiB, where the strings live, are in bank 0. While BASIC runs, bank 0 must be
in the window. That gives three rules:

- Machine code called with `SYS` may switch banks, but must map bank 0 again
  before it returns.
- Banks 1-31 are free. Nothing in the system uses them.
- Bank 0 itself is free only above a lowered top of BASIC's memory
  ([Mixing BASIC and machine language](mixing.md)).

BASIC's own statements follow the same rule. `BANK n` does not switch
anything: it records which bank `PEEK`, `POKE`, `SYS`, `BLOAD`, `BRUN` and
`BSAVE` use when they touch `$8000-$BFFF`. Each of them maps that bank only
while it works there, and maps bank 0 back afterwards. The bank `BANK` chose
is kept in `DATA_BANK` (`$0306`), so machine code can find it.

```basic
10 BANK 7: POKE 32768,99: BANK 0
20 PRINT PEEK(32768)
30 BANK 7: PRINT PEEK(32768): BANK 0
```

```text
 0
 99
```

## Code in a bank

Code can live in a bank and be called from BASIC: `BLOAD` puts it there, and
`SYS` maps the bank before the call and bank 0 after the return. This routine,
assembled for `$8000` and loaded into bank 2, prints the bank it runs in:

<!-- example: org=$8000 prg=WHERE.PRG run="BANK 2: BLOAD \"WHERE.PRG\"|SYS 32768|BANK 0" -->
```asm
.include "clementina.inc"

        lda VIA_ORA
        and #%00011111          ; the bank bits
        jsr KERN_PRBYTE
        lda #13
        jmp KERN_CHROUT
```

```text
SYS 32768
02
```

Code in a bank must not switch the bank it runs from: the next instruction
would come from the new bank. To move data between banks, such code calls a
routine below `$8000` that does the switching.

## Moving data between banks

Only one bank is visible at a time, so copying from one bank to another goes
through RAM below `$8000`, a page at a time. This routine copies the first
256 bytes of bank 1 to bank 2, through the free area at `$0280` and the
programs' zero page:

<!-- example: org=$0280 prg=COPY.PRG run="BLOAD \"COPY.PRG\"|BANK 1: POKE 32768+255,77: BANK 0|SYS 640|BANK 2: PRINT PEEK(32768+255): BANK 0" -->
```asm
.include "clementina.inc"
SRC = $98

        ldx #0
loop:   lda #1
        sta VIA_ORA             ; bank 1
        lda $8000,x
        sta SRC                 ; keep the byte below $8000
        lda #2
        sta VIA_ORA             ; bank 2
        lda SRC
        sta $8000,x
        inx
        bne loop
        stz VIA_ORA             ; bank 0 for BASIC
        rts
```

```text
 77
```

It moves one byte at a time through zero page. A routine that moves more
uses a buffer in base RAM, such as `$0280-$02F7`, or MIA: MIA has 180 KiB of
free RAM and copies blocks by itself ([The MIA model](../mia/model.md)).

## Interrupts and banks

The kernel's interrupt handler and everything it touches are below `$8000`,
so an interrupt can arrive while any bank is mapped; switching needs no `SEI`.
An interrupt handler of your own that reads the window must save the bank,
map what it needs, and put the saved bank back before it returns.

`KERN_WARMSTART` and every BASIC error map bank 0 again, so BASIC recovers
even when a program stops with another bank mapped.

How the banks are wired is in *Mapping Clementina*,
[Extended RAM](../../../mapping/src/cpu/extended-ram.md).
