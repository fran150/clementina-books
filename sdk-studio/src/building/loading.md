# How a program reaches the machine

Clementina uses BASIC commands to load files from an SD card. `LOAD` reads a
BASIC program, `BRUN` loads and starts machine code, and `MIALOAD` puts data
in MIA RAM.

The SDK builds the files and writes the commands that load them. Together,
those commands form a *load plan*. This chapter shows what the plan looks
like for a BASIC program, an assembly program, or both.

## The load plan

Every build writes `load-plan.json` next to its output. It is a list of
steps, run in order:

| Step | Does | BASIC |
| --- | --- | --- |
| `mia` | Loads a file into MIA RAM at an address. | `MIALOAD "path",address` |
| `prg` | Loads a PRG file into CPU RAM; the last one also starts it. | `BANK n:BLOAD "path"`, or `BANK n:BRUN "path"` |
| `speed` | Sets the CPU clock to the project's `target.phi2Hz`, first. Only when it isn't 1.2 MHz. | `POKE $FFE2,$20:POKE $FFE3,lo:...`, on two lines |
| `memoryTop` | Lowers BASIC's top of memory, before any loads. | `POKE $3F,lo:POKE $40,hi:CLEAR` |
| `basic` | Loads a tokenized BASIC program and runs it, last. | `RUN "path"` |

The last step starts the program. It is either a `prg` step with a run
address or a `basic` step. The plan has no steps after it. [Appendix
B](../appendix/schemas.md) has the file format.

Paths in the plan are relative to the SD card: the folder `build/sd`, which
every build writes.

## The card folder and `BOOT.BAS`

`build/sd` holds everything the machine needs, and nothing else:

```text
build/sd/
├── BOOT.BAS            the load plan as a BASIC program, tokenized
├── GAME.BAS            the BASIC program, tokenized
├── CODE.PRG            the assembly code
└── asset-palette.bin   the palette config
```

`BOOT.BAS` is the plan as a numbered BASIC program, the *bootstrap*. Point
the emulator's `--sd` at `build/sd`, or copy the folder's contents to a real
card. Then type:

```basic
RUN "BOOT.BAS"
```

`BOOT.BAS` loads the needed files before it starts your program. For a BASIC
program, its last line is `RUN "GAME.BAS"`, which replaces the bootstrap
with the program and runs it. For assembly, its last line uses `BRUN`.
The build also writes readable bootstrap source at `build/boot.cbas`.

`clementina run`, `clementina check` and the MCP server also start
`BOOT.BAS` in the emulator. The debugger enters the plan's steps directly
so the bootstrap's line numbers do not trigger breakpoints set in your
program.

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
10 MIALOAD "asset-palette.bin",$00100
20 MIALOAD "asset-chr-2.bin",$03200
30 RUN "GAME.BAS"
```

`RUN "GAME.BAS"` replaces the bootstrap with your program and starts it.
A program that needs more than its palettes and tilesets loads the rest
itself, with BASIC's statements
([Programming in BASIC with the SDK](basic.md)).

## Assembly only

For assembly on its own the bootstrap ends with `BRUN`:

```basic
10 MIALOAD "asset-palette.bin",$00100
20 MIALOAD "asset-chr-2.bin",$03200
30 BANK 0:BRUN "GAME.PRG"
```

`BRUN` never returns: by the time BASIC would need the bootstrap again, the
game owns the machine.

## BASIC and assembly

A project with both parts loads the assembly first, without running it, and
then the BASIC program, which calls it with `SYS`. With `memoryTop` set to
`$A000` and the routines linked there:

```basic
10 REM MOVE BASIC MEMORY TOP
20 POKE $3F,$00:POKE $40,$A0:CLEAR
30 MIALOAD "asset-palette.bin",$00100
40 BANK 0:BLOAD "ROUTINES.PRG"
50 RUN "GAME.BAS"
```

Line 20 lowers BASIC's top of memory to `$A000`. BASIC then leaves
`$A000-$BFFF` for the assembly routines. The limit survives `LOAD`, `RUN`
and `CLEAR`, so the routines remain available after `RUN "GAME.BAS"`.
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

`BRUN "FILE.PRG"` loads a PRG at the address in its two-byte header and
jumps to its first byte. If the entry symbol is elsewhere in the file, the
build gives `BRUN` that address as a second argument.

`BLOAD` returns to BASIC after loading. If the PRG replaced BASIC in memory,
the interpreter cannot run a following `SYS`. Use `SYS` for a routine that
returns to BASIC and sits outside BASIC's memory: at `$0280-$02F7`, in a
bank from 1 to 31, or above a lowered top of memory. *Mapping Clementina*
shows these places in
[BASIC's workspace](../../../mapping/src/cpu/basic-workspace.md#where-machine-code-can-go).

## Banks

The CPU sees extended RAM through a 16 KiB window at `$8000-$BFFF`, one bank
of 32 at a time. `BANK n` picks the bank that `BLOAD` and `BRUN` use there.
The bootstrap sets it before the first PRG and whenever it changes.

Assembly linked at `$8000-$BFFF` must name its bank in
`build.assembly.bank` (1-31), and one linked anywhere else must not. Code in
several banks ([`build.assembly.banks`](assembly.md#code-in-several-banks))
makes one PRG per bank, and the bootstrap loads each into its bank before
the main image:

```basic
10 REM MOVE BASIC MEMORY TOP
20 POKE $3F,$00:POKE $40,$70:CLEAR
30 BANK 1:BLOAD "CODE.BANK1.PRG"
40 BANK 2:BLOAD "CODE.BANK2.PRG"
50 BANK 0:BLOAD "CODE.PRG"
60 RUN "ROOMS.BAS"
```

A load that runs past `$BFFF` continues at `$8000` of the next bank, so one
file can fill several banks in a row. See [Extended
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
