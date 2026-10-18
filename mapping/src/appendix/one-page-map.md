# The whole map on one page

## The CPU's 64 KiB

```text
$0000-$00FF  Zero page
               $00-$97  BASIC                 $E8-$EF  WozMon
               $98-$DF  free for programs     $F0-$FB  kernel
               $E0-$E7  system spare          $FC-$FF  kernel spare
$0100-$01FF  Stack (BASIC stages typed lines at $01FC-$01FF)
$0200-$027F  Line input buffer (BASIC, WozMon)
$0280-$02F7  Free for programs (120 bytes)
$02F8-$02FF  Clock snapshot
$0300-$03FF  Kernel, editor and BASIC variables
$0400-$044D  Kernel jump table (fixed)
$044E-...    DIR_NAME_BUF, kernel, WozMon: all below $1600
...-$BFFF    BASIC, then BASIC's workspace: program, variables,
             arrays, free memory, strings
$8000-$BFFF  Extended RAM window: bank 0 while BASIC runs,
             banks 1-31 free (VIA PA0-PA4 select)
$C000-$C00F  VIA (repeats through $C3FF)
$C400-$DFFF  Expansion slots 1-7, 1 KiB each
$E000-$FFDF  MIA mirrors: never used
$FFE0-$FFF5  MIA registers
$FFF6-$FFF9  Reserved
$FFFA-$FFFF  NMI, RESET, IRQ vectors (MIA registers)
```

## MIA's 256 KiB

```text
$00000-$0001F  Video: local control (not sent to the client)
$00020-$0003F  Video: render control
$00100-$001FF  Video: 16 palettes x 8 colors
$00200-$0C1FF  Video: 8 CHR banks x 256 tiles
$0C200-$0E13F  Video: 8 background nametables
$0E140-$1007F  Video: 8 background attribute tables
$10080-$1084F  Video: overlay (the text screen) and its attributes
$10850-$10D4F  Video: 256 sprites
$11000-$1107F  Input state and clock snapshot
$12000-$1204F  Audio: header and 4 voices
$13000-$13BFF  SD and file system buffers
$14000-$3FFFF  Free for programs (176 KiB)
               (gaps below $14000 are the firmware's)
```

## MIA's numbered spaces

```text
Index ids     $00-$4F programs   $50-$6F input   $70-$DF video
              $E0-$E5 SD   $E6-$EF audio   $F0-$FF kernel
CFG fields    $00-$0B window A   $10-$1B window B   $20-$22 clock speed
Commands      $0x indexes  $1x copies  $30 pause  $4x video  $5x input
              $6x audio  $7x-$8x SD and files
Errors        high nibble: $0 queue  $1 copies  $2 commands  $3 Wi-Fi
              $4 video  $5 input  $6 audio  $7-$8 SD and files
```
