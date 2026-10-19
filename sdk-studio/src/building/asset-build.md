# Assets in an assembly game

An assembly game's levels, sprites and music go on the SD card as files,
and the game loads them while it runs. The asset build makes those files,
plus a description of each one the game's code can use: its size, its
default place in memory, and its parts. This chapter covers the `build.assets`
section and what it makes. The next one covers the runtime routines that
load and use the files.

The build never decides when anything loads, or what is on screen. It
writes files and constants; the game's code does the rest.

## An example

The examples in this chapter and the next come from *Walker*, a small game:
a level, a player that walks, background music and a jump sound. Its
manifest lists the assets as usual, and adds:

```yaml
build:
  outputDirectory: build
  assembly:
    linkerConfig: link.cfg
    outputName: walker
    loadAddress: 6144
    entrySymbol: game_start
  assets:
    slots:
      - {name: level,   mia: 0x14000, size: 0x1000}
      - {name: actors,  mia: 0x15000, size: 0x0400}
      - {name: effects, mia: 0x15400, size: 0x0400}
      - {name: music,   mia: 0x15800, size: 0x0800}
    include:
      - {kind: paletteConfig, id: palette-config:main, slot: palettes}
      - {kind: tileset, id: tileset:player, slot: chr2}
      - {kind: background, id: background:level1, slot: level}
      - {kind: sprites, id: tileset:player, slot: actors}
      - {kind: song, id: e4f5a6b7-c8d9-4e0f-9a1b-2c3d4e5f6a7b, slot: music}
      - {kind: sound, id: c2a9f1e0-1b2c-4d3e-8f40-516273849abc, slot: effects}
```

`slots` names places in memory; `include` says which assets go on the card
and where each one loads by default.

## Slots

A *slot* is a named range of memory: a place an asset can load to.

**Built-in slots** are the places in MIA RAM the hardware reads directly.
Every build has them:

| Slot | MIA RAM | Holds |
| --- | --- | --- |
| `palettes` | `$00100`, 256 bytes | palette RAM: a palette config |
| `chr0` … `chr7` | `$00200` up, 6,144 bytes each | the eight CHR banks: a tileset each |
| `overlay` | `$10080`, 2,000 bytes | the overlay's tiles and attributes |

Loading a palette config into `palettes` puts the colors on screen at once;
loading a tileset into `chr2` makes it CHR bank 2. Remember that BASIC's
font is in `chr0` and `chr1`: a game that prints with the kernel keeps them.

**Your slots** are ranges you name, either in MIA RAM or in CPU banks:

```yaml
slots:
  - {name: maps,   mia: 0x14000, size: 32768}           # MIA RAM
  - {name: actors, bank: 1, address: 0x8000, size: 16384} # CPU bank 1
  - {name: world,  bank: 2, address: 0x8000, size: 65536} # banks 2 to 5
```

- A MIA slot lies in `$14000-$3FFFF`, the 176 KiB of MIA RAM that belongs to
  programs ([Free MIA RAM](../../../mapping/src/mia/free-ram.md)). Below
  `$14000` is the firmware's.
- A bank slot names a bank from 1 to 31 and an address in `$8000-$BFFF`. It
  may run on through the following banks, up to bank 31; the runtime
  switches banks as it reads.
- Names start with a letter and hold letters, digits and `_`, are unique
  ignoring case, and can't be a built-in slot's name. Each becomes a
  `SLOT_NAME` constant.
- Slots can't overlap each other. Up to 64 of them.

### Several assets in one slot

Assets that name the same slot are **alternatives**: level 1's map and level
2's map, both loaded into `maps`, one at a time. The build sizes the slot
for the largest of them, not their sum. Which one is there at any moment is
the game's business: it loads the one it needs.

### Where to put what

| Memory | Good for |
| --- | --- |
| MIA RAM | Anything used every frame. MIA copies from its own RAM by DMA, so drawing a background from MIA RAM costs the same whatever its size, about 4,400 cycles. Songs must be here: MIA's sequencer only reads MIA RAM. |
| CPU banks | Data too big for MIA RAM (a 400 KiB world map); scattered data such as a scroll column; work that must take the same time every frame. Every byte goes through the CPU, at about 26 cycles a byte. |
| The SD card | Everything else, loaded between levels or streamed ahead of need. |

MIA can't write CPU RAM, so a load from the card into a bank passes every
byte through the CPU. A load from the card into MIA RAM is MIA's own work,
and the CPU is free while it runs.

## Included assets

Each `include` entry puts one asset on the card:

| Field | Meaning |
| --- | --- |
| `kind` | `paletteConfig`, `tileset`, `background`, `overlay`, `sprites`, `song` or `sound`. |
| `id` | The asset's id. For `sprites`, the id of a **tileset**: see below. |
| `slot` | Its default slot. |
| `file` | Optional: the file's name on the card. |

**Sprites** are packed per tileset. A `sprites` entry names a tileset, and
its file holds every shape that uses that tileset, followed by every
animation made of those shapes. Each shape and animation gets a number in
the file. The game can load the whole file or single shapes and animations
from it.

Palettes and instruments are never included on their own: a palette reaches
the card inside a palette config, an instrument inside the songs that use
it.

**File names** come from the asset's name, as 8.3 names: `Level1` becomes
`LEVEL1.BG`. The extensions are `.PAL`, `.CHR`, `.BG`, `.OVL`, `.SPR`,
`.SNG` and `.SFX`. When two names would clash, the build numbers them
(`LEVEL01.BG`). `file` overrides the name; MIA's file system takes long
names too. Names must be unique ignoring case.

Two more fields of `build.assets`:

| Field | Default | Meaning |
| --- | --- | --- |
| `folder` | `ASSETS` | The folder on the card the files go in. |
| `checks` | `true` | Whether the runtime checks its arguments. With checks, a call with a location that isn't loaded, an item number out of range or a shape that isn't there fails with an error code instead of drawing garbage. Without them the routines are smaller and faster. |

## What the build checks

Errors stop the build:

- A slot that overlaps another or lies outside programs' memory.
- An asset bigger than its slot, except a background (below).
- An unknown slot or asset, or an asset included twice.
- Two files with the same name.
- A song whose voices don't fit the runtime's 16-bit offsets.

Warnings don't:

- **A background bigger than its slot.** Only part of it fits, and only the
  partial loads (`LoadRows`, `LoadColumns`, `LoadRect`) can use the slot. A
  scrolling level is often exactly that.
- **A song in a bank slot.** The sequencer reads only MIA RAM, so the game
  must copy the song into MIA RAM (`Relocate`) before playing it.
- **An asset in a built-in slot of another kind**, such as a background in
  `chr3`.

## What the build makes

On the card, in `build/sd`:

| File | Contents |
| --- | --- |
| `BOOT.BAS` | Tokenized BASIC that starts the game. |
| `WALKER.PRG` | The game. |
| `ASSETS/` | One file per included asset. |

The asset files have no headers. They are the bytes the hardware or the
runtime uses, so a file that matches a hardware layout loads straight into
it:

| Asset | File contents | Size |
| --- | --- | --- |
| Palette config | 16 banks × 8 colors, RGB565, little-endian | 256 bytes |
| Tileset | The CHR bank exactly as MIA stores it | 6,144 bytes |
| Overlay | 1,000 tile numbers, then 1,000 attribute bytes | 2,000 bytes |
| Background | Width × height tile numbers row by row, then the same number of attribute bytes | 2 × width × height |
| Sprites | The tileset's shapes, then its animations | varies |
| Song | Each voice's sequencer track, back to back | varies |
| Sound | Each frame's register writes | varies |

Keeping tiles and attributes in two halves lets each half copy into its own
table with the same shape. A band of rows of a map is then one run of bytes
per half.

In `build/`, for the game's code:

| File | Contents |
| --- | --- |
| `assets.inc` | Constants and the runtime's macros. `.include` it. |
| `assets.s` | One descriptor per asset, assembled and linked with the game. |
| `memory-report.json` | Every slot, how full it is, and what is in it. |
| `runtime/` | The runtime's ca65 sources, objects and listings, and `code-sizes.json`. |
| `runtime.lib` | The runtime, archived for ld65. |

### `assets.inc`

```asm
; Slots: a location (a MIA address, or $80 | bank and a CPU address), and a size.
SLOT_PALETTES = $000100
SLOT_PALETTES_SIZE = 256
SLOT_CHR0 = $000200
...
SLOT_LEVEL = $014000
SLOT_LEVEL_SIZE = 4096

; Assets. Their descriptors are in assets.s.
.global PAL_MAIN, CHR_PLAYER, BG_LEVEL1, SPR_PLAYER, SONG_THEME, SFX_JUMP
BG_LEVEL1_SIZE = 2000
BG_LEVEL1_WIDTH = 40
BG_LEVEL1_HEIGHT = 25
SONG_THEME_VOICES = %0011
SFX_JUMP_FRAMES = 3

; Shapes and animations: their number in their sprite file, and where they are in it.
SHAPE_PLAYER_IDLE = 0
ANIM_PLAYER_IDLE = 0
```

- **Labels.** Each asset's label is a prefix and its name: `PAL_`, `CHR_`,
  `BG_`, `OVL_`, `SPR_` (named after the tileset), `SONG_`, `SFX_`. Shapes and
  animations are `SHAPE_` and `ANIM_` numbers, and an overlay's placeholders
  are `OVL_HUD_SCORE` with `_COL`, `_ROW`, `_WIDTH` and `_HEIGHT`.
- `SONG_THEME_VOICES` is a mask of the voices the song uses, so the game
  knows which are free for sound effects.

### `assets.s` and descriptors

A *descriptor* is a small record per asset, in the `DATA` segment, that the
runtime reads and updates. It holds the asset's kind, its current location
(where it is loaded now, or nowhere), its default location (its slot), its
size and file path, and what the kind needs: a tileset's 1 bpp flag, a
background's width and height and the part of it that is loaded, a song's
track offsets, a sprite file's table of shapes and animations and where each
is loaded.

The game passes the descriptor's label to every runtime call: `Load
BG_LEVEL1`. A location is three bytes: `$000000-$03FFFF` is an address in
MIA RAM, `$80 | bank` in the top byte means a CPU bank with the address in
the low two bytes, and `$FFFFFF` means not loaded.

## Linking the runtime

The build assembles `assets.s` with the game's sources and passes
`runtime.lib` to ld65, which takes only the routines the game calls, and the
routines they call. The runtime uses four segments, so the linker
configuration needs them all:

```text
MEMORY {
  ZP:  start=$98,   size=$48,   type=rw;
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

The runtime takes 42 bytes of zero page. Keep zero page below `$E0`.

`runtime/code-sizes.json` lists each runtime module's code size; the whole
runtime is about 6.4 KiB, and a game links only what it uses.
