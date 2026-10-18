# Sound

MIA's sound generator is the one BASIC plays ([Sound](../basic/sound.md)):
four voices, each with a waveform, a pitch, an envelope, a volume and a
stereo position. It is not a sample player. A program writes a few bytes when
a note changes, and MIA does the rest, 24,000 times a second, without the
6502. It can also play a whole tune by itself from a list of notes in its
RAM, the **sequencer** BASIC's `TRACK` and `BAND` use.

## The audio block

The sound settings are 80 bytes of MIA RAM from `$12000`: a 16-byte header,
then a 16-byte record for each voice.

{{#include ../../../tables/mia-audio.md}}

MIA's indexes for them:

| Index | `mia.inc` name | Covers |
| --- | --- | --- |
| `$E6` | `MIA_AUDIO_INDEX_ALL` | The whole block, 80 bytes. |
| `$E7-$EA` | `MIA_AUDIO_INDEX_VOICE0` + *v* | Voice *v*'s record, 16 bytes. |
| `$EB` | `MIA_AUDIO_INDEX_HEADER` | The header, 16 bytes. |
| `$EC-$EF` | `MIA_AUDIO_INDEX_SEQ_VOICE0` + *v* | Voice *v*'s sequencer status, 3 bytes. |

## A voice's record

| Offset | Holds |
| --- | --- |
| 0-1 | The frequency, in sixteenths of a hertz, low byte first. |
| 2 | The pulse width, for the pulse waveform: 128 is a square wave. |
| 3 | Attack rate in the high four bits, decay rate in the low four. |
| 4 | Sustain level in the high four bits, release rate in the low four. |
| 5 | The waveform: 0 sine, 1 pulse, 2 sawtooth, 3 triangle, 4 noise. |
| 6 | The stereo position, signed: -64 (`$C0`) left, 0 center, 63 (`$3F`) right. |
| 7 | Control: bit 0 is the gate, bit 1 restarts the waveform's cycle. |
| 8 | The voice's volume, 0-255, where 255 is full. |
| 9-11 | The sequencer's status for this voice, written by MIA. |
| 12-15 | Unused; write 0. |

The frequency is a 16-bit number of sixteenths of a hertz, so the value for
a pitch is its frequency times 16: 440 Hz, the A above middle C, is 7,040,
`$1B80`. The highest pitch is just under 4,096 Hz. BASIC's `NOTE` works
out these numbers from semitones; [Appendix F](../appendix/notes.md) lists
them for all 96 notes.

The **gate** starts and ends a note. Setting it starts the envelope's attack;
clearing it starts the release. The envelope restarts only when the gate goes
from 0 to 1, so to play the same note twice a program clears the gate and
sets it again.

The voice's volume and the **master volume**, header byte 1, 0-15, are both
full after reset. The voice's volume scales the whole envelope, so it is the
one to use for fading or balancing a voice; the sustain level shapes the note.

## Switching sound on

Sound starts stopped. Command `$60`, `MIA_CMD_AUDIO_ENABLE`, starts it, taking
the voices from the bytes already in the block. `$61`, `MIA_CMD_AUDIO_STOP`,
stops it and keeps the bytes, and `$62`, `MIA_CMD_AUDIO_RESET`, stops it and
puts the block back to its defaults. They are BASIC's `SNDON`, `SNDOFF` and
`SNDCLR`. While sound runs, the status bit `MIA_STAT_AUDIO_ACTIVE`, bit 0 of
`STATUS_H`, is set.

Once sound is on, a byte written to a voice's record takes effect on MIA's
next sound tick, 1/24,000 of a second later.

This routine plays the A above middle C on voice 0, a square wave with a
quick attack, and leaves it sounding:

<!-- example: org=$0280 prg=BEEP.PRG run="BLOAD \"BEEP.PRG\"|SYS 640|PRINT MPEEK($12017);PEEK(65515) AND 1" -->
```asm
.include "clementina.inc"

        lda #MIA_AUDIO_INDEX_VOICE0
        sta CMD_PARAM1
        lda #MIA_CMD_RESET_INDEX
        sta CMD_TRIGGER
        jsr wait
        lda #MIA_AUDIO_INDEX_VOICE0
        sta IDXA_SELECT
        ldx #0
voice:  lda a4,x
        sta IDXA_PORT
        inx
        cpx #9
        bne voice
        stz CMD_PARAM1
        stz CMD_PARAM2
        stz CMD_PARAM3
        lda #MIA_CMD_AUDIO_ENABLE
        sta CMD_TRIGGER
wait:   lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne wait
        rts

a4:     .word $1B80             ; 440 Hz
        .byte 128               ; square
        .byte $08               ; attack 0, decay 8
        .byte $C6               ; sustain 12, release 6
        .byte MIA_AUDIO_WAVE_PULSE
        .byte 0                 ; center
        .byte MIA_AUDIO_CONTROL_GATE | MIA_AUDIO_CONTROL_RESET_PHASE
        .byte 255               ; full volume
```

```text
 3  1
```

The 3 is the control byte, gate and restart, and the 1 the active bit. To end
the note, write the control byte again with the gate clear; `SNDOFF` in BASIC
silences everything.

### Keeping a copy

A music routine usually keeps a copy of each voice's nine bytes in its own
RAM, changes the copy, and writes all nine to MIA, after selecting the voice's
index so the writes start at byte 0. That is nine stores for a note on or a
note off. Selecting the index again before each write is what puts it back at
the start: the voice index wraps after 16 bytes, not 9.

Bytes copied into the block with `MIA_CMD_COPY_INDEXES` reach RAM but not the
running sound. After such a copy, stop sound and start it again, which takes
the voices from RAM.

## The sequencer

A tune played by the 6502 note by note needs a timer and costs time on every
note. The **sequencer** plays it inside MIA instead. Each voice reads its own
**track**: a list of events in MIA RAM, each a byte saying what it is followed
by fixed data.

| Byte | Event | Data | Does |
| --- | --- | --- | --- |
| `$00` | End | | Stops the voice's track. |
| `$01` | Note | frequency (2), duration (3) | Sets the pitch and starts a new note, with a new attack. |
| `$02` | Rest | duration (3) | Releases the note. |
| `$03` | Wave | waveform | Sets the waveform. |
| `$04` | Envelope | attack/decay, sustain/release | Sets the envelope. |
| `$05` | Pan | position | Sets the stereo position. |
| `$06` | Volume | volume | Sets the voice's volume. |
| `$07` | Pulse | width | Sets the pulse width. |
| `$08` | Jump | offset (3) | Goes on reading at the address after this event plus the signed offset. |
| `$09` | Tie | frequency (2), duration (3) | Changes the pitch without a new attack, if the note is still held. |

Every number is little-endian. A **duration** is a 24-bit count of sound
ticks, 24,000 a second, so a quarter of a second is 6,000 ticks, `$001770`.
A note, rest or tie takes exactly its duration, and the next event starts
when it ends. The other events take no time. A tune that repeats ends with a
jump back to its start: an offset of minus the tune's length, counted to the
byte after the jump.

A track can be anywhere in MIA RAM, outside the system's areas. BASIC's
`TRACK` puts voice *v*'s track at `$14000 + v*$1000` unless told otherwise.
These commands drive the sequencer:

| Command | Number | Parameters | Does |
| --- | --- | --- | --- |
| `MIA_CMD_AUDIO_SEQ_SET_BASE0-3` | `$68-$6B` | the address, 3 bytes | Sets where voice 0-3's track starts. |
| `MIA_CMD_AUDIO_SEQ_LOAD` | `$63` | voices | Puts the voices back at the start of their tracks, without playing. |
| `MIA_CMD_AUDIO_SEQ_START` | `$64` | voices | Plays the voices from where they are. |
| `MIA_CMD_AUDIO_SEQ_STOP` | `$65` | voices | Stops the voices where they are and releases their notes. |
| `MIA_CMD_AUDIO_VOICE_TAKE` | `$66` | voices | Lends the voices to the program: the track stops advancing but nothing is silenced. |
| `MIA_CMD_AUDIO_VOICE_RELEASE` | `$67` | voices | Gives them back. Each track goes on where it would be if it had kept playing. |

*Voices* is a mask in parameter 1: bit *v* for voice *v*, `$0F` for all four.
The sequencer plays only while sound is on.

This routine copies a three-note tune to `$20000`, gives it to voice 0 and
starts it. It is too long for `$0280-$02F7`, so it is assembled for `$B000`,
above a lowered top of BASIC's memory
([Mixing BASIC and machine language](../ml/mixing.md)):

<!-- example: org=$B000 prg=TUNE.PRG run="POKE 63,0: POKE 64,176: CLEAR|BLOAD \"TUNE.PRG\"|SYS 45056|PRINT PLAYING(0)" -->
```asm
.include "clementina.inc"
TRACK = $020000

        lda #$00                ; program index $00 at TRACK, step 1
        sta IDXA_SELECT
        ldx #0
setup:  lda fields,x
        sta CFG_SELECT
        lda values,x
        sta CFG_PORT
        inx
        cpx #6
        bne setup
        ldx #0
copy:   lda tune,x
        sta IDXA_PORT
        inx
        cpx #tune_end-tune
        bne copy

        lda #<TRACK
        sta CMD_PARAM1
        lda #>TRACK
        sta CMD_PARAM2
        lda #^TRACK
        sta CMD_PARAM3
        lda #MIA_CMD_AUDIO_SEQ_SET_BASE0
        jsr command
        lda #%0001              ; voice 0
        sta CMD_PARAM1
        lda #MIA_CMD_AUDIO_SEQ_LOAD
        jsr command
        lda #MIA_CMD_AUDIO_ENABLE
        jsr command
        lda #%0001
        sta CMD_PARAM1
        lda #MIA_CMD_AUDIO_SEQ_START
command:
        sta CMD_TRIGGER
@wait:  lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne @wait
        rts

fields: .byte CFG_IDXA_ADDR_L, CFG_IDXA_ADDR_M, CFG_IDXA_ADDR_H
        .byte CFG_IDXA_STP_L, CFG_IDXA_STP_H, CFG_IDXA_FLAGS
values: .byte <TRACK, >TRACK, ^TRACK, 1, 0
        .byte (1 << IDX_FLAG_W_STP_ENA)

QUARTER = 6000                  ; ticks
tune:   .byte $03, MIA_AUDIO_WAVE_TRIANGLE
        .byte $04, $08, $A6     ; envelope
        .byte $01               ; C5, 523.25 Hz
        .word $20B4
        .faraddr QUARTER
        .byte $01               ; E5, 659.26 Hz
        .word $2934
        .faraddr QUARTER
        .byte $01               ; G5, 783.99 Hz
        .word $3100
        .faraddr QUARTER*2
        .byte $02               ; rest
        .faraddr 1
        .byte $00               ; end
tune_end:
```

```text
 1
```

`.faraddr` is ca65's directive for a three-byte value. The command parameters
are written before each command and stay until changed, so `AUDIO_ENABLE`
here receives voice mask 1 as a parameter it ignores.

### Following a track

Each voice's sequencer status is three bytes of its record, 9-11, which MIA
rewrites on every tick:

| Offset | Holds |
| --- | --- |
| 9-10 | How many notes, ties and rests the track has started since it was loaded. |
| 11 | Bit 0: the track is playing. Bit 1: the voice is lent to the program. |

Index `$EC + v` covers exactly these three bytes. Because the index steps on
each read and wraps after three, a program that reads it must read all three
each time, or reset the index before each read; BASIC's `CUE` and `PLAYING`
read it this way. When a track ends, MIA raises `IRQ_AUDIO_SEQ_DONE`, bit 14
of the interrupt status.

The count is what lets a program act on the beat: wait until the count reaches
a note, then change something. A jump does not reset it, so a looping track
keeps counting.

### Sound effects over music

To play a sound effect on a voice that is playing a track, a program borrows
the voice with `MIA_CMD_AUDIO_VOICE_TAKE`, writes the voice's record as in
the routine above, and gives it back with `MIA_CMD_AUDIO_VOICE_RELEASE`. The
track does not wait: it comes back where it would have been had it played on,
starting its next whole note rather than the end of one cut short. These are
BASIC's `VTAKE` and `VGIVE`.

## Where this is in Mapping Clementina

The audio block byte by byte is in *Mapping Clementina*,
[Audio](../../../mapping/src/mia/audio.md).
