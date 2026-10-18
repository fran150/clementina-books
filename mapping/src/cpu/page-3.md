# Page 3: kernel variables

`$0300-$03FF` (768-1023)

Page 3 is the kernel's permanent RAM, like the C64's page 3. The kernel's
console and screen editor keep their state here, `KERN_LOAD` keeps its
working bytes here, and BASIC keeps the scratch for its styled text at the
top. Every byte is named in `kernel.inc` (the kernel's `KVARS`) and listed in
the table at the end of this chapter.

None of it is free. The groups below say what each part does and which
bytes a program can usefully read or change.

## The console: `$0300-$0304`

| Address | Name | Use |
| --- | --- | --- |
| `$0300` | `CURSOR_X` | Cursor column, 0-39. |
| `$0301` | `CURSOR_Y` | Cursor row, 0-24. |
| `$0302` | `TEXT_ATTR` | The attribute byte `CHROUT` gives each new character cell. |
| `$0303` | `LAST_KEY` | The last byte `CHRIN` returned, for debugging. |
| `$0304` | `EDITOR_PEN` | The screen editor's pen. |

The screen is MIA's overlay layer, 40 columns by 25 rows, and each cell has
an attribute byte beside its character ([Video](../mia/video.md) has the
layout). Bits 0-3 pick one of 16 palettes; `$00` at cold start is palette 0,
white text. `TEXT_ATTR` is the pen `CHROUT` writes with right now. BASIC's
output changes it for styled text, and the editor puts its own pen,
`EDITOR_PEN`, back into it each time you start typing a line, so the typed
text keeps the color you set with the editor's `ESC` commands.

To move the cursor, call `KERN_PLOT` (`$042D`) rather than storing into
`CURSOR_X`/`CURSOR_Y`: it checks the range, and the kernel draws the cursor
from more than these two bytes.

## Banks and `KERN_LOAD`: `$0305-$0308`

| Address | Name | Use |
| --- | --- | --- |
| `$0305` | `KLOAD_SAVED_BANK` | The bank that was mapped when `KERN_LOAD` started; mapped again when it returns or fails. |
| `$0306` | `DATA_BANK` | The bank BASIC's `BANK` statement picked. |
| `$0307` | `KLOAD_RUN_BANK` | The bank `KERN_LOAD` maps before it jumps to the loaded program. |
| `$0308` | `KLOAD_MODE` | Bit 7 set when `KERN_LOAD` will jump instead of returning. |

`DATA_BANK` is the one to know. `BANK n` stores `n` here, and `BLOAD`,
`BRUN`, `BSAVE`, `PEEK`, `POKE` and `SYS` map that bank at `$8000-$BFFF`
while they work there. Cold start and warm start set it to 0.
[Extended RAM](extended-ram.md) has the details.

## The cursor: `$0309-$030B`, `$037E-$037F`

The cursor is drawn in software: the kernel saves the cell under it and
draws the cursor tile in its place. `CURSOR_VISIBLE` (`$0309`) is nonzero
while it is drawn, and `CURSOR_SAVE_CHR`/`CURSOR_SAVE_ATTR` (`$030A-$030B`)
hold the saved cell. The cursor shows only while the kernel waits for a key.
`CURSOR_BLINK_ACTIVE` (`$037E`) is nonzero then, and the Timer 1 interrupt
counts down `CURSOR_BLINK_COUNT` (`$037F`) and flips the cursor every 80
ticks. The blink follows the CPU clock, as `KJIFFY` does.

## The screen editor: `$030C-$037D`, `$0380-$03D2`

Clementina's editor works like the C64's: you move the cursor anywhere on
the screen, change what is there, and press RETURN to hand the whole line to
BASIC.

- **`LINE_LINK` (`$030C-$0324`)** has one byte per screen row. Bit 7 set
  means the row starts a logical line; clear means it continues the row
  above, because a line wrapped. RETURN reads the whole logical line under
  the cursor, up to two rows.
- **`EDIT_BUF` (`$0325-$0374`)** receives that line, 80 characters at most,
  and **`EDIT_ATTR_BUF` (`$0380-$03CF`)** the attribute of each character, in
  parallel. `KERN_EDITKEY` then hands the line to BASIC one byte at a time:
  `EDIT_LEN` (`$0375`) is its length with trailing spaces trimmed,
  `EDIT_IDX` (`$0376`) the next byte to hand out, and `EDIT_STATE` (`$0377`)
  is nonzero until the last.
- **`EDIT_START_X`/`EDIT_START_Y` (`$0378-$0379`)** remember where the input
  began, past any prompt, so a line typed after `INPUT`'s `?` doesn't include
  the prompt.
- **`EDIT_RS` to `EDIT_LL` (`$037A-$037D`)** are scratch for finding the
  logical line and for insert and delete.
- **`EDIT_MODE` (`$03D0`)** is the glyph mode, 0-2. In modes 1 and 2 the keys
  type tiles from the upper half of the character set; `ESC M` steps the
  mode. [Character set and palette](../appendix/charset-palette.md) shows
  which key types which tile.
- **`EDIT_PAINT` (`$03D1`)** is nonzero while Paint mode is on, and
  **`EDIT_CMD_PENDING` (`$03D2`)** between `ESC` and its command key.

## BASIC's styled text: `$03D3-$03FF`

Clementina's BASIC keeps an attribute for every character of a string, so
text keeps its colors when it is stored and printed again. These bytes
belong to BASIC:

- **`STYLE_SIDE_BUF` (`$03D3-$03FC`)** is the tokenizer's scratch. While you
  enter a program line, it collects the attributes of the line's string
  literals here before storing them after the line
  ([BASIC's workspace](basic-workspace.md#program-lines) shows where).
  Statements that never run while a line is being entered reuse parts of it:
  `LIST` keeps a pointer at `$03D3-$03D4`, and `TRACK`, `BAND`, `VTAKE` and
  `VGIVE` use `$03D3-$03F9` for their own work.
- **`BASIC_DEFAULT_ATTR` (`$03FD`)** is the attribute `COLOR`, `FLIPX`, `FLIPY`
  and `ALT` set for BASIC's output.
- **`BASIC_STYLE_MASK` (`$03FE`)** says which attribute bits `STYLE n`
  overrides, in the attribute byte's own bit positions.
- **`STYLE_BASE_LEN` (`$03FF`)** is tokenizer scratch: the line's length
  before its attributes are added.

{{#include ../../../tables/cpu-memory-map.md:kernel-variables}}
