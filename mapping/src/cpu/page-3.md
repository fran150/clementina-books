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

## Address entries

These are working bytes, not an extra free page. Decimal addresses come
first, followed by hexadecimal and the source label.

### 768　　$0300　　CURSOR_X

The console's current text column, from 0 to 39. The kernel changes it as
characters are printed or the cursor is moved. Use `KERN_PLOT` to move the
cursor, because that routine also maintains the visible cursor state.

### 769　　$0301　　CURSOR_Y

The console's current text row, from 0 to 24. It changes when output wraps,
scrolls or a program calls `KERN_PLOT`. Reading the pair at `$0300-$0301`
shows where the next printed character will go, but writing the pair alone
does not update the cell saved under the software cursor.

### 770　　$0302　　TEXT_ATTR

The attribute byte the console will give its next character cell. Its low
four bits select a palette; other bits control effects such as alternate
glyphs. BASIC changes it while printing styled text, and the editor
restores its own pen when you start typing a line. This is a current output
setting, not an attribute already stored on the screen.

### 771　　$0303　　LAST_KEY

The last character byte returned by the kernel's blocking input routine,
`KERN_CHRIN`. It is useful for inspecting recent input while debugging,
but it does not count queued keys or record every key transition. A later
read of input replaces it.

### 772　　$0304　　EDITOR_PEN

The screen editor's current drawing attribute. Its `ESC` commands change
this pen, and the editor copies it into `TEXT_ATTR` when it begins another
line of typed text. It is kept separately from BASIC's output attribute so
printed program text need not permanently change the typing color.

### 773　　$0305　　KLOAD_SAVED_BANK

When `KERN_LOAD` begins, it records the extended-RAM bank currently mapped
at `$8000-$BFFF` here. The loader maps that bank again when it returns or
reports an error. This is internal loader state, not the bank chosen for a
future BASIC operation.

### 774　　$0306　　DATA_BANK

The bank number, 0-31, selected by BASIC's `BANK` statement. BASIC uses it
for `PEEK`, `POKE`, `SYS` and file operations whose CPU address falls in
the `$8000-$BFFF` window, restoring bank 0 afterward. `BANK` changes this
byte without immediately changing the hardware mapping. Cold and warm
start set it back to 0.

### 775　　$0307　　KLOAD_RUN_BANK

The extended-RAM bank `KERN_LOAD` will map before it jumps to a newly
loaded program. This may differ from the bank that was mapped when the
load started, held at `$0305`. Programs leave the byte to the loader.

### 776　　$0308　　KLOAD_MODE

Bit 7 tells `KERN_LOAD` to jump to the loaded program instead of returning
to its caller. The loader consults this byte after the transfer completes.
It is part of the implementation of `BRUN` and other load-and-run paths,
not a general program mode switch.

### 777　　$0309　　CURSOR_VISIBLE

Nonzero while the kernel's software cursor is drawn on the overlay. The
kernel saves the cell beneath it before drawing, then restores that cell
when it hides the cursor. Changing this flag without updating the saved
cell can leave a cursor mark on the screen.

### 778　　$030A　　CURSOR_SAVE_CHR

The tile number that was in the screen cell before the visible cursor
covered it. The kernel restores this tile when the cursor disappears.
Together with the saved attribute at `$030B`, it preserves the underlying
screen cell while the cursor blinks.

### 779　　$030B　　CURSOR_SAVE_ATTR

The attribute byte belonging to the cell saved at `$030A`. It preserves
the cell's palette and other drawing flags while the cursor is visible.
The pair matters only to the cursor renderer; program code should change
screen cells through the console or MIA video memory.

### 780–804　　$030C–$0324　　LINE_LINK

One byte for each of the screen's 25 text rows. Bit 7 marks the start of a
logical input line; when the bit is clear, that row continues a line from
above. The editor uses these links when RETURN is pressed away from the
bottom of the screen, so it can recover a wrapped line rather than only
the row under the cursor.

### 805–884　　$0325–$0374　　EDIT_BUF

The 80-character line the screen editor has collected from the overlay.
After RETURN, `KERN_EDITKEY` hands these characters to BASIC one at a time.
The parallel attributes are at `$0380-$03CF`; the valid character count is
`EDIT_LEN` at `$0375`. The next edited line replaces this buffer.

### 885　　$0375　　EDIT_LEN

The number of characters currently valid in `EDIT_BUF`, after trailing
spaces have been trimmed. BASIC reads only this many characters from the
edited line. It is a length, not the address of the end of the buffer.

### 886　　$0376　　EDIT_IDX

The position of the next character `KERN_EDITKEY` will return from
`EDIT_BUF`. It advances as BASIC consumes an edited line. When it reaches
`EDIT_LEN`, the editor finishes the line with a carriage return.

### 887　　$0377　　EDIT_STATE

Nonzero while the editor is handing an already harvested line to BASIC.
This lets repeated calls to `KERN_EDITKEY` continue the same line without
harvesting the screen again. Once the line has been delivered, the state
is cleared for the next edit.

### 888　　$0378　　EDIT_START_X

The column where the current input began, after a prompt if one was
printed. The editor uses it when collecting the line so the prompt itself
is not sent back to BASIC as typed input. Its matching row is at `$0379`.

### 889　　$0379　　EDIT_START_Y

The row where the current input began. With `EDIT_START_X`, it tells the
screen editor which cells belong to the user's reply rather than the
prompt. Scrolling or another input operation can change it.

### 890　　$037A　　EDIT_RS

Scratch for the row where a logical edited line starts. A line may wrap
over two physical screen rows, so the editor must find its first row before
collecting it. This byte is recalculated while a line is edited.

### 891　　$037B　　EDIT_RE

Scratch for the final row of a logical edited line. The editor combines it
with `EDIT_RS` to collect one or two physical rows. It is internal editing
state, not a saved cursor position for a program.

### 892　　$037C　　EDIT_CP

The editor's temporary character position while inserting or deleting
within a logical line. It changes as cells are shifted on the overlay.
The visible cursor coordinates live separately at `$0300-$0301`.

### 893　　$037D　　EDIT_LL

The logical line's cell count while the editor processes insertions and
deletions. It can cover two screen rows, up to 80 cells. The count is
scratch for editing, not the final length handed to BASIC; that length is
`EDIT_LEN` at `$0375`.

### 894　　$037E　　CURSOR_BLINK_ACTIVE

Nonzero while `KERN_CHRIN` waits for input and the cursor should blink.
The Timer 1 interrupt checks it before touching the cursor. This explains
why the cursor can blink while the main program is waiting but not during
ordinary output.

### 895　　$037F　　CURSOR_BLINK_COUNT

A countdown in VIA Timer 1 ticks until the next cursor change. The kernel
reloads it with 80, so the blink rate follows the CPU clock and Timer 1
rate. It is not a wall-clock timer; use MIA's clock for elapsed time.

### 896–975　　$0380–$03CF　　EDIT_ATTR_BUF

One attribute byte for each possible character in `EDIT_BUF`. The editor
harvests these from the overlay along with the text, preserving typed
colors and other styling. BASIC uses them while storing styled string
literals in a program line. The next harvested line replaces them.

### 976　　$03D0　　EDIT_MODE

The current keyboard-to-glyph mode, 0, 1 or 2. `ESC M` advances it, allowing
keys to enter tiles from different parts of the character set. It changes
the codes produced by future typing, not characters already on screen.

### 977　　$03D1　　EDIT_PAINT

Nonzero while the editor's Paint mode is active. In that mode the editor
uses its pen to change the appearance of existing cells. The flag belongs
to interactive editing and can change through `ESC` commands.

### 978　　$03D2　　EDIT_CMD_PENDING

Nonzero after the user presses `ESC` and before the editor receives the
command key that follows it. While pending, the next key is interpreted as
an editor command rather than ordinary text. The flag clears once the
command has been handled.

### 979–1020　　$03D3–$03FC　　STYLE_SIDE_BUF

Forty-two bytes of BASIC scratch for styles attached to string literals
in a line being entered. The tokenizer collects attribute bytes here before
placing a style sidecar after the stored line. Other statements that cannot
run during tokenization, including `LIST`, `TRACK` and `BAND`, reuse parts
of the area. It cannot hold persistent program data.

### 1021　　$03FD　　BASIC_DEFAULT_ATTR

The default output attribute set by BASIC's `COLOR`, `FLIPX`, `FLIPY` and
`ALT` statements. When BASIC prints text with no saved style, it uses this
attribute to choose the palette and drawing effects. It is separate from
the screen editor's pen at `$0304`.

### 1022　　$03FE　　BASIC_STYLE_MASK

The mask of attribute bits overridden by `STYLE n`. BASIC combines this
mask with an existing attribute when it prints styled text. The bits are
in the same positions as the overlay attribute byte described in the
[video chapter](../mia/video.md#attributes).

### 1023　　$03FF　　STYLE_BASE_LEN

The tokenizer's length of a program line before it adds any style sidecar.
It uses the value to place style records after the line's ordinary tokens
without confusing them with executable text. Another line entry replaces
it; it is not the length of the current screen line.
