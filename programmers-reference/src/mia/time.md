# Time

The 6502's own sense of time is its clock, and that is not fixed: MIA can run
it anywhere from 1 Hz to 8 MHz, and how fast the board will really go is not
known yet. A loop or a VIA timer counts cycles, so it lasts longer or shorter
with the speed. For time in seconds, MIA keeps two clocks of its own, driven
by its hardware timer: the ones BASIC reads as `TICKS(0)` and `TI`
([Time](../basic/time.md)).

| Clock | Counts | Size | Goes back to 0 |
| --- | --- | --- | --- |
| Milliseconds | Milliseconds since MIA started. | 32 bits | After about 49.7 days. |
| `TI` | Sixtieths of a second. | 24 bits | At 5,184,000, one day. |

Neither stops while the 6502 is paused or the input source changes; both start
from 0 when MIA restarts. `TI` can be set; the millisecond clock cannot.

## Reading the clocks

MIA does not let the 6502 read a clock while it counts, which could give a
low byte from before a carry and a high byte from after it. Instead, command
`$55`, `MIA_CMD_CLOCK_SNAPSHOT`, copies both clocks at one instant into an
8-byte **snapshot** at `$11078`, at the end of the input area, where they stay
until the next snapshot:

| Offset | Holds |
| --- | --- |
| 0-3 | The milliseconds, low byte first. |
| 4-6 | `TI`, low byte first. |
| 7 | The snapshot's version: 1. |

The kernel does the work: `KERN_RDTIM` (`$0430`) takes a snapshot and copies
it to `$02F8-$02FF` in the 6502's RAM, named `CLOCK_MS`, `CLOCK_60HZ` and
`CLOCK_VERSION` in `clementina.inc`. It returns with carry set when the
version is 1. `KERN_SETTIM` (`$0433`) sets `TI` from A (low), X and Y (high);
underneath, it is command `$56`, `MIA_CMD_CLOCK_SET_TI`, with the three bytes
in `CMD_PARAM1-3`. MIA ignores a value of 5,184,000 or more.

## Waiting

A wait of a given length reads the millisecond clock until enough has passed.
This routine waits 500 milliseconds whatever the CPU's speed. It compares only
the low 16 bits, which is enough for waits up to 65 seconds, and subtracts
the start from each reading, so it works even when the clock goes back to 0
in between:

<!-- example: org=$0280 prg=WAIT.PRG run="BLOAD \"WAIT.PRG\"|A=TICKS(0): SYS 640: B=TICKS(0)|PRINT B-A>=500;B-A<600" -->
```asm
.include "clementina.inc"
START = $98                     ; 2 bytes
DELAY = 500

        jsr KERN_RDTIM
        lda CLOCK_MS
        sta START
        lda CLOCK_MS+1
        sta START+1
wait:   jsr KERN_RDTIM
        sec
        lda CLOCK_MS
        sbc START
        tax                     ; elapsed, low byte
        lda CLOCK_MS+1
        sbc START+1             ; elapsed, high byte
        cmp #>DELAY
        bcc wait                ; high byte below: not yet
        bne done                ; high byte above: done
        cpx #<DELAY
        bcc wait
done:   rts
```

```text
-1 -1
```

Both comparisons are true: at least 500 milliseconds passed, and not much
more. BASIC's `DELAY` is the same loop.

## Time and interrupts

The kernel's interrupt comes from the VIA's Timer 1, so its rate follows the
CPU's clock, and so does `KJIFFY`, the count of those interrupts
([Interrupts](../ml/interrupts.md)). Use them for "every so often", and MIA's
clocks for "after so long".

A snapshot is a command, so taking one inside an interrupt handler needs the
context stack around it ([The MIA programming model](model.md)), and
`KERN_RDTIM` must not be called from a handler at all: it uses the kernel's
own command routine, which expects to run in the foreground. A handler that
needs the time can read the copy at `CLOCK_MS` left by the last foreground
call, or count its own interrupts.

## Where this is in Mapping Clementina

The snapshot is in *Mapping Clementina*,
[Input](../../../mapping/src/mia/input.md), with the rest of the input area,
and its copy in [Page 2](../../../mapping/src/cpu/page-2.md).
