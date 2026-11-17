# How a program reaches the machine

Clementina loads programs from its SD card with BASIC: `LOAD` for a BASIC
program, `BRUN` for machine code, `MIALOAD` for data that goes into MIA RAM.
The build writes the files, and then the BASIC commands that load them, in
a *load plan*. This chapter explains the plan and the shape it takes for
each combination of parts.

## The load plan

Every build writes `load-plan.json` next to its output. It is a list of
steps, run in order:

| Step | Does | BASIC |
| --- | --- | --- |
| `mia` | Loads a file into MIA RAM at an address. | `MIALOAD "path",address` |
| `prg` | Loads a PRG file into CPU RAM; the last one also starts it. | `BANK n:BLOAD "path"`, or `BANK n:BRUN "path"` |
| `memoryTop` | Lowers BASIC's top of memory, first. | `POKE 63,lo:POKE 64,hi:CLEAR` |
| `basic` | Loads a tokenized BASIC program and runs it, last. | `RUN "path"` |

The plan ends with exactly one *terminal* step, the one that starts the
program: a `prg` step with a run address, or a `basic` step. Nothing after
it could run, because the program takes over. Appendix B has the plan's
format.

Paths in the plan are relative to the SD card: the folder `build/sd`, which
every build writes.

## The card folder and `BOOT.BAS`

`build/sd` holds everything the machine needs, and nothing else:

```text
build/sd/
├── BOOT.BAS            the load plan as a BASIC program, tokenized
├── GAME.BAS            the BASIC program, tokenized
├── CODE.PRG            the assembly code
└── asset-palette.bin   the palette config, and any CHR banks
```

`BOOT.BAS` is the plan as a numbered BASIC program, the *bootstrap*. To start the project,
make `build/sd` the card (the emulator's `--sd`, or its contents copied to a
real card) and type:

```basic
RUN "BOOT.BAS"
```

`RUN "path"` loads a program and runs it. `BOOT.BAS` loads the files and then
starts the program: its last line is either `RUN "GAME.BAS"`, which loads
the BASIC program in its place and runs it, or `BRUN`, which starts the
machine code. The build also writes the same program as text in
`build/boot.cbas`, to read.

`clementina run`, `clementina check` and the MCP server start a project the
same way, by typing `RUN "BOOT.BAS"` into the emulator's BASIC. The
debugger types the plan's steps directly instead, so the bootstrap's own
line numbers can't stop at a breakpoint meant for the program's lines.

## Before the program: `build.video`

Any project can have the build load its palettes and tilesets before it
starts:

```yaml
build:
  video:
    paletteConfigId: palette-config:main
    tilesets:
      - {tilesetId: tileset:player, bank: 2}
      - {tilesetId: tileset:level, bank: 3}
```

- `paletteConfigId` names a palette config. The build writes it as
  `asset-palette.bin`, 256 bytes, loaded into palette RAM at `$00100`.
- `tilesets` places tilesets in CHR banks 0-7, one tileset per bank. Each
  becomes `asset-chr-N.bin`, loaded at its bank's address.

CHR banks 0 and 1 hold BASIC's text font, so a BASIC program that still
prints text should leave them alone. A game that draws everything itself
can use all eight.

## BASIC only

For a BASIC program on its own, with a palette and a tileset, `boot.cbas` is:

```basic
10 MIALOAD "asset-palette.bin",256
20 MIALOAD "asset-chr-2.bin",12800
30 RUN "GAME.BAS"
```

`RUN "GAME.BAS"` replaces the bootstrap with your program and starts it.
A program that needs more than its palettes and tilesets loads the rest
itself, with BASIC's statements
([Programming in BASIC with the SDK](basic.md)).

## Assembly only

For assembly on its own the bootstrap ends with `BRUN`:

```basic
10 MIALOAD "asset-palette.bin",256
20 MIALOAD "asset-chr-2.bin",12800
30 BANK 0:BRUN "GAME.PRG"
```

`BRUN` never returns: by the time BASIC would need the bootstrap again, the
game owns the machine.

## BASIC and assembly

A project with both parts loads the assembly first, without running it, and
then the BASIC program, which calls it with `SYS`. With `memoryTop` set to
`$A000` and the routines linked there:

```basic
10 POKE 63,0:POKE 64,160:CLEAR
20 MIALOAD "asset-palette.bin",256
30 BANK 0:BLOAD "ROUTINES.PRG"
40 RUN "GAME.BAS"
```

The first line lowers BASIC's top of memory to `$A000`, so BASIC leaves
`$A000-$BFFF` alone. Only a cold start resets it, so it survives `LOAD`,
`RUN` and `CLEAR`, and the routines `BLOAD`ed there survive `RUN "GAME.BAS"`.
[Code that returns to BASIC](assembly.md#code-that-returns-to-basic) has the
manifest.

## With an asset build

With `build.assets`, the card folder also holds every included asset:

```text
build/sd/
├── BOOT.BAS         the bootstrap, tokenized
├── WALKER.PRG       the program
└── ASSETS/          every included asset, one file each
    ├── MAIN.PAL
    ├── PLAYER.CHR
    ├── LEVEL1.BG
    ├── PLAYER.SPR
    ├── THEME.SNG
    └── JUMP.SFX
```

The bootstrap only starts the program; the game loads its assets itself,
through the Clementina library, when it wants them
([The asset build](asset-build.md)).

## On a real card

Copy the **contents** of `build/sd` to a folder on the card. On Clementina,
change to that folder, then `RUN "BOOT.BAS"`. Its paths are relative to the
current folder, so the game can live in any folder of the card.

## Why `BRUN`

`BRUN "FILE.PRG"` loads a PRG at the address in its 2-byte header and jumps
to its first byte. The build always starts a program this way, and puts the
entry symbol at the start of the image (or gives `BRUN` the entry address as
a second argument when it is elsewhere).

`BLOAD` followed by `SYS` looks equivalent but isn't. `BLOAD` returns to
BASIC, so a program loaded over BASIC (anything from `$1600` up, which is
where programs go) has just overwritten the interpreter that would run the
`SYS`. `SYS` is right only for a machine-code routine that returns to BASIC
and was loaded where BASIC doesn't live: `$0280-$02F7`, a bank from 1 to 31,
or above a lowered top of memory. *Mapping Clementina* lists those places in
[BASIC's workspace](../../../mapping/src/cpu/basic-workspace.md#where-machine-code-can-go).

## Banks

The CPU sees extended RAM through a 16 KiB window at `$8000-$BFFF`, one bank
of 32 at a time. `BANK n` picks the bank that `BLOAD` and `BRUN` use there.
The bootstrap sets it before the first PRG and whenever it changes.

Assembly linked at `$8000-$BFFF` must name its bank in
`build.assembly.bank` (1-31), and one linked anywhere else must not. A load
that runs past `$BFFF` continues at `$8000` of the next bank, so one file can
fill several banks in a row. See [Extended
RAM](../../../mapping/src/cpu/extended-ram.md).

## What the plan checks

The build checks the plan before writing it:

- Every MIA step fits in MIA's 256 KiB of RAM.
- A MIA step over `$13000-$13BFF`, the SD card's own control block and
  buffers, is a warning (`load.mia.reserved`): MIA would load the file over
  the state the following loads depend on.
- A `prg` step that returns to BASIC and loads into bank 0 or below `$8000`
  is a warning (`load.prg.return`): it may overwrite the kernel or BASIC.
- Every generated line fits BASIC's 80-character input line.
