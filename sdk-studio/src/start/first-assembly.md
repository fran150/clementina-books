# A program that is all assembly

A program made entirely of assembly takes over the machine. BASIC's `BRUN`
loads it and jumps to it; the program does not return to BASIC. This chapter
starts from `clementina new` again and turns the starter into a program that
prints a line. If you made the project in [the previous
chapter](first-basic.md), use a new folder for this one.

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
    loadAddress: $7000
    entrySymbol: game_start
  video:
    paletteConfigId: palette-config:main
```

With no `program.entry`, the build starts the code at `entrySymbol` instead
of a BASIC program. `link.cfg` stays as it is.

## Where the code goes

`BRUN` uses the kernel to load the program. Keep the program above `$1800`
so the loader remains available while it runs. Once loaded, a program like
this can replace BASIC in memory and cannot return to it.

The starter still places the code at `$7000`. If you need more room, move
`RAM`'s start in `link.cfg` and `loadAddress` in the manifest down to
`$1800` together.
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

`clementina.inc` comes with the SDK. The build writes it and `mia.inc` to
`build/include/`, where ca65 can find them. They name the kernel's routines,
free zero page, VIA and MIA registers. [Programming in assembly with the
SDK](../building/assembly.md) covers them in detail.

## Build

```sh
clementina build
```

```text
Built the SD card in build/sd. Start it with RUN "BOOT.BAS".
```

This card has no `GAME.BAS`. Its loader, shown in `build/boot.cbas`, ends with
`BRUN`:

```basic
10 MIALOAD "asset-palette.bin",$00100
20 BANK 0:BRUN "CODE.PRG"
```

`BANK 0` selects the bank for the load. `BRUN` loads `CODE.PRG` at the
address in its header and jumps to its first byte.

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

The program prints `HELLO FROM ASSEMBLY` and stays in its loop. To return to
BASIC, reset the emulator: press `E` in its terminal to open the Emulation
menu, then choose Reset.

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
