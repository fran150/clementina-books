# How a program reaches the machine

Clementina loads programs from its SD card with BASIC: `LOAD` for a BASIC
program, `BRUN` for machine code, `MIALOAD` for data that goes into MIA RAM.
The build doesn't invent another way. It writes the files, and then the
BASIC commands that load them, in a *load plan*. This chapter explains the
plan and the three shapes it takes.

## The load plan

Every build writes `load-plan.json` next to its output. It is a list of
steps, run in order:

| Step | Does | BASIC |
| --- | --- | --- |
| `mia` | Loads a file into MIA RAM at an address. | `MIALOAD "path",address` |
| `prg` | Loads a PRG file into CPU RAM; the last one also starts it. | `BANK n:BLOAD "path"`, or `BANK n:BRUN "path"` |
| `basic` | Loads a tokenized BASIC program, last. | `LOAD "path"`, then `RUN` |

The plan ends with exactly one *terminal* step, the one that starts the
program: a `prg` step with a run address, or a `basic` step. Nothing after
it could run, because the program takes over. Appendix B has the plan's
format.

Paths in the plan are relative to the folder that is the SD card when the
plan runs. That folder is the project folder, except for an assembly game
with an asset build, whose card is `build/sd`.

The same plan drives everything that starts a program: `clementina run`, the
debugger, the agent workflows, the MCP server and Studio type its commands
into the emulator's BASIC, as you would.

## Before the program: `build.video`

Either kind of program can have the build load its palettes and tilesets
before it starts:

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
  becomes `asset-chr-N.bin`, loaded at its bank's address. A tileset goes
  exactly where you say; the build never infers a bank from the order of the
  asset lists.

CHR banks 0 and 1 hold BASIC's text font, so a BASIC program that still
prints text should leave them alone. A game that draws everything itself
can use all eight.

## A BASIC program

For a BASIC program the plan is typed directly, with no line numbers:

```basic
MIALOAD "build/asset-palette.bin",256
MIALOAD "build/asset-chr-2.bin",12800
LOAD "build/game.bas"
RUN
```

`LOAD` replaces whatever program was in memory, so the loading can't be a
BASIC program itself. In the emulator, with the project folder as the card,
type these lines as they are. On a real card, copy the project's `build`
folder to the card, keeping its name, and type the same lines from the
folder that holds it.

The SDK writes no file with these commands; they are in `load-plan.json`.
A program that needs more than its palettes and tilesets loads the rest
itself, with BASIC's statements
([Programming in BASIC with the SDK](basic.md)).

## An assembly program without an asset build

For an assembly program the plan becomes a small numbered BASIC program, the
*bootstrap*, written as text to `build/bootstrap.bas`:

```basic
10 MIALOAD "build/asset-palette.bin",256
20 MIALOAD "build/asset-chr-2.bin",12800
30 BANK 0:BRUN "build/game.prg"
```

Type it (or just its last line, if there is nothing to load first) and
`RUN`. The bootstrap can be a program because `BRUN` never returns: by the
time BASIC would need it again, the game owns the machine.

## An assembly game with an asset build

With `build.assets`, the build makes a complete SD card folder in
`build/sd`:

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

Copy the **contents** of `build/sd` to a folder on the card. On Clementina,
change to that folder, then:

```basic
LOAD "BOOT.BAS"
RUN
```

`BOOT.BAS` is already tokenized, so `LOAD` reads it directly. Its paths are
relative to the current folder, so the game can live in any folder of the
card. The bootstrap only starts the program; the game loads its assets
itself, through the asset runtime, when it wants them
([Assets in an assembly game](asset-build.md)).

In the emulator, start it with `--sd` pointing at `build/sd`.

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

An assembly program linked at `$8000-$BFFF` must name its bank in
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
