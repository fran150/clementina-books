# Power on: the READY prompt

When Clementina starts, the screen turns blue and shows:

<img src="images/boot.png" width="640" alt="The start-up screen: a sky blue and white flag beside the title and copyright lines, then READY." style="image-rendering: pixelated">

```text
 ███████◤  CLEMENTINA V1.0 BASIC V2
 ██████◤   © 2026 PACHISOFT
 █████◤    © 1977 MICROSOFT BASIC

READY.
```

- The **flag**, sky blue and white, is Clementina's logo. It comes from
  Argentina, where the first computer, in 1961, was also called Clementina.
- The **banner** names the computer and its BASIC. Clementina BASIC grew
  from the Microsoft BASIC that the Commodore 64 also used, which is why
  Microsoft has a copyright line.
- **READY.** means BASIC is waiting for you.

Below `READY.` is the **cursor**, a blinking square where the next
character you type appears. It blinks about every 0.4 seconds. The blink
follows the processor's clock, so if a program speeds the processor up, the
cursor blinks faster too.

To see how much memory is left for your BASIC program and its variables,
type `PRINT FRE(0)`. Pictures and music are kept in MIA's own memory and
don't use it.

The screen holds 40 columns and 25 rows of text, in white on a blue
background. Chapter 4 shows how to type in other colors.

## Two ways to use BASIC

Type this and press RETURN:

```basic
PRINT 2+3
```

BASIC answers at once:

```text
 5

READY.
```

That is **direct mode**: a line without a number runs as soon as you press
RETURN, like a calculator.

Now type a line that starts with a number:

```basic
10 PRINT "HELLO"
```

Nothing happens, and that's right. A line that starts with a number is a
**program line**: BASIC keeps it in memory for later. Type `RUN` to run the
program, and `LIST` to see it. Chapter 5 teaches programs properly.

You may type in lowercase: BASIC reads `print` the same as `PRINT`, and
`LIST` shows its keywords in capitals.

## Stopping and starting over

There are three ways to stop, from gentlest to strongest:

| | What it does | What you keep |
| --- | --- | --- |
| `Ctrl+C` | Stops a running BASIC program and prints `BREAK IN` and the line number. `CONT` carries on from there. | Everything |
| `NEW` | Erases the program in memory, ready for a new one. | Nothing in BASIC; your files on the SD card |
| RESET | Starts Clementina again from scratch, as when you switched it on. On the board it is the RESET button; in the emulator, the debugger's emulation menu (`E`). | Your files on the SD card. The program in memory is lost. |

Use RESET when the machine doesn't answer `Ctrl+C`, for example when a
machine-code program has taken over. Save your program first if you can
(chapter 9).
