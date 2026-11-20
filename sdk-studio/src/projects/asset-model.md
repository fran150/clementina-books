# The asset model

This chapter explains the asset files used for graphics and sound. It shows
what each one holds and how the pieces fit together. For field names and
limits, use [Appendix B](../appendix/schemas.md) and
[Appendix C](../appendix/limits.md).

The video hardware itself (the layers, CHR banks, palette RAM, OAM and their
addresses in MIA RAM) is in *Mapping Clementina*,
[Video](../../../mapping/src/mia/video.md), and the audio registers in
[Audio registers](../../../mapping/src/mia/audio.md).

## The one fact to remember: tiles have no color

Clementina draws graphics from 8×8 tiles. Each pixel holds a color *index*,
0 to 7. The actual color comes from the palette chosen when the tile is
placed in a background, overlay or sprite.

That gives each asset a job. A tileset holds pixels. A background, overlay or
shape places tiles and chooses palette banks. A palette config fills those
banks with colors. Change the config, and the artwork changes color without
changing the tiles.

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

A tileset uses either 3 bits per pixel (eight color indices) or 1 bit per
pixel (two indices). In 1 bpp mode, the same 6,144 bytes hold three
independent *planes* of 256 tiles. Each layer chooses a plane to read.
The tileset's `bpp` field records the mode; the library's `UseTileset`
sets MIA's `CHR_1BPP_MASK` for that bank.

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

The visible background is smaller than most maps. MIA has eight tables of
40×25 cells, in two sets of four. `BGMODE` arranges one set into a plane
that can be 40×25, 80×25, 40×50, 160×25, 40×100 or 80×50 cells. The plane
scrolls and wraps.

For a larger map, the game copies new columns or rows into the plane as it
scrolls. The library's `DrawColumn`, `DrawRow` and partial-load routines help
with this ([The Clementina library](../building/runtime.md)).

Color 0 of a background tile is a real color, drawn in the cell's palette.

## The overlay

**An overlay** is the top layer. It has exactly 40×25 cells, the size of the
screen, and does not scroll. Its cells work like background cells, except
color 0 is transparent. A game can use the overlay for scores, lives or
messages; BASIC's text console uses it too.

An overlay can have **placeholders**, named rectangles for content the game
will change while it runs, such as score digits or a player's name. The
painted tiles beneath a placeholder are its starting content.
`FillPlaceholder` replaces the tile numbers inside it at run time while
keeping their colors and flips. Placeholders cannot overlap.

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

**A song** has four voices of notes arranged on a grid of steps. Its tempo
(`bpm`) ranges from 20 to 400. You choose 1, 2, 3, 4, 6 or 8 steps per beat,
a length of up to 4,096 steps, and optionally a `loopStart` step. Beats per
bar arrange the editor's grid.

Each voice has its own pan (-64 left to 63 right) and notes. A note names an
instrument and has a start step, length and pitch (0-95, from C0 to B7).
Notes on one voice cannot overlap. A `legato` note changes pitch without a
new attack. A voice with no notes stays free for sound effects.

The build compiles one sequencer track per voice. It turns the tempo into
sample counts, instrument changes into `SET_*` instructions, notes into
`NOTE` or `TIE` instructions, and the loop into a `JUMP`. The voices stay
together through each pass of the loop.

**A sound effect** describes one voice over 1 to 600 frames, at 60 frames
per second. It has one envelope and pan setting. Each frame can set the
frequency, volume, pulse width, waveform and gate. Turning the gate off
starts the envelope's release.

Frequencies use Hz × 16, so `freq` 4000 means 250 Hz. The build stores only
registers that change from one frame to the next. The library's `TickSound`
writes one frame per call.

## Placing assets on the machine

Asset files hold the graphics and sound. The program chooses how to show
them: which CHR bank sprites read, where a background goes, its scroll
position and which layers are visible. The manifest's `build.video` can load
the initial palettes and tilesets; the program makes the other choices while
it runs.
