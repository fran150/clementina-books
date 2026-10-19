# Appendix D: Runtime routine index

Every macro of the asset runtime, from `runtime.inc` in the SDK's
`packages/runtime/asm`. [The asset runtime](../building/runtime.md)
explains them.

Arguments: an asset or an instance is its label. Any other argument is
`#value` or the memory that holds it. A *byte* takes one byte, a *word*
two, a *location* three. Every routine returns carry clear on success, and
carry set with the reason in `rt_error` on failure.

## Every asset

| Macro | Arguments | Returns |
| --- | --- | --- |
| `Load asset[, location]` | location | |
| `LoadStart asset[, location]` | location | |
| `LoadBusy` | | A = 0 once done |
| `LoadWait` | | the load's result |
| `LoadPart asset, offset, length, location` | location, location, location (offset and length are 3 bytes) | |
| `Relocate asset, location` | location | |
| `Forget asset` | | |

## Palettes and tilesets

| Macro | Arguments | Returns |
| --- | --- | --- |
| `UsePalettes config` | | |
| `UsePaletteBank config, bank[, target]` | byte 0-15, byte 0-15 | |
| `UseTileset tileset, chrBank` | byte 0-7 | |

## Backgrounds

Map columns and rows are words; table numbers, table columns and rows, and
counts are bytes.

| Macro | Arguments | Returns |
| --- | --- | --- |
| `DrawScreen bg, col, row, table` | word, word, byte 0-7 | |
| `DrawRect bg, col, row, width, height, table, tcol, trow` | word, word, byte, byte, byte, byte, byte | |
| `DrawColumn bg, col, row, count, table, tcol, trow` | word, word, byte, byte, byte, byte | |
| `DrawRow bg, col, row, count, table, tcol, trow` | word, word, byte, byte, byte, byte | |
| `GetCell bg, col, row` | word, word | A = tile, X = attribute |
| `SetCell bg, col, row, tile, attr` | word, word, byte, byte | |
| `LoadRect bg, col, row, width, height[, location]` | word, word, word, word, location | |
| `LoadRows bg, row, count[, location]` | word, word, location | |
| `LoadColumns bg, col, count[, location]` | word, word, location | |

## The overlay

| Macro | Arguments | Returns |
| --- | --- | --- |
| `ShowOverlay overlay` | | |
| `FillPlaceholder overlay, placeholder, tiles` | byte, word (the address of the tile numbers) | |

## Sprites

| Macro | Arguments | Returns |
| --- | --- | --- |
| `LoadSprites file[, location]` | location | |
| `LoadShape file, shape[, location]` | byte, location | |
| `LoadAnimation file, anim[, location]` | byte, location | |
| `LoadAnimationShapes file, anim` | byte | |
| `ForgetShape file, shape` | byte | |
| `DrawShape file, shape, sprite, x, y[, flips]` | byte, byte, word, word, byte | A = the next free sprite record |
| `HideSprites first, count` | byte, byte (0: 256) | |
| `SetSpriteCount count` | byte (0: 256) | |

## Animations

`inst` is a block of `RT_ANIM_SIZE` (12) bytes the game reserves.

| Macro | Arguments | Returns |
| --- | --- | --- |
| `StartAnimation inst, file, anim, sprite, x, y` | sprite file label, byte, byte, word, word | |
| `TickAnimation inst` | | A: `RT_TICK_FRAME` (1) a new frame, `RT_TICK_WRAP` (2) back to frame 0 |
| `MoveAnimation inst, x, y` | word, word | |
| `StopAnimation inst` | | |

## Sound

| Macro | Arguments | Returns |
| --- | --- | --- |
| `PlaySong song` | | |
| `StopSong song` | | |
| `SongPosition voice` | byte 0-3 | A/X = note index, Y = sequencer status |
| `PlaySound sound, voice` | byte 0-3 | |
| `TickSound voice` | byte 0-3 | A = 0 once the sound is over |
| `StopSound voice` | byte 0-3 | |

## Video

| Macro | Arguments | Returns |
| --- | --- | --- |
| `SetLayers mask` | byte: bit 0 background, bit 1 overlay, bit 2 sprites | |
| `SetChrBanks bg, bgAlt, overlay, overlayAlt, sprites` | 5 bytes 0-7 | |
| `SetScroll x, y` | word, word | |
| `SetViewport mode, set` | byte 0-5, byte 0-1 | |

## Interrupt handlers

| Macro | Does |
| --- | --- |
| `RuntimeSave` | Pushes the runtime's 42 zero-page bytes. Uses A and X. |
| `RuntimeRestore` | Waits for MIA's last command, then pulls them back. Uses A and X. |

Write `MIA_CTX_PUSH` to `MIA_CTX` before `RuntimeSave`, and `MIA_CTX_POP`
after `RuntimeRestore`.

## Constants

| Name | Value | Meaning |
| --- | --- | --- |
| `RT_NOT_LOADED` | `$FFFFFF` | The location of something not loaded. |
| `RT_BANK_LOC(bank, address)` | | The location of an address in a CPU bank. |
| `RT_ERR_NOT_LOADED` | 1 | The asset or item isn't loaded. |
| `RT_ERR_LOCATION` | 2 | A location is invalid, or of the wrong kind. |
| `RT_ERR_FILE` | 3 | The SD card reported an error, or the file is short. |
| `RT_ERR_RANGE` | 4 | Coordinates or a size fall outside the asset. |
| `RT_ERR_MISSING` | 5 | A shape an animation uses isn't loaded. |
| `RT_ERR_ARGUMENT` | 6 | An argument is out of range. |
| `RT_ANIM_SIZE` | 12 | Bytes in an animation instance. |
| `RT_STATE_SIZE` | 42 | Zero-page bytes `RuntimeSave` keeps. |

## Descriptor fields

A descriptor's fields, as offsets from its label, for code that reads them
directly. Every descriptor starts with:

| Offset | Name | Size | Contents |
| ---: | --- | ---: | --- |
| 0 | `RT_D_TYPE` | 1 | Kind: 1 palettes, 2 tileset, 3 background, 4 overlay, 5 sprites, 6 song, 7 sound |
| 1 | `RT_D_LOC` | 3 | Where it is now, or `RT_NOT_LOADED` |
| 4 | `RT_D_DEFAULT` | 3 | Its default slot's location |
| 7 | `RT_D_SIZE` | 3 | Its file's size |
| 10 | `RT_D_PATH` | 2 | Address of its file's path, ending in 0 |

Then, by kind:

| Kind | Offset | Name | Size | Contents |
| --- | ---: | --- | ---: | --- |
| Tileset | 12 | `RT_D_BPP1` | 1 | Not 0 for a 1 bpp tileset |
| Background | 12 | `RT_D_WIDTH` | 2 | Map columns |
| | 14 | `RT_D_HEIGHT` | 2 | Map rows |
| | 16 | `RT_D_WIN_COL` | 2 | The loaded window's first column |
| | 18 | `RT_D_WIN_ROW` | 2 | Its first row |
| | 20 | `RT_D_WIN_COLS` | 2 | Its columns |
| | 22 | `RT_D_WIN_ROWS` | 2 | Its rows |
| Overlay | 12 | `RT_D_HOLES` | 1 | Placeholders |
| | 13 | `RT_D_HOLE_TABLE` | 2 | Address of column, row, width and height per placeholder |
| Sprites | 12 | `RT_D_SHAPES` | 1 | Shapes |
| | 13 | `RT_D_ANIMS` | 1 | Animations |
| | 14 | `RT_D_ITEMS` | 2 | Address of each item's offset (3 bytes) and size (2) |
| | 16 | `RT_D_LOCS` | 2 | Address of each item's location (3 bytes) |
| Song | 12 | `RT_D_VOICES` | 8 | Each voice's track offset in the file, `$FFFF` for none |
| Sound | 12 | `RT_D_ENTRIES` | 2 | Frames |

An animation instance:

| Offset | Name | Size | Contents |
| ---: | --- | ---: | --- |
| 0 | `RT_ANIM_FILE` | 2 | Its sprite file's descriptor |
| 2 | `RT_ANIM_NUMBER` | 1 | Animation number in the file |
| 3 | `RT_ANIM_FRAME` | 1 | Current frame |
| 4 | `RT_ANIM_TICKS` | 1 | Ticks left in it |
| 5 | `RT_ANIM_X` | 2 | X position |
| 7 | `RT_ANIM_Y` | 2 | Y position |
| 9 | `RT_ANIM_SPRITE` | 1 | First sprite record |
| 10 | `RT_ANIM_DRAWN` | 1 | Sprites the current frame uses |
| 11 | `RT_ANIM_FLAGS` | 1 | Bit 7: running |
