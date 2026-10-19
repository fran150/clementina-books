# Video

MIA RAM `$00000-$10D4F` (0-68943)

Clementina has no video connector. MIA keeps the whole screen in its own
RAM, and a program on another computer, the video client, draws it: MIA
sends each changed part of video memory over Wi-Fi when the client asks.
To the 6502, video is just MIA RAM to write.

The screen is 320×200 pixels, built from 8×8 tiles, 40 columns by 25 rows.
Four things are drawn, back to front: a backdrop color, a scrolling
background, up to 256 sprites, and the overlay, a fixed text layer that
holds the BASIC screen.

"Sent to the client" marks what the client keeps a copy of. MIA divides
video memory into 32-byte pages, 2,155 of them. Writing any byte of a page
from `$00020` up marks the page changed, and the next update sends it.
Writing several bytes in one page costs one page in the update; scattering
writes across many pages makes the update bigger.

## Local control: `$00000-$0001F`

The one page the client never receives. MIA writes it for the program to
read:

| Address | Size | Field | Contents |
| --- | --- | --- | --- |
| `$00000` | 1 | `VIDEO_VERSION` | The layout version of video memory. |
| `$00001-$00003` | 3 | | Reserved, zero. |
| `$00004-$00007` | 4 | `FRAME_ID` | The number of the last update MIA accepted, little-endian. 0 until the first; wraps from `$FFFFFFFF` to 1. |
| `$00008-$00009` | 2 | `LAST_RESPONSE_DIRTY_PAGES` | How many pages the last finished update sent: 0 when nothing had changed, 2,154 for a full refresh. |
| `$0000A-$0001F` | 22 | | Reserved, zero. |

## Render control: `$00020-$0003F`

How the client draws the frame. Its own indexes, `$80-$88`, reach each field
([Index descriptors](../spaces/indexes.md)).

{{#include ../../../tables/mia-video-render-control.md}}

- **`BG_ACTIVE_SET`** chooses which four of the eight background tables are
  drawn: set 0 uses tables 0-3, set 1 tables 4-7. The other set is not
  drawn, so a program can build the next screen there and switch in one
  write.
- **`BG_VIEWPORT_MODE`** arranges the active set's four tables (`T0-T3`)
  into one plane that the screen scrolls over:

  | Mode | Plane | Tables |
  | --- | --- | --- |
  | 0 | 40×25 cells | `T0` |
  | 1 | 80×25 | `T0 T1` side by side |
  | 2 | 40×50 | `T0` above `T2` |
  | 3 | 160×25 | `T0 T1 T2 T3` side by side |
  | 4 | 40×100 | `T0` to `T3` stacked |
  | 5 | 80×50 | `T0 T1` above `T2 T3` |

- **`SCROLL_X`, `SCROLL_Y`** are the pixel position of the screen's top-left
  corner within that plane. The view wraps at the plane's edges.
- **`CHR_1BPP_MASK`, `CHR_1BPP_PLANES`** let a CHR bank hold three separate
  one-bit tile sets instead of one three-bit set (below).
- **`BACKDROP_COLOR`**: bits 0-2 are the color, bits 3-6 the palette.
- **`OAM_LAST_INDEX`**: sprites from 0 up to this one are drawn while the
  sprite layer is on.

`$00031-$0003F` and the whole of `$00040-$000FF` are reserved and sent as
zero.

## Palettes: `$00100-$001FF`

Sixteen palettes of eight colors. Each color is two bytes, little-endian
RGB565 (5 bits of red, 6 of green, 5 of blue), so color `c` of palette `p`
is at `$00100 + p × 16 + c × 2`. Background pixels may use all eight colors;
in sprites and the overlay, color 0 is transparent. MIA loads its default
palettes when video starts ([Character set and
palette](../appendix/charset-palette.md)).

## CHR banks: `$00200-$0C1FF`

The tile graphics: eight banks of 256 tiles, 6,144 bytes a bank, so bank `b`
starts at `$00200 + b × $1800`. A bank is three 2 KiB planes, and each plane
holds one bit of every pixel:

```text
bank + $0000  plane 0, the low bit of each pixel
bank + $0800  plane 1, the middle bit
bank + $1000  plane 2, the high bit
```

Row `r` of tile `t` is byte `t × 8 + r` of each plane, and bit `x` of that
byte is the pixel in column `x`, bit 0 on the left. The three bits make a
color index, 0-7.

A bank marked in `CHR_1BPP_MASK` is read one plane at a time instead: each
plane is its own set of 256 one-bit tiles, and pixels are color 0 or 1.
`CHR_1BPP_PLANES` says which plane the background, the sprites and the
overlay read. The kernel uses this for text: it marks banks 0 and 1 as
one-bit, and MIA loads the character set into plane 0 of bank 0 and the
same characters reversed into plane 0 of bank 1.

## Background tables: `$0C200-$1007F`

Eight nametables of 40×25 tile numbers, 1,000 bytes each, from `$0C200`,
then eight attribute tables of the same shape from `$0E140`. Cell (`x`,`y`)
of table `n` is byte `n × 1000 + y × 40 + x` of each.

## The overlay: `$10080-$1084F`

One more 40×25 table and its attributes, `$10080` and `$10468`, drawn on top
of everything and never scrolled. The BASIC screen is the overlay: `CHROUT`
writes the character code itself as the tile number, so tile N is the glyph
for character N, and the cell's attribute from `TEXT_ATTR`. Overlay color 0
is transparent, so the backdrop shows around the characters.

## Attributes

Every background and overlay cell has an attribute byte, and every sprite
two:

{{#include ../../../tables/mia-video-attributes.md}}

- **palette** picks one of the 16 palettes.
- **flipX**, **flipY** mirror the tile.
- **priority** on a background or overlay cell draws its nonzero pixels in
  front of sprites; on a sprite, it puts the sprite behind nonzero
  background pixels.
- **chrAlt** draws the cell from the layer's alternate CHR bank instead of
  its primary one. On the BASIC screen that is the reversed character set.

## Sprites: `$10850-$10D4F`

OAM (object attribute memory) holds 256 sprite records of 5 bytes, so
sprite `n` is at `$10850 + n × 5`:

| Byte | Field | Contents |
| --- | --- | --- |
| 0 | `TILE` | Tile number in the sprite CHR bank. |
| 1 | `X` | Low 8 bits of the X position. |
| 2 | `Y` | Low 8 bits of the Y position. |
| 3 | `ATTR` | Palette, priority and flips. |
| 4 | `EXT` | X bits 8-9, Y bit 8, and the disable bit. |

X is a signed 10-bit number, -512 to 511, and Y a signed 9-bit number, -256
to 255, so a sprite can sit partly or wholly off screen. Every sprite is 8×8
and comes from the one sprite CHR bank. A higher sprite number draws over a
lower one.

## Writing video memory cleanly

The client draws from its copy, which an update brings up to date. MIA
builds an update by reading the changed pages from its live RAM, so a write
that lands while MIA is reading can show half old, half new for a frame.
Two status bits, `MIA_STAT_VIDEO_FRAME_REQUESTED` and
`MIA_STAT_VIDEO_FRAME_SENT`, are set from the moment MIA accepts a request
until the client acknowledges it; a program that wants clean frames writes
visible memory only while both are clear. Matching interrupts mark each
step ([Status, IRQ and error codes](../spaces/codes.md)).

## Address entries

These are addresses in MIA RAM, reached through index windows or MIA copy
commands. Decimal addresses come first, then five-digit hexadecimal and
the field or region name. Multi-byte fields are little-endian unless noted.

### 0　　$00000　　VIDEO_VERSION

The version of MIA's video-memory layout. A program can read it before
assuming the control fields, tile banks and sprite records below have the
expected positions. It is local state and is not sent to the video client.
MIA owns the value.

### 1–3　　$00001–$00003　　Local reserved

Three unused bytes in the local-control page. They currently read as zero
and are not included in client updates. Programs should leave them alone
so future firmware can add diagnostics without moving the video layout.

### 4–7　　$00004–$00007　　FRAME_ID

The id of the last video update MIA accepted, stored little-endian. It is
zero until the first update and wraps from `$FFFFFFFF` back to 1. A program
can compare successive snapshots to see whether an update occurred, but
these bytes are counters maintained by MIA, not a way to request a frame.

### 8–9　　$00008–$00009　　LAST_RESPONSE_DIRTY_PAGES

The number of 32-byte pages sent in the last completed video response.
Zero means nothing changed; 2,154 means a full refresh of every page sent
to the client. This helps a program gauge how much video data its writes
caused MIA to transmit. It is diagnostic, read-only state.

### 10–31　　$0000A–$0001F　　Local reserved

The rest of the 32-byte local-control page. MIA sends no part of this page
to the video client, and the reserved bytes currently read as zero. The
first client-visible control byte is `$00020`.

### 32　　$00020　　VIDEO_MODE

Bit 0 enables the video service. When it is off, changing tile or palette
RAM still changes MIA's memory but does not produce the normal rendered
video service. Other bits are reserved in the current layout. This byte
controls the renderer as a whole, rather than any particular layer.

### 33　　$00021　　LAYER_ENABLE

Bits 0, 1 and 2 enable the background, overlay and sprite layers. A layer
whose bit is clear is not drawn, though its memory can still be prepared.
The kernel normally enables the overlay for BASIC's text screen. Toggling
the bit is quicker than erasing and rebuilding a layer.

### 34　　$00022　　BG_VIEWPORT_MODE

Selects how the active background tables join into a scrolling plane.
Modes 0-5 range from one 40-by-25 table to arrangements as large as
160-by-25 or 40-by-100 cells; the layout table above gives each choice.
Changing this byte changes how existing nametable cells are interpreted,
not their stored values.

### 35　　$00023　　BG_ACTIVE_SET

Chooses which four of the eight background tables the renderer uses:
0 selects tables 0-3 and 1 selects tables 4-7. A program can build a new
scene in the inactive set and switch to it with one write. This is a
table-set selection, not a CHR bank number.

### 36–37　　$00024–$00025　　SCROLL_X

The horizontal pixel position of the viewport within its selected
background plane, low byte first. The viewport wraps at the plane's edge,
so increasing the value produces continuous horizontal scrolling. The
range of distinct positions depends on `BG_VIEWPORT_MODE`.

### 38–39　　$00026–$00027　　SCROLL_Y

The vertical pixel position of the background viewport, low byte first.
It wraps within the plane defined by the viewport mode, independently of
the overlay text layer, which stays fixed on screen. A program can change
X and Y together for diagonal scrolling.

### 40　　$00028　　BG_CHR_BANK

The primary CHR bank, 0-7, from which background cells take their tile
pixels. Each cell's nametable byte selects a tile number within that bank.
Cells marked `chrAlt` use the alternate bank at `$00029` instead.

### 41　　$00029　　BG_ALT_CHR_BANK

The alternate CHR bank for background cells whose attribute has `chrAlt`
set. It lets a scene mix tiles from two banks without changing the whole
background's primary bank. Both bank numbers refer to graphics stored in
the CHR area beginning at `$00200`.

### 42　　$0002A　　OVERLAY_CHR_BANK

The primary CHR bank for the fixed overlay layer, which the kernel uses as
the BASIC text screen. A cell's tile number indexes this bank. The kernel
normally selects bank 0, where MIA loads the default character set.

### 43　　$0002B　　OVERLAY_ALT_CHR_BANK

The alternate CHR bank for overlay cells marked `chrAlt`. The kernel
normally chooses bank 1, containing reversed versions of the default
glyphs. A program can change the selection without rewriting the overlay
nametable, but all marked cells then draw from the new bank.

### 44　　$0002C　　SPRITE_CHR_BANK

The CHR bank used by sprite tile numbers. All active sprite records share
this bank; each record chooses its own tile within it. To change a sprite's
shape, edit its tile data or its tile-number byte in OAM.

### 45　　$0002D　　CHR_1BPP_MASK

Bit `n` changes CHR bank `n` from a three-bit-per-pixel tile set into
three separate one-bit-per-pixel planes. The kernel uses this for text in
banks 0 and 1. A program must set the matching plane selector at `$0002E`
so the renderer reads the intended plane for each layer.

### 46　　$0002E　　CHR_1BPP_PLANES

Pairs of bits choose the one-bit plane, 0-2, used by each layer when its
CHR bank is in one-bit mode: bits 0-1 background, 2-3 sprites, and 4-5
overlay. In three-bit mode the three planes combine into each pixel's
color index instead. This byte does not alter the tile data in RAM.

### 47　　$0002F　　BACKDROP_COLOR

Bits 0-2 select a color within a palette, and bits 3-6 select one of the
16 palette banks. The renderer draws that color behind every layer. The
kernel's `KERN_SET_BACKDROP` entry changes this selector without changing
the RGB565 palette values themselves.

### 48　　$00030　　OAM_LAST_INDEX

The highest sprite record the renderer evaluates when the sprite layer is
enabled. Values start at sprite 0, so a value of 9 includes sprites 0-9.
Records above the limit remain in RAM but are skipped during rendering.
Individual records can also carry a disable bit.

### 49–255　　$00031–$000FF　　Render-control reserved

This area follows the currently defined render-control fields and extends
to the palette at `$00100`. Reserved bytes are sent as zero in a full
refresh. Programs should not store private data here, because later video
versions may assign them to new controls.

### 256–511　　$00100–$001FF　　PALETTE

Sixteen palettes each contain eight colors, and each color is a two-byte
little-endian RGB565 value. Color `c` in palette `p` begins at
`$00100 + 16*p + 2*c`. Backgrounds can use all eight colors; for sprites
and overlay cells, color 0 is transparent. MIA loads default colors when
video starts, but a program can replace them to recolor many cells at
once.

### 512–49663　　$00200–$0C1FF　　CHR

Eight banks of tile graphics occupy this region. Bank `b` begins at
`$00200 + $1800*b` and has 256 tiles. Each bank contains three 2 KiB
bitplanes; row `r` of tile `t` is at offset `8*t+r` within each plane.
Bit 0 of a row is the leftmost pixel. Changing CHR data changes every
visible cell or sprite that uses that tile; it does not change their tile
numbers.

### 49664–57663　　$0C200–$0E13F　　BG_NT

Eight background nametables, 1,000 bytes each, hold tile numbers for
40-by-25 cells. Cell `(x,y)` of table `n` is at
`$0C200 + 1000*n + 40*y + x`. The renderer's active set and viewport
mode decide which tables are visible; the cell's attribute lives in the
parallel region beginning at `$0E140`.

### 57664–65663　　$0E140–$1007F　　BG_ATTR

Eight background attribute tables parallel the eight nametables. The
attribute for cell `(x,y)` of table `n` is at
`$0E140 + 1000*n + 40*y + x`. It selects the palette and flags such as
flipping, priority and alternate CHR bank. Changing an attribute affects
how the existing tile number is drawn, not which tile is selected.

### 65664–66663　　$10080–$10467　　OV_NT

The overlay's 40-by-25 tile-number table. Cell `(x,y)` is at
`$10080 + 40*y + x`. The overlay does not scroll with the background, and
the kernel writes BASIC's text here. A program may address it directly
through MIA indexes, but must coordinate with the console if BASIC is
also printing.

### 66664–67663　　$10468–$1084F　　OV_ATTR

One attribute byte for every overlay cell, parallel to the tile-number
table at `$10080`. Cell `(x,y)` is at `$10468 + 40*y + x`. Its palette and
flags determine how the glyph appears; color 0 pixels stay transparent.
The kernel writes attributes with characters so the BASIC screen keeps
its colors and reversed glyphs.

### 67664–68943　　$10850–$10D4F　　OAM

Object attribute memory holds 256 sprite records of five bytes. Sprite
`n` begins at `$10850 + 5*n`: tile, X low, Y low, attribute, then extended
position and disable bits. X is signed over ten bits and Y over nine,
allowing sprites partly off screen. A higher-numbered active sprite draws
over a lower-numbered one; `OAM_LAST_INDEX` can exclude the upper records.
