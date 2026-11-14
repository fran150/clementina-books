# Your first assembly program

An assembly program is built by ca65 and ld65 into a PRG file, which BASIC's
`BRUN` loads and starts. This chapter starts from the SDK's assembly
template and makes it print a line.

## Make the project

```text
$ clementina new ~/games/hello --template assembly --name "Hello"
Created /home/you/games/hello from the assembly template.
```

The folder holds `clementina.yaml`, `src/main.s`, `link.cfg` and
`checks/code.json`. The project has no BASIC program, so the manifest has
no `program` section, and its `build` section has `assembly` instead of
`basic`:

```yaml
build:
  outputDirectory: build
  assembly:
    sources:
      - src/main.s
    linkerConfig: link.cfg
    outputName: game
    loadAddress: 6144
    entrySymbol: game_start
```

- `sources` lists the assembly files, assembled in order and linked into
  one program.
- `linkerConfig` is ld65's configuration file, which places the program in
  memory.
- `loadAddress` is where the program loads, 6144 (`$1800`). The SDK does not
  choose it: it checks that what ld65 linked really starts there.
- `entrySymbol` is the label where the program starts. The source must
  `.export` it.

## The linker configuration

`link.cfg` puts the program in one block of RAM from `$1800` to `$7FFF`,
and its zero-page variables in `$98-$DF`:

```text
MEMORY {
  ZP: start=$98, size=$48, type=rw;
  RAM: start=$1800, size=$6800, type=rw, file=%O;
}
SEGMENTS {
  ZEROPAGE: load=ZP, type=zp;
  CODE: load=RAM, type=ro;
  RODATA: load=RAM, type=ro;
  DATA: load=RAM, type=rw;
  BSS: load=RAM, type=bss, define=yes;
}
```

These are the segments [the Clementina library](../building/runtime.md)
uses, so the program can call it without changing the file.

`$1800` is where the SDK's templates put programs, and the reason matters.
Clementina has no ROM: at power-on MIA copies the kernel, WozMon and BASIC
into RAM from `$0400` up to about `$63A0`, and BASIC's own workspace starts
there. `BRUN` runs from the kernel, which ends below `$1600`, and may
overwrite anything above it. A program at `$1800` therefore loads over BASIC
itself. That is what a game wants (the whole machine, BASIC's memory
included), but it means the program can never return to BASIC. *Mapping
Clementina* has the details: [The resident
image](../../../mapping/src/cpu/image.md) and [BASIC's
workspace](../../../mapping/src/cpu/basic-workspace.md#where-machine-code-can-go).

## The program

Replace `src/main.s` with this:

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

```text
$ cd ~/games/hello
$ clementina build
Built build/game.prg and build/load-plan.json. SD card: ..
```

The build runs ca65 on every source, links with ld65, checks the result
against `loadAddress`, and writes:

| File | What it is |
| --- | --- |
| `build/game.prg` | The program: a 2-byte load address, then the code. `BRUN` loads it. |
| `build/game.bin` | The same code without the header. |
| `build/game.dbg`, `.lbl`, `.map` | ld65's debug information, labels and memory map. The debugger reads the first. |
| `build/000-main.o`, `.lst` | ca65's object file and listing, one pair per source. |
| `build/include/` | `clementina.inc` and `mia.inc`. |
| `build/lib/` | The Clementina library, which every program with assembly links. |
| `build/bootstrap.bas` | The BASIC line that starts the program, as text. |
| `build/load-plan.json` | The same steps as data. |
| `build/memory-layout.json` | Where each part sits in CPU memory and MIA RAM. |

The bootstrap is one line:

```basic
10 BANK 0:BRUN "build/game.prg"
```

`BANK 0` makes sure a load into `$8000-$BFFF` would go to bank 0. `BRUN`
loads the PRG at the address in its header and jumps to its first byte.

## Run it

As with BASIC, start the emulator with the project folder as its card, and
the video client:

```text
$ clementina-emulator --sd ~/games/hello
$ clementina-video-client
```

Then type the bootstrap line and `RUN`, or just the command without a line
number:

```basic
BANK 0:BRUN "build/game.prg"
```

The program prints `HELLO FROM ASSEMBLY` and keeps the machine. To get BASIC
back, reset: the emulator's Emulation menu (press `E` in its terminal) has
Reset, and a reset makes MIA load the kernel and BASIC into RAM again.

## Check it

`checks/code.json` says which bytes of memory the program should have
written:

```json
{
  "format": "clementina-code-check",
  "version": 1,
  "settleCycles": 500000,
  "memory": [{"address": 512, "bytes": [42]}]
}
```

`clementina check` builds the program, runs it headless for `settleCycles`
cycles, and compares memory:

```text
$ clementina check
Checks passed for /home/you/games/hello.
CPU: PC=$...., cycles=...
Screen:
  ...
Report: /home/you/games/hello/build/inspection/report.json
```

## Where to go next

- To give the program graphics and sound, add assets
  ([Part II](../projects/project-folder.md)) and the asset build
  ([The asset build](../building/asset-build.md)).
- To step through it, use the debugger ([Debugging in VS
  Code](../running/debugging.md)).
