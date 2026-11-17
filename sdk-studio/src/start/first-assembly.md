# A program that is all assembly

A program without BASIC is assembly code that takes over the machine: BASIC's
`BRUN` loads it and jumps to it, and it never returns. This chapter starts
from `clementina new` again, as [the previous chapter](first-basic.md) did,
and turns the project into one that prints a line.

## Make the project

Start a new project and remove the BASIC part:

```sh
clementina new ~/games/hello --name "Hello"
```

```text
Created /home/you/games/hello.
```

```sh
cd ~/games/hello
rm src/main.cbas src/hello.s checks/smoke.json
```

In `clementina.yaml`, remove `program` and `build.basic`, and point
`build.assembly` at a new source with a new entry symbol:

```yaml
build:
  outputDirectory: build
  assembly:
    sources:
      - src/main.s
    linkerConfig: link.cfg
    outputName: code
    loadAddress: 28672 # $7000
    entrySymbol: game_start
  video:
    paletteConfigId: palette-config:main
```

With no `program.entry`, the build starts the code at `entrySymbol` instead
of a BASIC program. `link.cfg` stays as it is.

## Where the code goes

`BRUN` runs from the kernel, which ends below `$1600`, and the program may
use anything above it. Clementina has no ROM: at power-on MIA copies the
kernel, WozMon and BASIC into RAM from `$0400` up to about `$63A0`, and
BASIC's own workspace follows. A program that takes over can load over all
of that, so it can never return to BASIC. To give it more room, lower
`RAM`'s start in `link.cfg` and `loadAddress` together, down to `$1800`.
*Mapping Clementina* has the details: [The resident
image](../../../mapping/src/cpu/image.md) and [BASIC's
workspace](../../../mapping/src/cpu/basic-workspace.md#where-machine-code-can-go).

## The program

Write `src/main.s`:

```asm
; Hello: print a line through the kernel, then keep the machine.
.setcpu "65C02"
.include "clementina.inc"
.export game_start

.segment "CODE"
game_start:
        ldx #0
print:  lda message,x
        beq done
        jsr KERN_CHROUT         ; the kernel stays below $1600
        inx
        bra print
done:   lda #42
        sta $0200               ; what checks/code.json looks for
loop:   jmp loop                ; BASIC is gone: never return to it

message:
        .byte "HELLO FROM ASSEMBLY", 13, 0
```

`clementina.inc` comes with the SDK. Every assembly build writes it, with
`mia.inc`, to `build/include/` and adds that folder to ca65's include path.
It names the kernel's jump table (`KERN_CHROUT` and the rest), the free zero
page, the VIA, and every MIA register, command and memory layout
([Programming in assembly with the SDK](../building/assembly.md)).

## Build

```sh
clementina build
```

```text
Built the SD card in build/sd. Start it with RUN "BOOT.BAS".
```

The output is the same as the previous chapter's, without `GAME.BAS`. The
bootstrap, `build/boot.cbas`, now ends with `BRUN`:

```basic
10 MIALOAD "asset-palette.bin",256
20 BANK 0:BRUN "CODE.PRG"
```

`BANK 0` makes sure a load into `$8000-$BFFF` would go to bank 0. `BRUN`
loads the PRG at the address in its header and jumps to its first byte.

## Run it

As before, start the emulator with `build/sd` as its card, and the video
client:

```sh
clementina-emulator --sd ~/games/hello/build/sd
clementina-video-client
```

Then start it:

```basic
RUN "BOOT.BAS"
```

The program prints `HELLO FROM ASSEMBLY` and keeps the machine. To get BASIC
back, reset: the emulator's Emulation menu (press `E` in its terminal) has
Reset, and a reset makes MIA load the kernel and BASIC into RAM again.

## Check it

Write `checks/code.json` with the byte the program writes:

```json
{
  "format": "clementina-code-check",
  "version": 1,
  "settleCycles": 3000000,
  "memory": [{"address": 512, "bytes": [42]}]
}
```

`clementina check` builds the program, runs it headless for `settleCycles`
cycles, and compares memory:

```sh
clementina check
```

```text
Checks passed for /home/you/games/hello.
CPU: PC=$7012, cycles=7002307
Screen:
             CLEMENTINA V1.0 BASIC V2
               2026 PACHISOFT
               1977 MICROSOFT BASIC
  READY.
  RUN "BOOT.BAS"
  HELLO FROM ASSEMBLY
Report: /home/you/games/hello/build/inspection/report.json
```

## Where to go next

- To give the program graphics and sound, add assets
  ([Part II](../projects/project-folder.md)) and the asset build
  ([The asset build](../building/asset-build.md)).
- To step through it, use the debugger ([Debugging in VS
  Code](../running/debugging.md)).
