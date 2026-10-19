# The asset model

Clementina's assets follow the hardware closely. Each kind is one thing MIA
draws or plays, and its rules are the hardware's rules, so an asset that
validates is one the machine can show. This chapter explains each kind and
the hardware fact behind it. Appendix B lists every field of every file, and
Appendix C every limit.

The video hardware itself (the layers, CHR banks, palette RAM, OAM and their
addresses in MIA RAM) is in *Mapping Clementina*,
[Video](../../../mapping/src/mia/video.md), and the audio registers in
[Audio registers](../../../mapping/src/mia/audio.md).

## The one fact to remember: tiles have no color

Clementina draws everything from 8×8 tiles. A tile's pixels are color
*indices*, 0 to 7, not colors. The color comes from a palette chosen where
the tile is *placed*: in a background cell, an overlay cell or a sprite.
Every asset below follows from that. A tileset records pixels; a background,
an overlay or a shape records which tile goes where and with which palette;
a palette config says which colors those palettes hold. Change the palette
config and everything drawn against it changes color, with no tile touched.

## Palettes and palette configs

**A palette** is eight colors, in RGB565: red 0-31 in the top five bits,
green 0-63 in the middle six, blue 0-31 in the low five. White is 65535,
pure red 63488.

**A palette config** fills palette RAM. Palette RAM holds sixteen *palette
banks* of eight colors each, 256 bytes at MIA `$00100`. A config names the
palette for each of the sixteen banks, or `null` to leave one empty; the same
palette may sit in several banks.

```json
{"format": "clementina-palette-config", "version": 1,
 "id": "palette-config:main", "name": "Main",
 "banks": ["palette:main", null, null, null, null, null, null, null,
           null, null, null, null, null, null, null, null]}
```

A game usually has one config per mood: an overworld config and an
underground config with the same bank numbers and different colors. The
build turns a config into one 256-byte file in palette RAM's order, which
loads in one step.

All three layers (background, sprites, overlay) share the sixteen banks.

## Tilesets

**A tileset** is one CHR bank: 6,144 bytes of tile pixels, laid out as a
16×16 grid of 256 tiles. MIA has eight CHR banks, at `$00200-$0C1FF`, and a
tileset maps onto exactly one of them, with no packing.

A tileset is either 3 bits per pixel (256 tiles of eight colors) or 1 bit
per pixel. At 1 bpp the same 6,144 bytes hold three independent *planes* of
256 two-color tiles each, and each layer picks which plane it reads. The
`bpp` field says which; MIA's `CHR_1BPP_MASK` says it per bank, and the
runtime's `UseTileset` sets it from the tileset.

`chr` holds the 6,144 bytes exactly as MIA stores them. `authoring` holds
what Studio and other editors need but the machine doesn't:

- `tilePaletteBanks`: for each tile, the palette bank it was drawn against.
  Placing the tile later defaults to that bank.
- `compositions`: named rectangles of tiles (a 2×2 tree, a 4×4 house) to
  pick as one stamp.

Neither reaches the machine.

Sprites read one CHR bank, set by `SPRBANK`. Backgrounds and the overlay
each read two, a primary and an alternate, chosen per cell.

## Backgrounds

**A background** is a map of cells, any size up to 1,024 cells across or
down and 200,000 cells in all. Each cell is a tile number and its
attributes:

| Field | Meaning |
| --- | --- |
| `tile` | 0-255 |
| `paletteBank` | 0-15 |
| `flipX`, `flipY` | Mirror the tile. |
| `priority` | Draw this cell over the sprites. |
| `chrAlt` | Read the tile from the alternate CHR bank instead of the primary. |

`tilesetId` and `altTilesetId` name the two tilesets the map is drawn with;
naming the same one twice uses only one.

The background layer itself is smaller than most maps. MIA has eight
background tables of 40×25 cells, in two sets of four, and `BGMODE` arranges
one set into a plane of 40×25, 80×25, 40×50, 160×25, 40×100 or 80×50 cells
that scrolls and wraps. A map bigger than the plane streams through it: the game copies the
columns or rows about to scroll into view. The runtime's `DrawColumn`,
`DrawRow` and the partial loads do exactly that
([The asset runtime](../building/runtime.md)).

Color 0 of a background tile is a real color, drawn in the cell's palette.

## The overlay

**An overlay** is the top layer: always exactly 40×25 cells, the size of the
screen, never scrolled. Its cells are the same as a background's. BASIC's
text console is an overlay; a game uses it for a score, lives, a message
box. Color 0 is transparent, so the layers below show through.

An overlay can have **placeholders**: named rectangles where the game will
write tiles while it runs. The score's digits, a player's name. A
placeholder holds no tiles of its own: what is painted under it is the
overlay's starting content, and the runtime's `FillPlaceholder` overwrites
the tile numbers inside it at run time, keeping the colors and flips.
Placeholders can't overlap.

## Shapes

A hardware sprite is one 8×8 tile, placed anywhere: an OAM record of five
bytes holds its tile, position, palette, flips and priority. MIA has 256.

**A shape** is a list of up to 64 sprites drawn together around an origin:
a 16×16 hero is four sprites, a boss sixty. Each sprite has a tile, an X and
Y offset from the origin, a palette bank and flips:

```json
{"format": "clementina-shape", "version": 1,
 "id": "shape:player_idle", "name": "Player_Idle",
 "tilesetId": "tileset:player",
 "sprites": [{"tile": 0, "x": -4, "y": -8, "paletteBank": 0,
              "flipX": false, "flipY": false}]}
```

- A shape uses **one tileset**, because all sprites read the one sprite CHR
  bank.
- **List order is draw order.** The renderer draws OAM records from 0
  upward, and a later record draws over an earlier one. The shape's first
  sprite goes in the first record the game gives it.
- A sprite's palette bank defaults to its tile's authored bank and can be
  changed per sprite: one tileset gives a red enemy and a blue one.
- X ranges from -512 to 511 and Y from -256 to 255, the hardware's range for
  a sprite's position.

The canvas fields (`canvasPixelWidth`, `canvasPixelHeight`, `originAnchor`,
`originX`, `originY`) record how the shape was laid out in Studio. They
don't change what is drawn.

## Animations

**An animation** is a list of frames. Each frame names a shape and how long
it shows, in ticks of 1/60 second, 1 to 255:

```json
{"format": "clementina-animation", "version": 1,
 "id": "animation:walk", "name": "Walk",
 "frames": [{"shapeId": "shape:walk1", "ticks": 8},
            {"shapeId": "shape:walk2", "ticks": 8, "dy": -1},
            {"shapeId": "shape:walk1", "ticks": 8, "flipX": true}]}
```

- A frame **references** a shape. Change the shape and every frame showing
  it changes.
- `dx` and `dy` move the whole shape for that frame: a body bobbing one
  pixel doesn't need a second shape.
- `flipX` and `flipY` mirror the whole shape about its origin: each sprite's
  flip bit toggles and its offset `x` becomes `-x - 8` (`y` likewise). The
  offset applies after the flip. Flipping both ways turns the shape 180°;
  the hardware has no other rotation.
- Every shape in one animation must use the same tileset: they all play out
  of the one sprite CHR bank.

Sprite-against-background priority isn't part of a shape or an animation.
The game sets it when it draws.

## Instruments, songs and sound effects

MIA's sound is four *voices*, each a small synthesizer: a frequency, a
waveform (sine, pulse, sawtooth, triangle or noise), a pulse width, an
attack-decay-sustain-release envelope, a volume and a pan. A voice is driven
in one of two ways, and the two kinds of sound asset match them:

- **MIA's background sequencer** plays a *track* of notes from MIA RAM on
  its own, with no work for the 6502. Songs use it.
- **The program** writes a voice's registers itself, a frame at a time.
  Sound effects use it, on a voice the song leaves free or one it borrows
  for a moment.

**An instrument** is the settings a note puts on a voice:

| Field | Range | Meaning |
| --- | --- | --- |
| `wave` | 0-4 | Sine, pulse, sawtooth, triangle, noise. |
| `pulse` | 0-255 | The pulse wave's duty; 128 is a square wave. |
| `attack`, `decay`, `release` | 0-15 | Envelope rates, from 2 ms to 24 s. |
| `sustain` | 0-15 | The level the note holds after its decay. |
| `volume` | 0-255 | The voice's volume after the envelope. |

**A song** is four voices of notes on a grid of steps. It has a tempo
(`bpm`, 20-400), a number of steps per beat (1, 2, 3, 4, 6 or 8), beats per
bar (for the grid only), a length in steps (up to 4,096), and an optional
`loopStart`, the step it repeats from. Each voice has a pan (-64 left to 63
right) and its notes. A note has a start step, a length, a pitch (0-95,
semitones from C0 to B7) and an instrument. A voice plays one note at a
time, so its notes can't overlap. A `legato` note carries on the note before
it at a new pitch without a new attack. A voice with no notes compiles to
nothing and stays free for sound effects.

The build compiles a song into one sequencer track per voice, the bytes MIA
plays: the tempo becomes sample counts, each instrument change becomes the
sequencer's `SET_*` instructions, each note a `NOTE` (or a `TIE` when it is
legato), and the loop a `JUMP`. The voices stay together through every pass
of the loop.

**A sound effect** is one voice's registers for each frame of 1/60 second,
1 to 600 frames, under one envelope and pan. Each frame holds a frequency,
a volume, a pulse width, a waveform and the gate (on while the sound plays;
when it goes off the release starts). Frequencies are in Hz × 16 (`freq`
4000 is 250 Hz). The build stores, for each frame, only the registers that
change, and the runtime's `TickSound` writes one frame per call.

## What an asset doesn't hold

Assets hold what the program loads. They don't hold how the machine is set
up to show them: which CHR bank a tileset goes in, which bank the sprites
read, which tables a background is drawn into, the background mode, the
scroll position, the layers that are on. Those are the program's decisions,
made at run time (or, for the simple cases, in the manifest's `build.video`).
