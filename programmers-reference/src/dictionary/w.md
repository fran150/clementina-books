# W

## WAIT

**Statement** · `WAIT address,mask[,invert]`

Waits until a byte in memory changes. `WAIT` reads *address* over and over,
turns the bits that are set in *invert* the other way, and ANDs the result
with *mask*. When that is not 0, the program goes on.

| Argument | Range | Meaning |
| --- | --- | --- |
| *address* | 0-65535 | The address, in the 6502's memory. |
| *mask* | 0-255 | The bits to look at. |
| *invert* | 0-255 | Bits to turn the other way first; 0 if left out. With *invert* equal to *mask*, `WAIT` waits for those bits to be 0. |

Ctrl-C does not stop `WAIT`. If the bits never change, the machine has to
be reset.

```basic
10 POKE 700,6
20 WAIT 700,4: PRINT "BIT 2 IS SET"
30 WAIT 700,1,1: PRINT "BIT 0 IS CLEAR"
```

```text
BIT 2 IS SET
BIT 0 IS CLEAR
```

`WAIT` is meant for bytes that something other than the program changes,
such as machine code running from an interrupt. To wait for a length of
time, use `DELAY`.

See also: [PEEK](p.md#peek), [DELAY](d.md#delay), [AND](operators.md#and).

## WAVE

**Statement** · `WAVE voice,waveform`

Chooses the waveform of a voice, which gives it its sound. The change takes
effect at once, also on a note that is sounding.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *waveform* | 0-4 | 0 sine, 1 pulse, 2 sawtooth, 3 triangle, 4 noise. |

Voices start with the pulse wave, whose width `PULSE` sets.

```basic
10 SNDON: ADSR 0,0,8,12,6
20 FOR W=0 TO 4
30 WAVE 0,W: NOTE 0,48: DELAY 400: GATE 0,0: DELAY 200
40 NEXT
```

plays middle C with each waveform in turn.

See also: [PULSE](p.md#pulse), [ADSR](a.md#adsr), [NOTE](n.md#note),
[Sound](../basic/sound.md).
