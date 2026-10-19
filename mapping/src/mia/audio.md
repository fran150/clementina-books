# Audio registers

MIA RAM `$12000-$1204F` (73728-73807)

MIA makes Clementina's sound: four voices, each with a frequency, a
waveform, an envelope, a volume and a stereo position, mixed and played
through two PWM outputs to the audio jack. The voices are set up by writing
their registers in this 80-byte block, and MIA picks up each write on its
next audio tick. A background sequencer can also play a track from MIA RAM on
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
reference tables below; the Programmer's Reference explains them.

## Address entries

These are MIA RAM addresses, reached through index windows rather than CPU
`PEEK` and `POKE`. Decimal addresses come first, then hexadecimal and the
field name. Voice 0's fields are explained individually; voices 1-3 repeat
the same layout at 16-byte intervals.

### 73728　　$12000　　AUDIO_VERSION

The layout version of this audio block, currently 2. A program that reads
or writes voice fields can check it before assuming the offsets below have
their present meanings. MIA supplies it; software should not overwrite it.

### 73729　　$12001　　MASTER_VOLUME

The overall output level for all four voices. Only the low four bits are
used, giving levels 0-15; MIA sets 15 at reset. Changing it scales the
mix without changing any voice's own volume byte.

### 73730　　$12002　　AUDIO_STATUS

Bit 0 says the audio engine is running. Bit 1 says register writes arrived
faster than MIA could process them, so some work overflowed its queue.
This is a report from MIA, not the command to enable audio; use the audio
commands for that.

### 73731　　$12003　　AUDIO_CHANNELS

The number of available voices, currently four. It lets software check
the audio layout before assuming voice records 0-3 exist. MIA owns this
byte; it is not a way to request more channels.

### 73732–73733　　$12004–$12005　　AUDIO_TICK_RATE

A little-endian value of 24,000 ticks per second for sequencer note
durations. A track's duration fields are counted in these ticks, which
are separate from the CPU's VIA interrupt rate. This is a description of
the engine's timing, not a writable tempo control.

### 73734　　$12006　　AUDIO_FLAGS

Bit 0 reports stereo output. With stereo available, each voice's `PAN`
byte can move it toward the left or right channel. The other bits are
reserved; a program should not infer extra features from them.

### 73735–73743　　$12007–$1200F　　Header reserved

These nine bytes complete the 16-byte audio header. They have no current
audio fields. Write zero if a program fills the whole header, and do not
use them as private storage because future firmware may assign them.

### 73744–73745　　$12010–$12011　　VOICE_0_FREQ

The frequency for voice 0, stored little-endian in units of one sixteenth
of a hertz. For a 440 Hz tone, write 7,040 (`$1B80`): `$80` to the low byte
and `$1B` to the high byte. This sets pitch; the `GATE` bit at `$12017`
controls whether the note sounds.

### 73746　　$12012　　VOICE_0_PULSE_WIDTH

The duty cycle of voice 0's pulse waveform, from 0 to 255. A value near
128 gives roughly equal high and low portions of the wave. It matters when
the voice's waveform at `$12015` is set to pulse.

### 73747　　$12013　　VOICE_0_ATTACK_DECAY

Two envelope rates in one byte: the high nibble controls how quickly a
gated note rises, and the low nibble controls its decline toward the
sustain level. This is part of voice 0's ADSR envelope. Changing it affects
the next stages the audio engine processes.

### 73748　　$12014　　VOICE_0_SUSTAIN_RELEASE

The high nibble sets the level held while the note's gate remains on;
the low nibble sets how quickly the sound fades after the gate turns off.
Together with `$12013`, it describes voice 0's attack, decay, sustain and
release behavior.

### 73749　　$12015　　VOICE_0_WAVEFORM

Selects the shape of voice 0's sound: 0 sine, 1 pulse, 2 sawtooth, 3
triangle or 4 noise. A pulse wave also uses the width at `$12012`.
Selecting a waveform does not itself start a note; the control byte's
gate does that.

### 73750　　$12016　　VOICE_0_PAN

The stereo position of voice 0 as a signed byte. A value of -64 puts it
left, 0 centers it, and 63 puts it right. It changes the mix between the
two outputs rather than the voice's pitch or envelope.

### 73751　　$12017　　VOICE_0_CONTROL

Bit 0 is `GATE`: changing it from 0 to 1 starts the attack of a note, and
clearing it starts release. Bit 1 restarts the waveform's phase from its
beginning. The sequencer may also change this byte when it plays a track,
so a program and a track should not independently control the same voice.

### 73752　　$12018　　VOICE_0_VOLUME

The volume of voice 0 before it is combined with the other voices, from
0 to 255; reset gives it 255. The master volume at `$12001` scales the
whole mix separately. Setting this byte to zero silences this voice without
turning off the audio engine.

### 73753–73754　　$12019–$1201A　　VOICE_0_SEQ_NOTE_INDEX

The sequencer's current note index for voice 0, low byte first. It changes
as the track advances and is for reading progress, not controlling where
the track should jump. Use sequencer commands to start, stop or rewind a
track.

### 73755　　$1201B　　VOICE_0_SEQ_STATUS

The sequencer's status for voice 0. MIA updates it while a track runs, so
a program can tell whether the voice is following a sequence. Treat it as
read-only; writing a voice's ordinary registers is separate from changing
the sequencer's control state.

### 73756–73759　　$1201C–$1201F　　Voice 0 reserved

The final four bytes of voice 0's 16-byte record are reserved. They are
not extra waveform data or space for a program's track. Write zero when
initializing a whole voice record.

### 73760–73775　　$12020–$1202F　　VOICE_1

Voice 1 repeats voice 0's layout, with each field 16 bytes higher:
frequency at `$12020-$12021`, waveform at `$12025`, gate and phase control
at `$12027`, and volume at `$12028`. Its own sequencer status occupies
`$12029-$1202B`. Changes here affect voice 1 only, apart from the shared
master volume in the header.

### 73776–73791　　$12030–$1203F　　VOICE_2

Voice 2 has the same 16-byte record, starting at `$12030`: frequency first,
then pulse width, envelope, waveform, pan, control and volume. Its
sequencer state is at offsets `$09-$0B` within the record. Add `$20` to a
voice 0 field address to find the corresponding voice 2 field.

### 73792–73807　　$12040–$1204F　　VOICE_3

Voice 3 is the fourth and last record. Add `$30` to a voice 0 address to
find the same field here: for example, `$12047` is its gate/control byte.
Its sequencer can follow a separate track from the other three voices.

## Compact audio tables and sequencer opcodes

{{#include ../../../tables/mia-audio.md}}
