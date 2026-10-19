# Input

Clementina has no keyboard connector of its own. Keys, the mouse and gamepads
reach MIA from the **video client** on the host computer, over Wi-Fi, and MIA
keeps two kinds of information about them:

- a **text queue** of typed characters, which `GET` and `INPUT` read, and
- the **held state** of every key, the mouse and up to four gamepads, which
  the functions in this chapter read.

The text queue is for typing. The held state is for games: it says what is
pressed right now, and reading it does not take anything from the queue.

## Why games do not use GET

[Text and the screen](text.md) showed `GET` and `INPUT`. Two things make them
unsuitable for moving a character around a screen:

- `GET` waits until a key is typed, so the program stops.
- While a program runs, BASIC checks for Ctrl-C after every statement by
  taking a character from the text queue, and throws away any other character
  it finds there. Characters typed while the program is busy are lost.

`KEYDOWN` has neither problem.

## Held keys

`KEYDOWN(code)` returns 1 while the key is held down, else 0. *code* is the
key's **USB HID usage code**, the number a USB keyboard uses for the physical
key, not its character. The common ones:

| Key | Code | Key | Code |
| --- | ---: | --- | ---: |
| `A`-`Z` | 4-29 | Right arrow | 79 |
| `1`-`9`, `0` | 30-39 | Left arrow | 80 |
| Return | 40 | Down arrow | 81 |
| Esc | 41 | Up arrow | 82 |
| Backspace | 42 | Left Ctrl | 224 |
| Tab | 43 | Left Shift | 225 |
| Space | 44 | Left Alt | 226 |

The full list is in [Appendix E](../appendix/charset-keys.md). Several keys can
be held at once, and each one reads 1. This program moves a sprite with the
arrow keys; Space puts it back in the middle:

```basic
10 SPRITE 0,42,156,96,0,0: SPRON: SPRCOUNT 0
20 X=156: Y=96
30 IF KEYDOWN(80) THEN X=X-2
40 IF KEYDOWN(79) THEN X=X+2
50 IF KEYDOWN(82) THEN Y=Y-2
60 IF KEYDOWN(81) THEN Y=Y+2
70 IF KEYDOWN(44) THEN X=156: Y=96
80 SPRX 0,X: SPRY 0,Y: GOTO 30
```

It uses tile 42, the `*` of the character set, so it needs no graphics. Press
Ctrl-C to stop it.

`CONSDOWN(code)` does the same for the **consumer** keys some keyboards have:
volume, play and pause, and so on. They have their own list of HID codes.

`KEYCLEAR` empties the text queue without waiting, which is useful before a
`GET` so that an old key does not answer the question.

## Key repeat

When a key is held, MIA repeats its character in the text queue: after 400
milliseconds, then every 60. `KEYREPEAT delay,interval` changes the two times
and `KEYREPEAT 0` turns repeat off. By default only the arrows, Backspace and
Delete repeat; `KEYRPT code,1` lets another key repeat and `KEYRPT code,0`
stops one. Repeat only fills the text queue; `KEYDOWN` sees a held key as
held either way.

## The mouse

`MOUSE dx,dy,b,w,p` reads the mouse into five numeric variables:

| Variable | Gets |
| --- | --- |
| *dx*, *dy* | The movement since the last `MOUSE`, -128 to 127. Right and down are positive. |
| *b* | The buttons: left 1, right 2, middle 4, back 8, forward 16, added. |
| *w*, *p* | The wheel and the sideways pan since the last `MOUSE`. |

The mouse reports movement, not a position, so the program keeps its own:

```basic
10 SPRITE 0,43,160,100,0,0: SPRON: SPRCOUNT 0
20 X=160: Y=100: MOUSE DX,DY,B,W,P
30 MOUSE DX,DY,B,W,P
40 X=X+DX: Y=Y+DY
50 IF X<0 THEN X=0
60 IF X>312 THEN X=312
70 IF Y<0 THEN Y=0
80 IF Y>192 THEN Y=192
90 SPRX 0,X: SPRY 0,Y
100 IF B AND 1 THEN PRINT "CLICK AT";X;Y
110 GOTO 30
```

The first `MOUSE`, in line 20, sets the starting point and always reads no
movement. Read the mouse often: a movement of more than 127 between two reads
cannot be told apart from a smaller one.

## Gamepads

Up to four gamepads, numbered 0-3, can be connected to the video client.
`PADREAD n` takes a snapshot of gamepad *n*, and the `PAD` functions read
that snapshot, so all the values one loop uses come from the same moment:

| Function | Returns |
| --- | --- |
| `PADON(n)` | 1 if the gamepad was connected. |
| `PADDIR(n)` | The D-pad: up 1, down 2, left 4, right 8, added. |
| `PADSTICK(n)` | The sticks as directions: left stick in bits 0-3, right stick in bits 4-7, in the same order as `PADDIR`. |
| `PADBTN(n,b)` | 1 if button *b* was pressed. |
| `PADAXIS(n,a)` | Stick axis *a*, -128 to 127: 0 left X, 1 left Y, 2 right X, 3 right Y. Negative is left or up. |
| `PADTRIG(n,t)` | Trigger *t*, 0 to 255: 0 left, 1 right. |

The buttons are numbered:

| Number | Button | Number | Button |
| ---: | --- | ---: | --- |
| 0 | A / Cross | 8 | L2 |
| 1 | B / Circle | 9 | R2 |
| 2 | C / right paddle | 10 | Select / Back |
| 3 | X / Square | 11 | Start / Menu |
| 4 | Y / Triangle | 12 | Home |
| 5 | Z / left paddle | 13 | L3 (left stick press) |
| 6 | L1 | 14 | R3 (right stick press) |
| 7 | R1 | 15 | Not used. |

```basic
10 PADREAD 0
20 IF PADON(0)=0 THEN PRINT "CONNECT A GAMEPAD": GOTO 10
30 D=PADDIR(0)
40 IF D AND 1 THEN PRINT "UP"
50 IF D AND 2 THEN PRINT "DOWN"
60 IF PADBTN(0,0) THEN PRINT "A"
70 GOTO 10
```

`INPUTDEV(0)` says what is connected right now, as a sum: keyboard 1,
consumer keys 2, mouse 4, and gamepads 0-3 as 8, 16, 32 and 64.

## The input source

`INPUTMODE n` chooses where input comes from: 0 the **console** (MIA's USB
serial line, which carries text only), 1 the video client over **Wi-Fi**, or
2 a USB keyboard, which no current MIA firmware offers. A source MIA does not
report as available gives `?ILLEGAL QUANTITY ERROR`.

How all this looks in MIA's memory is in Part III, [Input](../mia/input.md),
and in *Mapping Clementina*, [Input](../../../mapping/src/mia/input.md).
