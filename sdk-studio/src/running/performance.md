# Performance

A game runs once per frame, and a frame has a fixed number of CPU cycles.
This chapter gives the budget, what the common operations cost, and how to
spend less. Every figure is in CPU cycles, measured in the emulator. A
65C02's cycle counts don't depend on its clock, so they hold at any speed;
time is cycles divided by the clock.

The figures were measured with the emulator at `b7ca75e` and the ROM at
`1446d0f`, and come from the SDK's `docs/gamedev/performance.md`. The SDK's
`scripts/measure-performance.mjs` measures them again.

## The budget

The video client asks MIA for a frame 25 times a second by default (`--fps`,
5 to 30). A game that updates once per frame has:

| CPU clock | 25 frames/s | 30 frames/s |
| --- | ---: | ---: |
| 1.2 MHz, the default | 48,000 | 40,000 |
| 4.6875 MHz, the fastest at the Pico's rated clock | 187,500 | 156,250 |
| 8 MHz, the most MIA can be asked for | 320,000 | 266,667 |

The clock the board will really run at isn't known until it is built:
the glue logic is rated to about 6.5 MHz. Plan for the default, 1.2 MHz.

The kernel's timer interrupt takes 66 cycles every 6,250, about 1% of the
CPU at any clock, unless the game turns it off.

## What the emulator doesn't count

MIA's own work takes no time in the emulator: its commands, its DMA copies
and SD card transfers finish at once. On the board they take real time. A
runtime routine that starts a copy returns without waiting, and the next
call waits for it to finish, so on the board that wait comes on top of the
figures here. Loads from the card aren't listed at all: the emulator's card
has no real timing. MIA's SPI clock allows at most 1.5 MB/s from the card;
expect a few hundred KB/s.

## MIA and the kernel

| Operation | Cycles |
| --- | ---: |
| Read or write a MIA register | 4 |
| Write a sprite's 5-byte record through its own index | 46 |
| Point an index at a MIA address (the runtime's seek) | 147 |
| Copy from the CPU to MIA through a window, simple loop | 13 per byte |
| The same, unrolled 8 times | 9.4 per byte |
| Copy from MIA to the CPU, simple loop | 14 per byte |
| `KERN_CHROUT`, a printable character | 525 |
| `KERN_CHROUT`, Return on the bottom row, which scrolls | 1,491 |
| `KERN_GETKEY_NB`, no key waiting | 26 |
| `KERN_RDTIM` | 804 |

An indexed read that crosses a page boundary takes a cycle more, so align
the buffers a loop reads.

## The runtime

Measured with a 40×25 background, a 6,144-byte tileset and a one-frame
animation, its shape made of 1 and then of 4 sprites. A call's count runs
from its `JSR` to the next instruction, so it includes the macro's argument
setup.

| Call | Cycles |
| --- | ---: |
| `TickAnimation`, frame unchanged | 52 |
| `TickAnimation`, new frame | 3,010 + 306 per sprite |
| `MoveAnimation` | 2,590 + 306 per sprite |
| `StartAnimation` | 2,896 + 306 per sprite |
| `StopAnimation` | 336 + 9 per sprite |
| `DrawShape`, shape in MIA RAM | 947 + 306 per sprite |
| `DrawShape`, shape in a CPU bank | 644 + 586 per sprite |
| `HideSprites`, 2 sprites | 313 |
| `SetSpriteCount` | 216 |
| `SetScroll` | 281 |
| `SetViewport` | 238 |
| `SetLayers` | 211 |
| `SetChrBanks` | 301 |
| `GetCell` | 2,112–2,206 |
| `SetCell` | 2,337 |
| `DrawRect`, `DrawRow` or `DrawColumn`, map in MIA RAM | 4,307–4,394 |
| `DrawScreen`, map in MIA RAM | 4,466 |
| `DrawRow`, 40 cells, map in a CPU bank | 6,437 |
| `DrawColumn`, 25 cells, map in a CPU bank | 26,653 |
| `DrawScreen`, map in a CPU bank | 77,663 |
| `Relocate` or `UseTileset`, CPU bank to MIA | about 26 per byte |
| `PlaySound` | 3,841 |
| `TickSound`, 3, 5 or 0 register writes | 1,416, 2,076 or 519 |
| `StopSound` | 36 |
| `PlaySong` | 882 |
| `SongPosition` | 213 |
| `StopSong` | 252 |
| `RuntimeSave` / `RuntimeRestore` | 505 / 639 |
| `WaitTick`, when MIA's count has already moved on | 236 |
| `ReadPad`, players 1-3: the gamepad | 269 |
| `ReadPad`, player 0: the gamepad and the keyboard | 989 |
| `KeyHeld` | 209 |

From MIA RAM, drawing costs the same whatever the size, because MIA's DMA
copies. From a bank the CPU copies every byte.

### A tick of Walker

Walker runs its loop once per 60 Hz tick, not once per frame, so at 1.2 MHz
each pass has 20,000 cycles. A pass where the player walks, the animation
moves on to a new frame and the jump sound plays spends roughly:

| Work | Cycles |
| --- | ---: |
| `WaitTick`, its last look at the clock | 236 |
| `TickAnimation`, new frame, 1 sprite | 3,316 |
| `TickSound` | about 1,400 |
| `ReadPad #0` and `KeyHeld` | 1,198 |
| `MoveAnimation`, 1 sprite | 2,896 |
| The timer interrupt | about 200 |
| **Total** | **about 9,200** |

Under half of the tick, leaving room for enemies, a scrolling edge and game
logic. Most ticks cost far less: the animation frame changes only every few
ticks, and the player isn't always moving.

## BASIC

Cycles per statement, including the interpreter's step to the next one:

| Statement | Cycles |
| --- | ---: |
| `REM` | 320 |
| `A=A+1` | 2,963 |
| `A%=A%+1` | 3,841 |
| `A=A*B` | 3,446 |
| `A=B/C` | 4,653 |
| `IF A<0 THEN A=0`, false | 2,872 |
| `GOSUB` / `RETURN` | 1,379 / 455 |
| `FOR I=1 TO 3` / each `NEXT` | 3,392 / 816–959 |
| `POKE 700,1` | 5,241 |
| `B=PEEK(700)` | 4,918 |
| `PRINT "A";` | 3,051 |
| `X=INT(A/2)` | 6,128 |
| `X=SIN(A)` | 25,947 |

At 1.2 MHz and 25 frames a second, that is about 16 simple statements a
frame, or 400 a second. Three things make BASIC faster:

- **Use floating-point variables, not integers.** `A%` is slower than `A`:
  BASIC converts integers to floating point to do arithmetic.
- **Create the busiest variables first.** BASIC finds a variable by
  searching them in the order they were created.
- **Put the lines jumped to most often near the start.** A `GOTO` or
  `GOSUB` searches from the start of the program, unless the target's line
  number has a higher high byte than the current line's.

## Spending less

- Change only what changed. A sprite that didn't move needs no call.
- Keep everything drawn every frame in MIA RAM.
- Keep the busiest indexes pointing where they write: once an index is set
  up, each byte is one `STA`.
- Use MIA's copies and the card-to-MIA loads for anything large.
- Time gameplay with MIA's clock, never by counting cycles: the clock speed
  isn't fixed.
- Lower the sprite count (`SetSpriteCount`) to what the game uses.
