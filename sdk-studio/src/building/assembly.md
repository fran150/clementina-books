# Programming in assembly with the SDK

A project's assembly is ca65 code. The SDK assembles each source, links the
result with ld65, and checks it against the manifest. It then writes a PRG
and the commands that load it.

This chapter covers the build settings, linker configuration and include
files. It also covers programs that take over the machine, routines that
return to BASIC, banked code and editor support.

## The build settings

```yaml
build:
  outputDirectory: build
  assembly:
    sources:
      - src/main.s
      - src/player.s
      - src/level.s
    linkerConfig: link.cfg
    outputName: temple
    loadAddress: $1800
    entrySymbol: game_start
    includeDirectories:
      - src/include
    defines:
      DEBUG: 1
      VERSION: 0x0102
```

| Field | Meaning |
| --- | --- |
| `sources` | The assembly files, at least one. |
| `linkerConfig` | ld65's configuration file. It decides where everything goes. |
| `outputName` | The output files' name: `temple` makes `build/temple.prg`. Letters, digits, `_` and `-`, starting with a letter. |
| `loadAddress` | Where the program loads, 1 to `$BFFF`, in hex (`$1800` or `0x1800`) or as a number. Must be where the linker configuration puts the first byte. |
| `bank` | Only for a program linked at `$8000-$BFFF`: the bank it loads into, 1-31. Required there, rejected elsewhere. |
| `banks` | More code in banks 1-31, each in a memory area of the linker configuration: see [Code in several banks](#code-in-several-banks). |
| `entrySymbol` | The exported label where the program starts. |
| `includeDirectories` | Folders searched for `.include` files, before the SDK's own. |
| `checks` | Whether [the Clementina library](runtime.md)'s routines check their arguments. Default `true`. |
| `defines` | Symbols for every source, as if each began with `NAME = value`. A value is a number or a short text of letters, digits and `_.$+-`. |

ca65 assembles each source into an object file. ld65 links those files in
the order listed. The build targets the 65C02 and writes debug information
and a listing for each source.

## The linker configuration

The linker configuration places the code and data in memory. After linking,
the SDK checks that the output starts at `loadAddress`, that the entry symbol
is inside it, and that the expected output files exist. A mismatch with the
manifest stops the build. [Banked code](#code-in-several-banks) adds an output
file for each bank.

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

The [ld65 Users Guide](https://cc65.github.io/doc/ld65.html) describes the
configuration file in full, and the [ca65 Users
Guide](https://cc65.github.io/doc/ca65.html) the assembler's directives.
*Mapping Clementina* has the details behind each rule: [Zero
page](../../../mapping/src/cpu/zero-page.md), [The resident
image](../../../mapping/src/cpu/image.md) and [Extended
RAM](../../../mapping/src/cpu/extended-ram.md).

## The machine includes

Every assembly build writes two include files to `build/include/`. ca65
searches your `includeDirectories` first, then that folder:

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

For the addresses behind these names, see *Mapping Clementina*. The
*Programmer's Reference Guide*, Part III, covers programming MIA through
its registers.

## What the build makes

| File | What it is |
| --- | --- |
| `NAME.prg` | The program, with its 2-byte load address. The card folder, `sd/`, gets a copy as `NAME.PRG`. |
| `NAME.bin` | The same bytes without the header. |
| `NAME.dbg` | ld65's debug information: every source line's address. The debugger reads it. |
| `NAME.lbl` | Every label and its address, in VICE's label format. |
| `NAME.map` | ld65's memory map: segments, their sizes and addresses. |
| `NNN-source.o`, `.lst` | ca65's object and listing for each source, numbered in link order. |
| `include/` | `clementina.inc` and `mia.inc`. |
| `lib/` | [The Clementina library](runtime.md): `clementina-lib.inc`, `clementina.lib`, and `code-sizes.json`. |
| `boot.cbas`, `load-plan.json` | How to load it; `sd/BOOT.BAS` is the same bootstrap, tokenized ([How a program reaches the machine](loading.md)). |

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

A game that uses the Clementina library can call `WaitTick` instead, which also
says how many ticks went by ([Timing and input](runtime.md#timing-and-input)).

## Code that returns to BASIC

A machine-code routine for a BASIC program (called with `SYS` or `USR`) is
the opposite case: it must leave BASIC whole. Link it where BASIC doesn't
live: `$0280-$02F7`, a bank from 1 to 31 (with `bank` set and a
`loadAddress` in `$8000-$BFFF`), or above a top of memory the BASIC program
lowered. Keep its zero page in `$98-$DF`.

A project with both a BASIC program and `build.assembly` builds exactly
this. The loader `BLOAD`s the PRG instead of `BRUN`ning it, then loads and
runs the BASIC program, which calls the routine with `SYS`. To make room in
bank 0, set `build.basic.memoryTop`:

```yaml
program:
  entry: src/main.cbas
build:
  outputDirectory: build
  basic:
    outputName: game
    memoryTop: $A000
  assembly:
    sources:
      - src/routines.s
    linkerConfig: link.cfg
    outputName: routines
    loadAddress: $A000
    entrySymbol: start
```

`memoryTop` lowers BASIC's top of memory before the program loads. BASIC
keeps its program, variables and strings below `$A000`, leaving
`$A000-$BFFF` for the routine. `FRE` reports less free memory.

This setting only makes room above BASIC. Code at `$1800` would still
overwrite the interpreter.

Check the resulting `memory-layout.json` when placing code beside BASIC. It
maps each part and reports overlaps as warnings. An overlap does not stop the
build.

## Code in several banks

The `$8000-$BFFF` window shows one 16 KiB bank of extended RAM at a time.
To put code in more than one bank, list each bank under `build.assembly.banks`.
Each entry names a bank from 1 to 31 and its area in the linker
configuration.

```yaml
build:
  outputDirectory: build
  assembly:
    sources:
      - src/common.s
      - src/bank1.s
      - src/bank2.s
    linkerConfig: link.cfg
    outputName: code
    loadAddress: $7000
    entrySymbol: show_room
    banks:
      - bank: 1
        memory: BANK1
      - bank: 2
        memory: BANK2
```

In `link.cfg`, each of those areas starts at `$8000`, has an output file of
its own and says its bank:

```text
MEMORY {
  ZP:    start = $98,   size = $48,   type = rw;
  MAIN:  start = $7000, size = $1000, type = rw, file = %O;
  BANK1: start = $8000, size = $4000, type = ro, file = "%O.bank1", bank = 1;
  BANK2: start = $8000, size = $4000, type = ro, file = "%O.bank2", bank = 2;
}
SEGMENTS {
  ZEROPAGE: load = ZP,    type = zp;
  CODE:     load = MAIN,  type = ro;
  RODATA:   load = MAIN,  type = ro;
  DATA:     load = MAIN,  type = rw;
  BSS:      load = MAIN,  type = bss, define = yes;
  BANK1:    load = BANK1, type = ro;
  BANK2:    load = BANK2, type = ro;
}
```

Use `.segment "BANK1"` in a source to place code there. The linker sees
labels across all banks; `.bank(label)` gives the bank assigned to a label's
area. The build writes `CODE.BANK1.PRG` and `CODE.BANK2.PRG` beside the main
`CODE.PRG`, and the loader puts each file in its bank
([Banks](loading.md#banks)).

Each listed area needs its own output file and addresses within
`$8000-$BFFF`. A bank number in the linker configuration must match the
manifest. The build stops when these settings disagree. An area without a
bank number produces a warning because `.bank()` cannot resolve its labels.
An empty bank also produces a warning and no PRG.

### Switching banks

Writing a bank number to `VIA_ORA` maps that bank. Switch from code below
`$8000`, which remains in place while the bank changes. If code in the
window switches banks, its next instruction comes from the newly mapped
bank.

A *far call* handles the switch: a routine in the main image maps the target
bank, calls a routine there, then restores the caller's bank.

```text
; far_call: map bank A, call (far_ptr), then map the caller's bank again.
far_call:
        ldx current_bank        ; remember the caller's bank
        phx
        sta current_bank
        sta VIA_ORA             ; PA0-PA4 pick the bank at $8000-$BFFF
        jsr @call
        pla
        sta current_bank
        sta VIA_ORA
        rts
@call:  jmp (far_ptr)
```

A macro sets `far_ptr` and passes `.bank(routine)` in A, so a call names
only the routine, from the main image or from any bank:

```text
.macro FarCall routine
        lda #<routine
        sta far_ptr
        lda #>routine
        sta far_ptr+1
        lda #<.bank(routine)
        jsr far_call
.endmacro
```

A routine called from BASIC must return with bank 0 mapped; BASIC keeps the
top of its memory there. BASIC can also map a bank for a call with
`BANK 1:SYS $8000`.

[Code in several banks](../examples/examples.md#code-in-several-banks) has a
complete example. VS Code warns about a `VIA_ORA` store in banked code, and
the debugger can stop before it ([Debugging in VS
Code](../running/debugging.md)).

## Editing assembly in VS Code

The Clementina extension ([Installing](../start/installing.md#the-vs-code-extension))
opens `.s` and `.inc` files as Clementina Assembly and runs the SDK's
assembly language server. It reads the project the way a build does, with
the Clementina library included:

- **Errors as you type.** The extension runs ca65 on the file you are
  editing, saved or not, with the include directories and defines from
  `clementina.yaml`, and shows errors and warnings on their lines. Errors
  in included files appear there too. These checks need cc65, which
  `clementina install` installs.
- **Hover** on an instruction shows what it does, the flags it changes and
  each addressing mode with its opcode, size and cycles, with the mode your
  line uses in bold. On a directive it shows the syntax. On a symbol it shows
  the line that defines it, its value (`SCORE = $0280` shows `$0280 (640)`),
  a structure field's offset, and the comment above it or after it, so the
  library's macros explain themselves. After a build, a label also shows
  its address.
- **Completion** of instructions and macros where an instruction goes, of
  labels, constants and library symbols in an operand (the current `.proc`'s
  own labels first), of cheap locals after `@`, and of directives after `.`.
- **Signature help** while typing a macro's arguments, such as `DrawShape`'s.
- **Go to definition** and **Find All References** across the project and
  the library: labels, `.proc` names and the labels inside them
  (`start::loop`), cheap locals, constants, macros, structure fields and
  unnamed labels (`:-`, `:+`). On an imported name it goes to the source
  that exports it, and on a library macro it opens the library's source.
  An `.include` file name is a link.
- **Rename** a symbol everywhere it is used. The library's symbols can't be
  renamed.
- **The outline** lists procedures, structures and macros with what they
  contain, and `.proc`, `.macro`, `.if` and long comments fold.
- **Bank switches in banked code.** A store to `VIA_ORA`, or a macro that
  does one, in a segment the linker configuration puts at `$8000-$BFFF` gets
  a warning, because it maps another bank under the running code ([Switching
  banks](#switching-banks)). A store right after `lda #n` of the code's own
  bank maps the same bank again and is left alone.

Two settings change the checks. **Clementina › Assembly: Diagnostics**
(`clementina.assembly.diagnostics`) runs ca65 as you type (`onType`), on
save (`onSave`), or not at all (`off`). **Clementina › Assembly: Ca65 Path**
(`clementina.assembly.ca65Path`) names another ca65; by default the
extension uses the one `clementina install` installed, then the one on the
`PATH`.

[Debugging in VS Code](../running/debugging.md) covers breakpoints and
stepping through assembly.
