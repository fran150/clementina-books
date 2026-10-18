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

{{#include ../../../tables/mia-video-ram.md}}

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
