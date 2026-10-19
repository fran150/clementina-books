# Joysticks, mice and keys for games

`INPUT` and `GET` read typed characters: fine for questions, but a game
needs to know which keys are **held down** right now, where the mouse
moved, and what the gamepads are doing. Clementina BASIC reads all three
directly. They come from the video client, so they work on the board and in
the emulator alike.

## Keys held down

`KEYDOWN(code)` is 1 while a key is held and 0 when it isn't. It doesn't
use up typed characters, it sees several keys at once, and it doesn't wait.
The codes are the standard USB keyboard codes, the same whatever your
keyboard's layout:

| Key | Code | Key | Code |
| --- | --- | --- | --- |
| `A` to `Z` | 4 to 29 | Right | 79 |
| `1` to `9` | 30 to 38 | Left | 80 |
| `0` | 39 | Down | 81 |
| RETURN | 40 | Up | 82 |
| ESC | 41 | Left Ctrl | 224 |
| Backspace | 42 | Left Shift | 225 |
| Tab | 43 | Right Ctrl | 228 |
| SPACE | 44 | Right Shift | 229 |

`GET`, by contrast, waits until a key is typed, so it suits menus better
than action.

## Gamepads

Up to four gamepads, numbered 0 to 3, can be plugged into the computer
running the video client. A program first takes a snapshot of a gamepad
with `PADREAD n`, then asks about it:

| Function | Returns |
| --- | --- |
| `PADON(n)` | 1 if gamepad `n` is connected. |
| `PADDIR(n)` | The D-pad: add up 1 for up, 2 for down, 4 for left, 8 for right. |
| `PADBTN(n,b)` | 1 if button `b` is pressed (table below). |
| `PADAXIS(n,a)` | A stick, from -128 to 127: axis 0 is the left stick's X, 1 its Y, 2 and 3 the right stick's. Negative is left or up. |
| `PADTRIG(n,t)` | A trigger, from 0 to 255: 0 is the left one, 1 the right. |

| Button | Number | Button | Number |
| --- | --- | --- | --- |
| A (Cross) | 0 | L1 | 6 |
| B (Circle) | 1 | R1 | 7 |
| X (Square) | 3 | L2 | 8 |
| Y (Triangle) | 4 | R2 | 9 |
| Select (Back) | 10 | L3 (left stick press) | 13 |
| Start (Menu) | 11 | R3 (right stick press) | 14 |
| Home | 12 | | |

To test whether one direction is held, use `AND`: `IF PADDIR(0) AND 4`
is true while left is held, whatever else is.

## Moving a sprite

This program moves the ball from chapter 6 with the cursor keys or the
first gamepad's D-pad. ESC or the gamepad's Start button ends it.

```basic
NEW
10 CLS:CHRREAD 2,8,8
20 DATA 60,126,255,255,255,255,126,60
30 SPRBANK 2:SPRON:X=156:Y=96:SPRITE 0,1,X,Y,4,0
40 IF KEYDOWN(80) THEN X=X-2
50 IF KEYDOWN(79) THEN X=X+2
60 IF KEYDOWN(82) THEN Y=Y-2
70 IF KEYDOWN(81) THEN Y=Y+2
80 PADREAD 0:D=PADDIR(0)
90 IF D AND 4 THEN X=X-2
100 IF D AND 8 THEN X=X+2
110 IF D AND 1 THEN Y=Y-2
120 IF D AND 2 THEN Y=Y+2
130 IF X<0 THEN X=0
140 IF X>312 THEN X=312
150 IF Y<0 THEN Y=0
160 IF Y>192 THEN Y=192
170 SPRX 0,X:SPRY 0,Y
180 IF KEYDOWN(41) OR PADBTN(0,11) THEN SPROFF:END
190 GOTO 40
```

Lines 130 to 160 keep the ball on the screen. Hold two keys, such as Up and
Right, and it moves diagonally.

## The mouse

`MOUSE DX,DY,B,W,P` reads how far the mouse moved since the last time,
into the variables you name:

- `DX` and `DY`: the movement, right and down being positive;
- `B`: the buttons, adding 1 for left, 2 for right, 4 for middle;
- `W` and `P`: the scroll wheel and sideways scroll.

The first `MOUSE` in a program always reads no movement. Remember that the
video client only sends the mouse while it is captured (`Ctrl+M`, `F5`,
`F1`; see [The video client](setup/video-client.md)).

This turns the ball into a pointer, and the left button paints it red:

```basic
NEW
10 CLS:CHRREAD 2,8,8
20 DATA 60,126,255,255,255,255,126,60
30 SPRBANK 2:SPRON:X=156:Y=96:SPRITE 0,1,X,Y,4,0
40 MOUSE DX,DY,B,W,P
50 X=X+DX:Y=Y+DY
60 IF X<0 THEN X=0
70 IF X>312 THEN X=312
80 IF Y<0 THEN Y=0
90 IF Y>192 THEN Y=192
100 SPRX 0,X:SPRY 0,Y
110 IF B AND 1 THEN SPRCOLOR 0,1
120 IF B AND 2 THEN SPRCOLOR 0,4
130 GOTO 40
```

The right button turns it green again. Press `Ctrl+C` to stop.

## Typed keys in a game

Some games want typed characters too, such as a name for the high score
table. `INPUT` and `GET` read them as usual. Two more statements help:

- `KEYCLEAR` throws away characters typed but not yet read, so a key
  pressed during the action doesn't land in the next `INPUT`.
- `KEYREPEAT delay,rate` sets how long a key must be held before it
  repeats, and then how often, both in milliseconds (400 and 60 at
  power-on). `KEYREPEAT 0` turns repeating off.

The *Programmer's Reference Guide* covers the rest of input, including the
other input modes.
