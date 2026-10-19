# Graphics

The picture is the same one BASIC draws ([Graphics](../basic/graphics.md)):
a backdrop, a scrolling background, sprites and the text overlay, built from
8 by 8 tiles in CHR banks and colored by 16 palettes. That chapter explains
the layers, the tile format and the palettes; this one shows how machine code
reaches them through MIA's video indexes, and how it keeps its changes clean.

## Video memory

The picture's whole description sits in the first 68,944 bytes of MIA's RAM:

{{#include ../../../tables/mia-video-ram.md}}

Writing any of it changes the picture. MIA notes which 32-byte **pages** a
program changed and sends only those to the video client, when the client asks
for an update. Nothing needs to be told that a change happened.

## The video indexes

MIA sets up an index for each video structure when it starts, so machine code
needs no configuration to write the picture. Each one steps forward one byte
on every read and write and wraps at its end:

| Index | `mia.inc` name | Covers |
| --- | --- | --- |
| `$80` | `MIA_VIDEO_INDEX_RENDER_CONTROL` | The whole render control page, `$00020-$0003F`. |
| `$81` | `MIA_VIDEO_INDEX_LAYER_ENABLE` | The layer switches. |
| `$82` | `MIA_VIDEO_INDEX_BG_VIEWPORT` | Background map mode and set. |
| `$83` | `MIA_VIDEO_INDEX_SCROLL_X` | Scroll X, low byte then high. |
| `$84` | `MIA_VIDEO_INDEX_SCROLL_Y` | Scroll Y, low byte then high. |
| `$85` | `MIA_VIDEO_INDEX_BANK_SELECT` | The five CHR bank choices. |
| `$86` | `MIA_VIDEO_INDEX_CHR_1BPP` | Which banks are 1bpp, and their planes. |
| `$87` | `MIA_VIDEO_INDEX_BACKDROP_COLOR` | The backdrop color. |
| `$88` | `MIA_VIDEO_INDEX_OAM_LAST` | The last sprite drawn. |
| `$90-$9F` | `MIA_VIDEO_INDEX_PALETTE_0` + *n* | Palette *n*, 16 bytes. |
| `$A0-$A7` | `MIA_VIDEO_INDEX_CHR_BANK_0` + *n* | CHR bank *n*, 6,144 bytes. |
| `$A8-$AF` | `MIA_VIDEO_INDEX_BG_NT_0` + *n* | Background table *n*'s tiles, 1,000 bytes. |
| `$B0-$B7` | `MIA_VIDEO_INDEX_BG_ATTR_0` + *n* | Background table *n*'s attributes. |
| `$B8` | `MIA_VIDEO_INDEX_OVERLAY_NT` | The overlay's characters. |
| `$B9` | `MIA_VIDEO_INDEX_OVERLAY_ATTR` | The overlay's attributes. |
| `$C0-$DF` | `MIA_VIDEO_INDEX_OAM_SPRITE_0` + *n* | Sprite *n*'s record, 5 bytes, for sprites 0-31. |

The kernel and BASIC use these indexes too: the kernel prints through `$B8`
and `$B9`, and BASIC's graphics statements use the others. They leave each
index wherever their last access put it, so machine code resets an index
before streaming a structure from its start. A small routine does it:

```asm
; Moves the index in A back to its default address.
reset_index:
        sta CMD_PARAM1
        lda #MIA_CMD_RESET_INDEX
        sta CMD_TRIGGER
@wait:  lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne @wait
        rts
```

The one-field indexes, `$81`, `$87` and `$88`, wrap after every access, and the
two-byte ones, `$83` and `$84`, after every pair; as long as a program always
writes them in whole pairs, they never need resetting.

## Render control

The render control page decides how the picture is put together:

{{#include ../../../tables/mia-video-render-control.md}}

Scrolling is the cheapest change there is: two bytes, one page, and the whole
background moves. With the X and Y indexes in the two windows, a scroll is
four stores:

```asm
        lda #MIA_VIDEO_INDEX_SCROLL_X
        sta IDXA_SELECT
        lda #MIA_VIDEO_INDEX_SCROLL_Y
        sta IDXB_SELECT
        ; ...
        lda scroll_x
        sta IDXA_PORT           ; low byte
        lda scroll_x+1
        sta IDXA_PORT           ; high byte; the index wraps to the low byte
        lda scroll_y
        sta IDXB_PORT
        lda scroll_y+1
        sta IDXB_PORT
```

## A sprite from machine code

This routine draws a ball in tile 0 of CHR bank 2, makes bank 2 the sprites'
bank, puts sprite 0 near the middle of the screen in palette 4, whose color 1
is green, and turns the sprite layer on. The ball uses only plane 0, so its
pixels have color index 1; the other planes of bank 2 are zero at power-on.

<!-- example: org=$0280 prg=BALL.PRG run="BLOAD \"BALL.PRG\"|SYS 640|A=$10850: PRINT MPEEK(A);MPEEK(A+1);MPEEK(A+2)|PRINT MPEEK(A+3);MPEEK($21)" -->
```asm
.include "clementina.inc"

        lda #MIA_VIDEO_INDEX_CHR_BANK_0+2
        jsr reset_index         ; to tile 0, plane 0 of bank 2
        sta IDXA_SELECT
        ldx #0
tile:   lda ball,x
        sta IDXA_PORT
        inx
        cpx #8
        bne tile

        lda #MIA_VIDEO_INDEX_BANK_SELECT
        jsr reset_index
        sta IDXA_SELECT
        ldx #4
skip:   lda IDXA_PORT           ; step over the four bank choices before it
        dex
        bne skip
        lda #2
        sta IDXA_PORT           ; sprite CHR bank

        lda #MIA_VIDEO_INDEX_OAM_SPRITE_0
        jsr reset_index
        sta IDXA_SELECT
        ldx #0
oam:    lda sprite,x
        sta IDXA_PORT
        inx
        cpx #5
        bne oam

        lda #MIA_VIDEO_INDEX_OAM_LAST
        sta IDXA_SELECT
        stz IDXA_PORT           ; draw sprite 0 only

        lda #MIA_VIDEO_INDEX_LAYER_ENABLE
        sta IDXA_SELECT
        lda IDXA_PORT           ; the read steps and wraps
        ora #MIA_VIDEO_LAYER_SPRITES
        sta IDXA_PORT
        rts

reset_index:
        pha
        sta CMD_PARAM1
        lda #MIA_CMD_RESET_INDEX
        sta CMD_TRIGGER
@wait:  lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne @wait
        pla
        rts

ball:   .byte %00111100, %01111110, %11111111, %11111111
        .byte %11111111, %11111111, %01111110, %00111100
sprite: .byte 0                 ; tile
        .byte 156, 96           ; X, Y
        .byte 4                 ; ATTR: palette 4
        .byte 0                 ; EXT: X and Y below 256, shown
```

```text
 0  156  96

READY.
PRINT MPEEK(A+3);MPEEK($21)
 4  6
```

The last number is the layer byte: 2, the overlay, which was on, plus 4 for
the sprites.

A sprite record is five bytes:

| Byte | Holds |
| --- | --- |
| 0 | The tile, in the sprite CHR bank. |
| 1 | X, low 8 bits. |
| 2 | Y, low 8 bits. |
| 3 | `ATTR`: palette in bits 0-3, behind the background in bit 4, flipped horizontally in bit 5, vertically in bit 6. |
| 4 | `EXT`: X bits 8-9 in bits 0-1, Y bit 8 in bit 2, hidden in bit 3. |

X is a signed 10-bit number, -512 to 511, and Y a signed 9-bit one, -256 to
255, so a sprite can slide in from any edge. The visible screen is X 0-319, Y
0-199. MIA has 256 records, but only the first 32 have ready-made indexes;
records 32-255 start at `$10850 + n*5` and are reached through an index of the
program's own. MIA draws records 0 to `OAM_LAST_INDEX` and skips the rest, so
a game with 10 sprites sets it to 9.

Moving a sprite means writing bytes 1 and 2 again, and byte 4 if a coordinate
crosses 255. Because the sprite's index wraps every five bytes, a program can
write all five each time without resetting it, as long as it always writes
five.

## When the client sees a change

The video client draws its own copy of MIA's video memory and asks MIA for the
changed pages many times a second. Answering takes MIA a little while: it
reads the pages it is sending from its RAM as it builds the answer, and may
read them again if Wi-Fi loses a packet, until the client confirms it has the
update. A program that changes a visible page during that time may have the
client draw a mix of old and new bytes for one update. The next update puts it
right.

Two status bits tell a program where MIA is:

| Bit | Name | Set |
| --- | --- | --- |
| 5 | `MIA_STAT_VIDEO_FRAME_REQUESTED` | From the moment MIA accepts the client's request until the client confirms. |
| 6 | `MIA_STAT_VIDEO_FRAME_SENT` | From the moment MIA has sent the whole update once until the client confirms. |

When both are clear, every change goes cleanly into the next update. That
allows two ways of writing a program.

**Free-running.** The program ignores the client and runs at its own speed.
Its changes reach the client within an update or two, and now and then the
client may draw an update with half of a change. This suits most programs,
and all of BASIC.

**Paced by the client.** The program waits for both bits to clear before
changing anything visible:

```asm
main:   lda STATUS_L
        and #(MIA_STAT_VIDEO_FRAME_REQUESTED | MIA_STAT_VIDEO_FRAME_SENT)
        bne main
        jsr read_input
        jsr move_things
        jsr draw
        bra main
```

Every update is then clean, and the program runs once per update, at the
client's pace. If Wi-Fi is slow or the client stops, so does the program.

Changes to things not on the screen are always safe: a CHR bank no layer
uses, a background table in the set not shown, a sprite record past
`OAM_LAST_INDEX`. A program can prepare the next room in the hidden set at any
moment and switch `BG_ACTIVE_SET` when the bits are clear.

### Interrupts from the video client

Three interrupt bits follow the same steps, so a program can wait for them
without polling:

| Bit | Name | Raised when |
| --- | --- | --- |
| 5 | `IRQ_VIDEO_FRAME_REQUEST` | MIA accepts the client's request. |
| 6 | `IRQ_VIDEO_FRAME_SENT` | MIA has sent the whole update once. |
| 7 | `IRQ_VIDEO_FRAME_ACKED` | The client confirms it. |

For clean updates, enable `IRQ_VIDEO_FRAME_ACKED` and do the drawing after
it. Enabling `IRQ_VIDEO_FRAME_SENT` instead gains a little time at the risk of
a changed page going out again in a repair. How a handler is chained in front
of the kernel's is in [Interrupts](../ml/interrupts.md), and how it reads
MIA's flags in [The MIA programming model](model.md).

## Keeping updates small

The client receives pages over Wi-Fi, so what costs is how many pages change,
not how many bytes:

- Scroll the background instead of rewriting it.
- Move sprites instead of redrawing background tiles.
- Load CHR banks and palettes at the start, or into banks not in use.
- Avoid `MIA_CMD_VIDEO_FORCE_FULL_REFRESH` (`$42`) while a game runs. It marks
  every page changed, all 2,154 of them, so the client gets the whole picture
  again. It is meant for a client that has lost track, and the first update
  after a client connects is a full one anyway.

After an update, MIA puts the number of pages it sent at `$00008-$00009`, in
the local control page, which is never sent to the client. Index `$72` reads
it. A program can check it to notice that it is changing more than it meant to.

## Where this is in Mapping Clementina

The video block byte by byte is in *Mapping Clementina*,
[Video](../../../mapping/src/mia/video.md).
