# Audio registers

MIA RAM `$12000-$1204F` (73728-73807)

MIA makes Clementina's sound: four voices, each with a frequency, a
waveform, an envelope, a volume and a stereo position, mixed and played
through two PWM outputs to the audio jack. The voices are set up by writing
their registers in this 80-byte block, and MIA picks up each write
immediately. A background sequencer can also play a track from MIA RAM on
any voice by itself.

| Range | Holds |
| --- | --- |
| `$12000-$1200F` | The header. |
| `$12010-$1201F` | Voice 0. |
| `$12020-$1202F` | Voice 1. |
| `$12030-$1203F` | Voice 2. |
| `$12040-$1204F` | Voice 3. |

The indexes `$E6-$EF` reach the whole block, each voice, the header and each
voice's sequencer status ([Index descriptors](../spaces/indexes.md)).

{{#include ../../../tables/mia-audio.md}}

## The header

| Offset | Field | Contents |
| --- | --- | --- |
| `$00` | `VERSION` | The block's layout version, 2. |
| `$01` | `VOLUME` | Master volume, 0-15 (low nibble). 15 at reset. The one header byte a program writes. |
| `$02` | `STATUS` | Bit 0: audio is running. Bit 1: register writes came faster than MIA could take them. |
| `$03` | `CHANNELS` | The number of voices, 4. |
| `$04-$05` | `TICK_RATE` | 24,000, little-endian: the unit of the sequencer's note lengths. |
| `$06` | `FLAGS` | Bit 0: stereo output. |
| `$07-$0F` | | Reserved; write zero. |

## A voice

Voice `v` starts at `$12010 + v × 16`:

| Offset | Field | Contents |
| --- | --- | --- |
| `$00-$01` | `FREQ` | Frequency in Hz × 16, little-endian. A 440 Hz A is 7040, `$1B80`. |
| `$02` | `PULSE_WIDTH` | Duty cycle of the pulse wave, 0-255; 128 is about half. |
| `$03` | `ATTACK_DECAY` | Attack rate in the high nibble, decay rate in the low. |
| `$04` | `SUSTAIN_RELEASE` | Sustain level in the high nibble, release rate in the low. |
| `$05` | `WAVEFORM` | 0 sine, 1 pulse, 2 sawtooth, 3 triangle, 4 noise. |
| `$06` | `PAN` | Stereo position, signed: -64 left, 0 center, 63 right. |
| `$07` | `CONTROL` | Bit 0 `GATE`: 1 starts the attack, 0 the release. Bit 1: restart the waveform from its beginning. |
| `$08` | `VOLUME` | The voice's own volume, 0-255; 255 at reset. |
| `$09-$0B` | `SEQ_NOTE_INDEX`, `SEQ_STATUS` | The sequencer's progress on this voice. MIA rewrites these continuously; read only. |
| `$0C-$0F` | | Reserved; write zero. |

Setting the gate bit starts a note, clearing it lets the note fade, as on the
C64's SID.

## Sequencer tracks

A track is a list of notes and commands in MIA RAM. Command `$68 + v`
(`AUDIO_SEQ_SET_BASE0-3`) tells voice `v` where its track starts, command
`$63` rewinds and `$64` plays. Tracks can live anywhere in MIA RAM, and
nothing is set aside for them: a voice has no track until a program gives
it one, and reset forgets every voice's track address. The natural home is
the programs' block at `$14000` ([Free MIA RAM](free-ram.md)); BASIC's
`TRACK` puts voice `v`'s track at `$14000 + v × $1000` unless told
otherwise.

A track must not overlap video memory, the input block, this block, the SD
block or another voice's track. The sequencer opcodes are listed in the
table above; the Programmer's Reference explains them.
