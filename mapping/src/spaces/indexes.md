# Index descriptors

Ids `$00-$FF`

The CPU reaches MIA RAM only through index descriptors. There are 256, each
holding:

| Field | Size | Meaning |
| --- | --- | --- |
| current address | 24 bits | The MIA RAM byte the window's port reads and writes. |
| default address | 24 bits | Where the reset commands put the current address back, and where a forward wrap lands. |
| limit address | 24 bits | One past the end of the range; a forward wrap happens on reaching it. |
| step | 16 bits | How far the address moves after each access, when the flags ask for it. |
| flags | 8 bits | When to step, which way, and whether to wrap (below). |

A window (A at `$FFE0-$FFE1`, B at `$FFE4-$FFE5`) shows one descriptor at a
time. Binding one doesn't change it, so a program can keep several ready and
switch between them with a single write to `IDXA_SELECT` or `IDXB_SELECT`.
The descriptors' fields are set through the configuration fields
([Configuration fields](config.md)) of the window they are bound to.

## Who owns which ids

| Ids | Owner | Use |
| --- | --- | --- |
| `$00-$4F` | Programs | 80 descriptors, never set up or touched by the firmware, the kernel or BASIC. |
| `$50-$6F` | MIA: input | The input block and its probes. |
| `$70-$BF` | MIA: video | Local and render control, palettes, CHR banks, background tables, overlay. |
| `$C0-$DF` | MIA: video | Sprites 0-31, one record each. |
| `$E0-$E5` | MIA: SD | The SD block's buffers. |
| `$E6-$EF` | MIA: audio | The audio block, each voice, the header, each voice's sequencer status. |
| `$F0-$FF` | Kernel | The console's scroll and the MIA memory routines; `$F6-$FF` reserved. |

## The rules

- **`$00-$4F` are yours.** Nothing else sets or moves them, so a descriptor
  set up once keeps its place across kernel calls and interrupts. The SDK's
  game runtime, when a program links it, takes `$40` and `$41`.
- **MIA's ids are for programs too.** `$50-$EF` are the documented way to
  reach video, input, audio and SD memory, and programs use them. The kernel
  and BASIC use them as well and set the address before each use, so their
  current address doesn't survive a kernel call: `CHROUT`, for one, moves
  `$B8` and `$B9`.
- **Rebind after a kernel call.** Kernel routines leave window A bound to
  whatever id they used last.
- **Interrupts are safe.** The kernel's interrupt handler saves and restores
  both window bindings and `CFG_SELECT` with `MIA_CTX`, so a program's
  bindings survive an interrupt.
- **Never change `$F0-$FF`.**

## The ids the kernel uses

| Id | Use |
| --- | --- |
| `$81` | `video_init`: turn on the overlay layer. |
| `$85` | `video_init`: CHR bank 0 for background, overlay and sprites, bank 1 for the overlay's alternate. |
| `$86` | `video_init`: banks 0 and 1 decoded as one bit per pixel, overlay on plane 0. |
| `$87` | `video_init` and `KERN_SET_BACKDROP`: the backdrop color. |
| `$B8` | The console's character cursor: set to the cell at `CURSOR_X`, `CURSOR_Y` before each write. |
| `$B9` | The console's attribute cursor, the same cell in the attribute table. |
| `$F0-$F3` | Scrolling: the overlay's characters and attributes copied up one row by a MIA copy. |
| `$F4-$F5` | Source and destination of the kernel's MIA memory copy, fill and rectangle routines, behind BASIC's `MPEEK`, `MPOKE`, `MCOPY` and `MFILL`. |
| `$60` | Reading the input block, one byte at a time. |
| `$E0`, `$E4` | `KERN_LOAD`: the SD control block and the transfer buffer. |

## Wrapping

Flags bit 0 steps after a read, bit 1 after a write, bit 2 selects backward
movement, bit 3 enables wrapping and bit 4 requests a wrap interrupt. A
forward wrap happens when the current address reaches the limit and puts
it back at the default; a backward wrap happens when it drops below the
default and puts it at the limit minus one. A window's wrap sets its
`IRQ_IDXA_WRAPPED` or `IRQ_IDXB_WRAPPED` flag when `WRAP_IRQ` is on.

## Index entries

The numbers here are descriptor ids, not RAM addresses. Write one to
`IDXA_SELECT` (`$FFE1`) or `IDXB_SELECT` (`$FFE5`) to bind it to a data
window. Each entry gives decimal id, hexadecimal id and name, followed by
the MIA RAM range it reaches at reset. A streaming index may move after
each read or write; the fixed indexes stay at one address.

### 0–79　　$00–$4F　　Program indexes

These 80 descriptors are for programs to configure. MIA, the kernel and
BASIC do not claim or reset them, so a program can give each one its own
address, step and wrap range. A runtime linked into the same program may
reserve some of them: the SDK game runtime uses `$40-$41`. Coordinate ids
between modules just as you coordinate regions of program MIA RAM.

### 80–87　　$50–$57　　Keyboard probes

Eight fixed one-byte probes for the Keyboard/Keypad bitmap at `$11000`.
`INPUT_SET_PROBE` moves a chosen probe to one bitmap byte, letting a
program repeatedly test the keys represented there without streaming
through all 32 bytes. They do not step after an access.

### 88–95　　$58–$5F　　Consumer-key probes

Eight fixed probes for the Consumer bitmap beginning at `$11020`.
They work like the keyboard probes but target media and other Consumer
usages. `INPUT_SET_PROBE` chooses which bitmap byte each probe watches;
reading one does not advance its address.

### 96　　$60　　MIA_INPUT_INDEX_INPUT_STATE

At reset this index streams the complete 128-byte input block beginning
at `$11000`, including held keys, mouse, gamepads and the clock snapshot.
It is useful for a sequential copy of the block. The kernel also uses it,
so a program should set its address before relying on the current position
after a kernel call.

### 97　　$61　　MIA_INPUT_INDEX_KEYBOARD_BITMAP

Streams the 32-byte Keyboard/Keypad bitmap at `$11000-$1101F`. A program
can read all held-key bits through one port by selecting this id and
reading repeatedly. It differs from the one-byte probes at `$50-$57`,
which remain parked on selected bytes.

### 98　　$62　　MIA_INPUT_INDEX_CONSUMER_BITMAP

Streams the 32-byte Consumer-key bitmap at `$11020-$1103F`. Its bits report
which media or other Consumer usages are held, not text characters.
Selecting the id after another user of the descriptor does not reset its
current position; use a reset command or set its address when needed.

### 99　　$63　　MIA_INPUT_INDEX_MOUSE_STATE

Streams the five mouse bytes at `$11040-$11044`: buttons, X and Y movement,
vertical wheel and horizontal pan. The movement bytes are wrapping
counters, so software compares readings over time. This index provides a
convenient way to fetch the complete mouse state through one CPU port.

### 100–103　　$64–$67　　Gamepad indexes 0–3

One ten-byte streaming descriptor per gamepad slot. Their reset addresses
are `$11050`, `$1105A`, `$11064` and `$1106E` respectively. Each record
holds digital buttons and directions, signed stick positions, trigger
values and a connected bit. The [input chapter](../mia/input.md#gamepads-11050-11077)
explains the record layout.

### 104　　$68　　MIA_INPUT_INDEX_INPUT_CONTROL

Streams eleven bytes from `$11045-$1104F`: device availability and event
flags, masks and acknowledgements. This is the input block's control
area, not the key bitmap. MIA writes event flags, while a program writes
masks and acknowledgements to request and clear input interrupts.

### 105–111　　$69–$6F　　Input reserved

These ids are reserved for future input descriptors. They do not give a
program seven extra general-purpose indexes. Use `$00-$4F` for descriptors
whose addresses and behavior the program owns.

### 112　　$70　　MIA_VIDEO_INDEX_LOCAL_CONTROL

Streams the 32-byte video local-control page at `$00000-$0001F`. This
page holds layout version, frame id and the last dirty-page count. MIA does
not send it to the video client, so this index is mainly for reading its
diagnostics.

### 113　　$71　　MIA_VIDEO_INDEX_FRAME_ID

Starts at `$00004` and spans the four-byte frame id. It is a short route
to the update counter without reading the entire local-control page.
MIA changes the value as frame requests are accepted; programs read it
to observe progress.

### 114　　$72　　MIA_VIDEO_INDEX_LAST_RESPONSE_DIRTY_PAGES

Starts at `$00008` and spans the two-byte count of pages sent in the last
completed video response. A low count can show that writes stayed within
few 32-byte pages. It is read-only diagnostic state, not a limit a program
can set.

### 115–127　　$73–$7F　　Video local-control reserved

Reserved ids beside the local-control indexes. They leave room for later
video diagnostics. The descriptor space, like the video RAM layout, can
grow without reassigning the ids already documented here.

### 128　　$80　　MIA_VIDEO_INDEX_RENDER_CONTROL

Streams 32 bytes from `$00020`, the page containing video mode, layer
enables, viewport, scroll and CHR-bank selections. A program can use it
to inspect or update several related controls; the following ids target
specific fields more directly.

### 129　　$81　　MIA_VIDEO_INDEX_LAYER_ENABLE

Points at `$00021`, the background, overlay and sprite enable bits. The
kernel uses this id to turn on the overlay at startup. Programs can use
it to hide or show a layer without erasing its tile or sprite data.

### 130　　$82　　MIA_VIDEO_INDEX_BG_VIEWPORT

Starts at `$00022` and spans viewport mode and active background set.
Writing the two bytes chooses both the arrangement of background tables
and which set of four tables is active. It does not move the viewport's
pixel scroll position; ids `$83-$84` control that.

### 131　　$83　　MIA_VIDEO_INDEX_SCROLL_X

Starts at `$00024` and cycles over the two-byte horizontal scroll value.
Write low then high byte through the port to move the background viewport
in pixels. The fixed overlay text layer does not follow this scroll.

### 132　　$84　　MIA_VIDEO_INDEX_SCROLL_Y

Starts at `$00026` and cycles over the two-byte vertical scroll value.
The background wraps at the plane's edge. A program changing both scroll
axes can use this id alongside `$83` for diagonal movement.

### 133　　$85　　MIA_VIDEO_INDEX_BANK_SELECT

Streams five bytes from `$00028`: primary and alternate background CHR
banks, primary and alternate overlay CHR banks, then the sprite CHR bank.
The kernel sets its text banks here at startup. Changing a selection
reinterprets existing tile numbers without rewriting nametables.

### 134　　$86　　MIA_VIDEO_INDEX_CHR_1BPP

Cycles over `$0002D-$0002E`, the one-bit CHR bank mask and plane
selectors. These control whether a bank's three planes act as one
three-bit tile set or separate one-bit sets. The kernel uses them for its
text glyphs; changing them affects every layer using those banks.

### 135　　$87　　MIA_VIDEO_INDEX_BACKDROP_COLOR

Points at `$0002F`, the backdrop's palette and color selector. This is
the id used by `KERN_SET_BACKDROP`. It changes the color behind all layers
without touching tile graphics or the palette's RGB565 values.

### 136　　$88　　MIA_VIDEO_INDEX_OAM_LAST

Points at `$00030`, the highest sprite record the renderer evaluates.
Lowering it can hide higher-numbered sprites without changing their
records. The sprite layer still needs its enable bit at `$00021` set.

### 137–143　　$89–$8F　　Video render-control reserved

Reserved ids after the field-specific render controls. They are not
program index slots; use `$00-$4F` for custom pointers into MIA RAM.

### 144–159　　$90–$9F　　Palette indexes 0–15

Each id streams one 16-byte palette bank. Id `$90+p` starts at
`$00100 + 16*p` for palette `p`, with eight two-byte RGB565 colors.
These indexes let a program recolor a palette without calculating the
address fields of a general-purpose descriptor.

### 160–167　　$A0–$A7　　CHR bank indexes 0–7

Each id streams one 6,144-byte CHR bank. Id `$A0+b` begins at
`$00200 + $1800*b`, holding 256 tiles across three bitplanes. A program
that writes a tile through one of these indexes changes every visible
cell or sprite referring to that tile.

### 168–175　　$A8–$AF　　Background nametable indexes 0–7

Each id streams one 1,000-byte table of 40-by-25 background tile numbers.
Id `$A8+n` starts at `$0C200 + 1000*n`. Whether the table appears depends
on the active set and viewport mode, so an off-screen table can be built
before it is displayed.

### 176–183　　$B0–$B7　　Background attribute indexes 0–7

Each id streams a 1,000-byte table parallel to the matching background
nametable. Id `$B0+n` begins at `$0E140 + 1000*n`. The bytes select
palettes, flips, priority and alternate CHR banks for individual cells;
they do not choose the cells' tile numbers.

### 184　　$B8　　MIA_VIDEO_INDEX_OVERLAY_NT

Streams the overlay's 1,000 tile numbers from `$10080`. The kernel's
console uses this descriptor and positions it at the current cursor cell
before writing a character. Its current address therefore changes during
normal BASIC output; a program must set it again after a console call.

### 185　　$B9　　MIA_VIDEO_INDEX_OVERLAY_ATTR

Streams the overlay's 1,000 attribute bytes from `$10468`. The kernel
uses it alongside `$B8` so a printed character receives its palette and
other effects. Direct writes can style screen cells, but coordinate them
with the console, which also writes here.

### 186–191　　$BA–$BF　　Video reserved

Six ids remain reserved after the overlay indexes. They do not have
stable program ownership, even if their present descriptor state appears
unused. The next block belongs to sprites.

### 192–223　　$C0–$DF　　Sprite record indexes 0–31

Each id streams one five-byte OAM sprite record, beginning at
`$10850 + 5*n` for id `$C0+n`. Only sprites 0-31 have dedicated ids;
sprites 32-255 still exist in OAM and can be reached through a program
index or MIA copy. The record gives tile, position, attribute and extended
position/disable bits.

### 224　　$E0　　MIA_SD_INDEX_CONTROL

Streams the 64-byte SD and file-system control block at `$13000`. MIA
commands read request fields here and write results here. The kernel uses
this index for loads, so a program should not expect its current cursor to
survive `KERN_LOAD`.

### 225　　$E1　　MIA_SD_INDEX_SECTOR

Streams the raw 512-byte sector buffer at `$13040`. Raw card read and
write commands exchange exactly one sector through this area. File-system
operations use their own higher-level buffers instead.

### 226　　$E2　　MIA_FS_INDEX_PATH

Streams the 256-byte path buffer at `$13240`. A file command that needs
a name reads its zero-terminated path from this buffer. Complete the path
before triggering the command, and do not overwrite it while the command
is still working.

### 227　　$E3　　MIA_FS_INDEX_DIR_ENTRY

Streams the 256-byte directory-entry result at `$13340`. A directory
read fills it with attributes, size, timestamp and a zero-terminated name.
The next result replaces the record, so copy fields a program needs to
keep.

### 228　　$E4　　MIA_FS_INDEX_TRANSFER

Streams the 1,984-byte file-transfer buffer at `$13440`. `FS_READ` puts
data here and `FS_WRITE` takes data from here. The kernel uses this index
when loading a PRG file, so its cursor may move during file operations.

### 229　　$E5　　MIA_FS_INDEX_PATH2

Streams a second 256-byte path at `$13440`, overlaid on the beginning of
the transfer buffer. Rename commands use it for the destination path.
Because the memory overlaps id `$E4`, the two ids do not provide two
independent buffers.

### 230　　$E6　　MIA_AUDIO_INDEX_ALL

Streams all 80 audio bytes from `$12000`: header and four voice records.
It is useful for a whole-block snapshot or initialization. Live MIA audio
may be reading the same fields, so a program should follow the documented
control sequence when changing voices.

### 231–234　　$E7–$EA　　Audio voice indexes 0–3

One 16-byte index per voice, starting at `$12010`, `$12020`, `$12030`
and `$12040`. Each record contains frequency, envelope, waveform, pan,
control, volume and sequencer status. The [audio chapter](../mia/audio.md#a-voice)
explains the common offsets.

### 235　　$EB　　MIA_AUDIO_INDEX_HEADER

Streams the 16-byte audio header at `$12000`. It includes version,
master volume, status, voice count and sequencer tick rate. This is the
shorter choice when a program does not need the four voice records.

### 236–239　　$EC–$EF　　Audio sequencer status indexes 0–3

One three-byte index per voice, starting at `$12019`, `$12029`, `$12039`
and `$12049`. Each gives a two-byte note index and a sequencer status
byte. MIA updates them while a track plays; they are for observing
progress, not choosing a new note.

### 240–243　　$F0–$F3　　Kernel scroll indexes

The kernel configures these four descriptors as source and destination
pairs for scrolling overlay tile numbers and attributes upward by one row.
Their addresses and positions change during a scroll. Programs must leave
them to the kernel, because console output can scroll at any time.

### 244–245　　$F4–$F5　　Kernel memory indexes

Source and destination descriptors for the kernel's MIA copy, fill and
rectangle services. BASIC's `MPEEK`, `MPOKE`, `MCOPY` and `MFILL` use those
services, which configure the descriptors as needed. A program should use
its own `$00-$4F` indexes for persistent cursor state.

### 246–255　　$F6–$FF　　Kernel reserved

These ids are held for later kernel services. They are not presently
configured for a documented application range and are not available as
general-purpose program indexes. The program-owned block ends at `$4F`.
