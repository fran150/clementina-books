# Programming in assembly with the SDK

An assembly project is a ca65 program. The SDK runs ca65 on each source and
ld65 on the result, exactly as you would by hand, then checks the linked
program against what the manifest says and writes the PRG and its load
plan. This chapter covers the build settings, the linker configuration, the
include files the SDK provides, and the rules a program that owns the
machine lives by.

## The build settings

```yaml
program:
  kind: assembly
  entry: src/main.s
  sources:
    - src/player.s
    - src/level.s
build:
  outputDirectory: build
  assembly:
    linkerConfig: link.cfg
    outputName: temple
    loadAddress: 0x1800
    entrySymbol: game_start
    includeDirectories:
      - src/include
    defines:
      DEBUG: 1
      VERSION: 0x0102
```

| Field | Meaning |
| --- | --- |
| `linkerConfig` | ld65's configuration file. It decides where everything goes. |
| `outputName` | The output files' name: `temple` makes `build/temple.prg`. Letters, digits, `_` and `-`, starting with a letter. |
| `loadAddress` | Where the program loads, 1 to `$BFFF`. Must be where the linker configuration puts the first byte. |
| `bank` | Only for a program linked at `$8000-$BFFF`: the bank it loads into, 1-31. Required there, rejected elsewhere. |
| `entrySymbol` | The exported label where the program starts. |
| `includeDirectories` | Folders searched for `.include` files, before the SDK's own. |
| `defines` | Symbols for every source, as if each began with `NAME = value`. A value is a number or a short text of letters, digits and `_.$+-`. |

ca65 assembles `entry` first, then each of `sources` in order, each into its
own object file; ld65 links them in that order. Every source is assembled
for the 65C02 (`--cpu 65C02`) with debug information and a listing.

## The linker configuration

The SDK doesn't choose addresses. The linker configuration does, and the
SDK checks it: after linking, it reads ld65's debug file and verifies that
every segment in the output starts where `loadAddress` says, that there is
one output file, and that the entry symbol is inside it. A configuration
that disagrees with the manifest is an error, so the PRG's header can never
claim an address the code wasn't linked for.

A configuration for a game, with zero page, code, read-only data,
initialized data and uninitialized data:

```text
MEMORY {
  ZP:  start=$00,   size=$E0,   type=rw;
  RAM: start=$1800, size=$6800, type=rw, file=%O;
}
SEGMENTS {
  ZEROPAGE: load=ZP,  type=zp;
  CODE:     load=RAM, type=ro;
  RODATA:   load=RAM, type=ro;
  DATA:     load=RAM, type=rw;
  BSS:      load=RAM, type=bss, define=yes;
}
```

- **`$1800`** is above the kernel, which ends below `$1600` and holds the
  loader that `BRUN` runs. A program here loads over BASIC and owns the
  machine.
- **`size=$6800`** ends the block at `$7FFF`. `$8000-$BFFF` is the banked
  window, and `$C000-$FFFF` is I/O and MIA. A program that needs more room
  puts code or data in banks 1-31.
- **Zero page `$00-$DF`** is the program's once BASIC is gone. `$E0-$FF`
  stays the system's: the kernel's interrupt handler updates its tick count
  there, and the loader uses it. A program that returns to BASIC may only use
  `$98-$DF`.
- **`define=yes`** on `BSS` exports `__BSS_RUN__` and `__BSS_SIZE__`, which
  the program needs to clear it (below).

*Mapping Clementina* has the details behind each rule: [Zero
page](../../../mapping/src/cpu/zero-page.md), [The resident
image](../../../mapping/src/cpu/image.md) and [Extended
RAM](../../../mapping/src/cpu/extended-ram.md).

## The machine includes

Every assembly build writes two include files to `build/include/` and puts
that folder on ca65's include path, after your own `includeDirectories` (so a
file of yours with the same name wins):

```asm
.include "clementina.inc"       ; also includes mia.inc
```

`clementina.inc` gives:

| Names | What they are |
| --- | --- |
| `KERN_COLDSTART` … `KERN_SETTIM` | The kernel's jump table at `$0400`: the only kernel addresses that never move. |
| `BAS_CHKCOM` … `BAS_LINPRT` | BASIC's entries in the jump table, for machine code called from BASIC. |
| `ZP_FREE_START`, `ZP_FREE_END` | `$98` and `$DF`, the zero page programs own. |
| `CLOCK_SNAPSHOT`, `CLOCK_MS`, `CLOCK_60HZ`, `CLOCK_VERSION` | Where `KERN_RDTIM` copies MIA's clock. |
| `VIA_ORB` … `VIA_ORA_NH` | The VIA's registers at `$C000`. |

`mia.inc` gives every MIA name, spelled as MIA's firmware spells it, so code
reads like MIA's documentation:

| Names | What they are |
| --- | --- |
| `IDXA_PORT`, `CFG_SELECT`, `CMD_TRIGGER`, `MIA_CTX`, … | MIA's registers at `$FFE0-$FFFF`. |
| `MIA_STAT_*`, `IRQ_*` | Status and interrupt bits, as 16-bit masks: write `>MIA_STAT_SD_BUSY` for the bit in the high byte. |
| `ERROR_*` | MIA's error codes. |
| `CFG_*` | Configuration field ids. |
| `MIA_CMD_*` | Command numbers. |
| `MIA_*_INDEX_*`, `IDX_FLAG_*` | Index descriptor ids and flag bits. Flag bits are bit *numbers*: write `(1 << IDX_FLAG_R_STP_ENA)`. |
| `MIA_VIDEO_*`, `MIA_INPUT_*`, `MIA_AUDIO_*`, `MIA_SD_*` | Where things are in MIA RAM. |

Multi-byte fields name each byte (`_L`, `_M`, `_H`, or `0`-`3`). MIA RAM
addresses are 24-bit, so take their bytes with `<`, `>` and `^`.

The SDK generates both files from the same specifications every book's
tables come from, so the names here and the addresses in *Mapping
Clementina* always agree. Programming MIA through these registers is the
subject of the *Programmer's Reference Guide*, Part III.

## What the build makes

| File | What it is |
| --- | --- |
| `NAME.prg` | The program, with its 2-byte load address. |
| `NAME.bin` | The same bytes without the header. |
| `NAME.dbg` | ld65's debug information: every source line's address. The debugger reads it. |
| `NAME.lbl` | Every label and its address, in VICE's label format. |
| `NAME.map` | ld65's memory map: segments, their sizes and addresses. |
| `NNN-source.o`, `.lst` | ca65's object and listing for each source, numbered in link order. |
| `include/` | `clementina.inc` and `mia.inc`. |
| `bootstrap.bas`, `load-plan.json` | How to load it ([How a program reaches the machine](loading.md)). |

The `.lst` listings show each source line with the bytes it assembled to,
the quickest way to see what a macro became.

## A program that owns the machine

A program loaded at `$1800` replaces BASIC. A few rules follow.

**Clear your own memory.** `BRUN` loads the file and nothing else, so
uninitialized variables (`BSS`) hold whatever was in RAM before. Clear them
first:

```asm
.import __BSS_RUN__, __BSS_SIZE__

        lda #<__BSS_RUN__       ; ptr is two bytes of zero page
        sta ptr
        lda #>__BSS_RUN__
        sta ptr+1
        ldx #>__BSS_SIZE__      ; whole pages
        ldy #0
        lda #0
page:   cpx #0
        beq tail
:       sta (ptr),y
        iny
        bne :-
        inc ptr+1
        dex
        bra page
tail:   cpy #<__BSS_SIZE__      ; the rest
        beq done
        sta (ptr),y
        iny
        bra tail
done:
```

Set the decimal flag the way you want it too (`CLD`): nothing guarantees it.

**The kernel stays.** The kernel, below `$1600`, is untouched, and its jump
table works: `KERN_CHROUT` prints, `KERN_GETKEY_NB` reads a key without
waiting, `KERN_RDTIM` reads MIA's clock, `KERN_LOAD` loads a file. The
`BAS_` entries don't: BASIC is gone.

**There is no going back.** Returning with `RTS` or jumping to
`KERN_WARMSTART` would run what is left of BASIC's code. A reset brings
BASIC back: MIA loads it again.

**The interrupt keeps ticking.** The kernel's timer interrupt runs about 1%
of the CPU and keeps the cursor and its tick count going. Leave it, slow it
down, turn it off, or point the IRQ vector at your own handler and chain to
`KERN_IRQ`. *Mapping Clementina* explains each choice in [Taking over the
IRQ](../../../mapping/src/cpu/jump-table.md#taking-over-the-irq).

**Time comes from MIA.** For gameplay timing, read MIA's clock, not a count
of loops or cycles: the CPU's speed can change and the emulator doesn't
promise real speed. `KERN_RDTIM` copies MIA's millisecond count to
`CLOCK_MS` and its 60 Hz count (BASIC's `TI`) to `CLOCK_60HZ`:

```asm
; Waits until MIA's 60 Hz count moves on.
wait_tick:
        jsr KERN_RDTIM
        lda CLOCK_60HZ
        cmp last_tick
        beq wait_tick
        sta last_tick
        rts
```

## Code that returns to BASIC

A machine-code routine for a BASIC program (called with `SYS` or `USR`) is
the opposite case: it must leave BASIC whole. Link it where BASIC doesn't
live: `$0280-$02F7`, a bank from 1 to 31 (with `bank` set and a
`loadAddress` in `$8000-$BFFF`), or above a top of memory the BASIC program
lowered. Keep its zero page in `$98-$DF`. The SDK can build such a routine as
a project, but its bootstrap would `BRUN` it, so load it from your BASIC
program with `BANK` and `BLOAD` instead. Building BASIC and assembly together
in one project is what the reserved `mixed` kind will do.
