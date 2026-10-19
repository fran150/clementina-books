# Zero page

`$0000-$00FF` (0-255)

Zero page is the 65C02's fast page. Instructions reach it with one address
byte instead of two, and `(zp),Y` and `(zp,X)` use pointers stored here.
Clementina divides its 256 bytes by owner:

```text
$00 ┌──────────────────────────┐
    │ BASIC                    │ 152 bytes
$98 ├──────────────────────────┤
    │ Programs                 │  72 bytes
$E0 ├──────────────────────────┤
    │ System: spare, WozMon,   │  32 bytes
    │ kernel                   │
$FF └──────────────────────────┘
```

Machine code called from BASIC with `SYS` or `USR` may keep data in
`$98-$DF`; BASIC, WozMon and the kernel leave those bytes alone. A program
that replaces BASIC may use `$00-$97` too. Both kinds of program leave
`$E0-$FF` to the system. If code borrows another byte, it restores it before
returning to BASIC.

The entries below give the decimal address first, then hexadecimal, then the
label or region name. A multi-byte entry covers the full inclusive range. The
pointers here store their low byte first unless an entry says otherwise.

## BASIC: `$00-$97`

BASIC's first 152 bytes hold its pointers, parser state, floating-point work
areas and a short routine copied here at startup. Its layout comes from
Microsoft BASIC for the 6502, adapted for Clementina. These bytes change
while BASIC runs; machine code called from BASIC should normally only read
them or use the documented entry points.

### 0–2　　$00–$02　　GORESTART

These three bytes form a `JMP` instruction to BASIC's warm restart. BASIC
installs the destination at cold start. A warm restart returns to the prompt
without erasing the program already in memory; this entry is part of BASIC's
own control flow, not scratch space for a program.

### 3–5　　$03–$05　　GOSTROUT

These bytes form a `JMP` to BASIC's string-output routine. Machine code can
pass the address of a string in `A` and `Y` and call this entry to print it.
The jump destination is installed when BASIC starts, so code should use the
entry rather than a movable address inside BASIC's image.

### 6–7　　$06–$07　　GOAYINT

This two-byte vector holds the address of `AYINT`, BASIC's routine for
converting the number in its floating-point accumulator into a 16-bit
integer. It is useful to a machine-language routine called by `USR`, because
`USR` passes its numeric argument in floating-point form. The address is
stored low byte first; the bytes are a pointer, not a `JMP` instruction.

### 8–9　　$08–$09　　GOGIVEAYF

This vector points to `GIVAYF`, which converts a 16-bit integer held in `A`
and `Y` back into BASIC's floating-point accumulator. A `USR` routine can use
it to return an integer result to BASIC. Like `GOAYINT`, this is a two-byte
address stored low byte first, not executable code at the vector itself.

### 10–12　　$0A–$0C　　USR

`USR(x)` reaches machine code through this three-byte `JMP` instruction.
`$0A` holds the opcode and `$0B-$0C` hold the destination address, low byte
first. Cold start points it at the `ILLEGAL QUANTITY` error; to use `USR`,
first load a routine, then put its address in `$0B-$0C`. Pointing it at empty
RAM would make the CPU execute whatever bytes happen to be there.

The argument `x` arrives in BASIC's floating-point accumulator (`FAC`), and
the routine returns its result there. The conversion vectors at `$06-$09`
help a routine that works with 16-bit integers instead of floating point.

### 13　　$0D　　Z15

This byte was a `NULL` count in the Microsoft BASIC ancestor. Clementina's
build has no `NULL` command, and its BASIC does not read or write the byte.
It still lies in BASIC's reserved zero-page block; use `$98-$DF` for program
storage instead of relying on this historical gap.

### 14　　$0E　　POSX

The column where BASIC believes its next printed character will go. `TAB`,
`SPC`, `POS` and comma-separated `PRINT` items use this value to position
output. It is BASIC's bookkeeping, so changing it does not by itself move
the kernel's screen cursor.

### 15　　$0F　　Z17

The inherited line-width byte is set to 40 at cold start, matching the
screen's 40 columns. The code that would insert a carriage return at this
width is omitted from Clementina's BASIC build, so this byte currently has
no effect on output. It remains in BASIC's block rather than becoming a
documented program work byte.

### 16　　$10　　Z18

Microsoft BASIC used this value, initialized to 14, when placing comma
separated `PRINT` items in columns. Clementina omits the corresponding
line-width code, so the byte is not used by that path. It is kept with
BASIC's other output state and should not be treated as free zero page.

### 17–18　　$11–$12　　LINNUM, TXPSV

The last 16-bit number BASIC parsed for a line number or memory address.
`GOTO` can leave a line number here; `PEEK`, `POKE` or `SYS` can leave an
address. Read the low byte at `$11` and the high byte at `$12`. The value
changes as statements are parsed, so it is a snapshot of recent work rather
than a permanent program setting.

### 19　　$13　　CHARAC

One of the characters BASIC's text scanner watches for while it reads a
line. It helps decide where a quoted string or a `DATA` item ends. Its
contents depend on the scan in progress; a program should not expect it to
retain a useful value after the statement finishes.

### 20　　$14　　ENDCHR

The scanner's second stopping character, used alongside `CHARAC` at `$13`.
Together they let BASIC scan text that can end in more than one way, such as
a quoted string or a `DATA` item. This is parser scratch, not a character
typed by the user.

### 21　　$15　　EOLPNTR

While BASIC converts a typed line into program tokens, this byte indexes
the line-input buffer. The array-building code reuses it to count
subscripts, the numbers inside an array reference such as `A(2,3)`. Its
meaning therefore depends on which BASIC routine is running.

### 22　　$16　　DIMFLG

Set while `DIM` allocates storage for an array. BASIC uses the flag to
distinguish creating an array from simply finding an existing array
element. Outside that operation the byte is internal state and has no
stable value a program should depend on.

### 23–24　　$17–$18　　VALTYP

These two bytes tell BASIC what kind of value its expression evaluator just
produced. `$17` is `$FF` for a string and `$00` for a number. When the value
is numeric, `$18` is `$80` for an integer and zero for floating point.
Machine code that calls `BAS_FRMEVL` can inspect them before interpreting
the result; the next expression will replace them.

### 25　　$19　　DATAFLG

After `DATA`, BASIC must preserve the following text as data rather than
replace words in it with keyword tokens. This flag tells the tokenizer to
do that. `LIST` also reuses the byte to keep track of quoted text while
reconstructing a line for display, so it does not always mean "inside DATA."

### 26　　$1A　　SUBFLG

BASIC sets this flag when the current context restricts what a variable
reference may contain. For example, a function parameter or `FOR` variable
cannot be parsed exactly like an unrestricted array reference. The parser
checks the flag and raises an error for disallowed forms; it is not a
program-wide option.

### 27　　$1B　　INPUTFLG

Identifies the statement currently obtaining a value: `INPUT` from a typed
line, `GET` from one character, or `READ` from a `DATA` statement. BASIC's
shared conversion code uses it to decide how to handle missing or malformed
text. The byte changes during statement execution.

### 28　　$1C　　CPRMASK

BASIC represents a comparison such as `<`, `=` or `>` with bit masks, then
tests the comparison result against the mask here. The trigonometric
routines for `SIN` and `TAN` reuse the same byte as sign scratch. Its value
is meaningful only while one of those routines is running.

### 29　　$1D　　Z14

This flag records whether `CTRL-O` has suppressed BASIC output. It sits
immediately before the temporary-string pointer at `$1E`. It is part of
BASIC's output state; changing it directly can make subsequent output
appear or disappear unexpectedly.

### 30　　$1E　　TEMPPT

Points to the next unused three-byte slot in `TEMPST` at `$21-$29`.
Temporary string results need descriptors while BASIC evaluates an
expression; this pointer advances as it takes slots and is reset when they
are released. It is a zero-page address, not the address of the string's
characters.

### 31–32　　$1F–$20　　LASTPT

Points to the temporary string descriptor most recently taken from
`TEMPST`. A descriptor records a string's length and the address of its
characters. BASIC uses this pointer while it manages temporary results of
string expressions; the actual characters live elsewhere in memory.

### 33–41　　$21–$29　　TEMPST

Nine bytes holding three temporary string descriptors, each three bytes
long. A descriptor gives the length and address of a string created while
an expression is evaluated, such as the result of concatenation. BASIC
reuses the slots as expression evaluation proceeds; they are not three
persistent user strings.

### 42–43　　$2A–$2B　　INDEX

A two-byte working address shared by several BASIC routines. It can point
into string data, a variable table or a block being moved, depending on the
operation. Because its purpose changes from one routine to another, code
called from BASIC should save and restore it if it needs to borrow it.

### 44–45　　$2C–$2D　　DEST

Another two-byte working address, often the destination when BASIC copies
bytes from one place to another. `INDEX` at `$2A-$2B` may hold the source
of the same operation. Neither pointer is a permanent boundary of BASIC's
memory area.

### 46–50　　$2E–$32　　RESULT

Five scratch bytes used while BASIC multiplies or divides floating-point
numbers. They hold intermediate pieces of a calculation, not a complete
number that a program can reliably read afterward. Any new arithmetic
expression may overwrite them.

### 51–52　　$33–$34　　TXTTAB

This pointer marks where the stored BASIC program begins. At cold start it
is set to the first byte after the resident kernel and BASIC image; every
program line is stored at or above that address. As lines are added, the
program grows upward and the variables above it are moved. The pointer is
a memory address, not a line number. [BASIC's workspace](basic-workspace.md)
shows the complete layout.

### 53–54　　$35–$36　　VARTAB

This points to the first simple variable, immediately after the last byte
of stored program text. Each simple variable has a seven-byte record for
its name and value. Adding or deleting a program line moves this boundary,
because the variables must remain just above the program. `RUN` and `CLEAR`
discard the old variables and reset the boundary to the new end of the
program.

### 55–56　　$37–$38　　ARYTAB

This points to the first array record. Simple variables occupy the space
between `VARTAB` at `$35-$36` and this address; arrays occupy the space
above it. When BASIC creates another simple variable, it can move the
arrays upward to make room, so the address is not fixed for the life of a
program.

### 57–58　　$39–$3A　　STREND

This points to the first byte *after* BASIC's arrays. It is the lower edge
of the unused part of BASIC memory: program text, simple variables and
arrays lie below it. Newly allocated string characters are placed at the
top of BASIC memory and grow downward, so the free space lies between this
address and the lowest string. `FRETOP` at `$3B-$3C` identifies that other
edge. If the two edges meet, BASIC collects unused strings and then reports
`OUT OF MEMORY` if there is still no room.

To read this 16-bit address from BASIC, combine its bytes as
`PEEK(57)+256*PEEK(58)`. This tells you where the current free area starts;
it does not tell you its size without the string boundary.

### 59–60　　$3B–$3C　　FRETOP

This points to the lowest address occupied by dynamically allocated string
characters. BASIC starts storing strings near the top of its memory and
allocates each new one immediately below the existing strings, so this
address moves downward as strings are created. `STREND` at `$39-$3A` marks
the top of arrays below the free area. The distance between the two
pointers is the room BASIC has left for more variables and strings.

When BASIC collects unused strings, it packs the strings still in use
toward the top of memory and may move this pointer upward again. The top
limit itself is `MEMSIZ` at `$3F-$40`.

### 61–62　　$3D–$3E　　FRESPC

BASIC uses this two-byte pointer while it creates or moves a string. It
records the most recently allocated string area, so string-handling code
can find it again during the current operation. It changes frequently and
is not a reliable pointer to the last string assigned by a completed BASIC
statement.

### 63–64　　$3F–$40　　MEMSIZ

This pointer sets the upper limit of memory BASIC may use. At cold start it
contains `$C000`, one byte beyond `$BFFF`; BASIC's strings grow downward
from just below that limit. You can lower the limit to reserve a safe area
above it for your own data or machine code. For example,
`POKE 63,0:POKE 64,176:CLEAR` sets the limit to `$B000`, reserving
`$B000-$BFFF` in extended RAM bank 0. `CLEAR` discards existing variables
and strings so none of their addresses still point into the reserved area.
Cold start restores the original limit.

### 65–66　　$41–$42　　CURLIN

The number of the BASIC line currently being executed, low byte first.
When a statement is entered directly at the prompt rather than from a
stored program, the high byte is `$FF` to mark direct mode. Error messages
and control flow can use this value to identify the current line.

### 67–68　　$43–$44　　OLDLIN

When a program stops, BASIC saves its line number here so `CONT` knows
which line to resume. It is paired with `OLDTEXT` at `$45-$46`, which saves
the position within that line. Editing the program after a stop can make
the saved position invalid, so `CONT` may no longer be possible.

### 69–70　　$45–$46　　OLDTEXT

This is the memory address of the statement where execution stopped, not
its line number. `CONT` uses it with the saved line number in `OLDLIN` to
resume at the right place. Program edits move stored text, so a saved
address must not be treated as permanent.

### 71–72　　$47–$48　　Z8C

This records the line number of the `DATA` statement currently supplying
items to `READ`. If a `READ` fails, BASIC can report the line containing
the data as well as the statement requesting it. The pointer to the actual
next data item is separate, at `$49-$4A`.

### 73–74　　$49–$4A　　DATPTR

This pointer tells `READ` where to look for its next item in the stored
program. Reading an item advances it; `RESTORE` resets it so the data can
be read again from the beginning. It is an address within program text,
not a line number or a copy of the item's value.

### 75–76　　$4B–$4C　　INPTR

These statements share code for converting incoming text into BASIC values.
This pointer identifies the current source: a typed input line, a single
character, or text following a `DATA` statement. Its value is meaningful
only while one of those statements is being processed.

### 77–78　　$4D–$4E　　VARNAM

BASIC puts the name of the variable it is searching for in these two bytes.
Names are stored using the first two characters, with high bits marking
the variable type (numeric, integer or string). The search routine compares
this encoded name with records in the variable area. A new variable lookup
replaces it.

### 79–80　　$4F–$50　　VARPNT

Once BASIC finds a variable, this pointer identifies its value field in
the variable record. The two name bytes come before that field. A numeric
value, integer value or string descriptor has a different format, so this
address alone does not tell you how to interpret the bytes there; the
variable's type matters too.

### 81–82　　$51–$52　　FORPNT

This is a temporary pointer to the variable BASIC is about to change. A
`FOR` loop uses it while setting up its loop variable, and assignment and
input statements reuse it for their own destination. It is not a permanent
pointer to the most recently assigned variable.

### 83–84　　$53–$54　　LASTOP

While BASIC evaluates an expression such as `A+2*B`, it uses an operator
table to decide which operation to perform next. This two-byte work area
holds an offset into that table for the pending operator. It has no useful
meaning after expression evaluation moves on.

### 85　　$55　　CPRTYP

BASIC gathers the characters of a comparison operator here: `<`, `=`, `>`,
or a combination such as `<=`. The expression evaluator uses the resulting
code to test two values. This is parser state, so a program should not
change it between reading and evaluating a comparison.

### 86–87　　$56–$57　　TEMP3, FNCNAM

During a user-defined `FN` call, this pointer helps BASIC find the function
definition in program text. Other BASIC routines reuse the same bytes as
general scratch. Its alias `TEMP3` reflects that shared use; it is not a
stable address of a particular `FN` across statements.

### 88–90　　$58–$5A　　DSCPTR

A string descriptor is a three-byte record containing the string's length
and the address of its characters. String routines use these bytes while
they inspect or move the current descriptor. The pointer is temporary:
another string operation may replace it before the BASIC statement ends.

### 91–92　　$5B–$5C　　DSCLEN, JMPADRS

The string garbage collector walks descriptors by a step stored here,
normally three bytes for a string descriptor. BASIC also overlays the
second byte with the start of `JMPADRS`, a scratch jump target. Because the
bytes serve two purposes at different times, neither value is safe to
retain in a program.

### 93　　$5D　　Z52

During string garbage collection, this byte copies the descriptor step so
the scan can move to the next descriptor. It is also the low byte of the
temporary `JMPADRS` target. Its interpretation depends on the current BASIC
routine, and arithmetic or string work may overwrite it.

### 94　　$5E　　ARGEXTENSION

Floating-point calculations can use this byte as an extra low-order part
of BASIC's second accumulator, `ARG`. The same location is the high byte
of the temporary `JMPADRS` target. It is internal calculation scratch, not
an extra digit permanently attached to a BASIC variable.

### 95　　$5F　　TEMP1

One byte of scratch for BASIC's floating-point routines. A calculation may
use it for an intermediate value that has no direct BASIC equivalent. Do
not treat it as part of a stored variable or as free space between calls.

### 96–97　　$60–$61　　HIGHDS

This two-byte pointer helps BASIC copy a block of memory. It marks the end
of the destination area while the move runs, allowing the copy to proceed
without overwriting bytes it still needs. It is a temporary work pointer,
not a limit on the whole BASIC program area.

### 98–99　　$62–$63　　HIGHTR

This pointer marks the end of the source area for a BASIC block move. It
works with `HIGHDS` at `$60-$61`, which marks the destination end. BASIC
reuses both pointers for moves such as shifting program text or variables,
so their values change whenever memory is reorganized.

### 100　　$64　　TEMP2

Another one-byte work area for BASIC's floating-point calculations. It can
hold an intermediate piece while numbers are normalized or combined.
Reading it after a statement finishes does not give a stable result of
that statement.

### 101　　$65　　INDX, TMPEXP

The floating-point code uses this byte either as an index into a calculation
or as a temporary exponent. The two names reflect those uses of the same
storage. Its contents depend on the current arithmetic routine and may be
replaced by the next numeric expression.

### 102　　$66　　EXPON

When BASIC reads a number written with an exponent, such as `1.2E3`, it
keeps the exponent being parsed here before converting the complete text
into its internal floating-point format. This is input parsing state, not
the exponent byte of a stored floating-point variable.

### 103　　$67　　LOWTR, LOWTRX

The line-search and block-move routines use this byte as the low part of a
temporary address. During number parsing, the same byte has the alias
`LOWTRX`. Its neighbor at `$68` is also shared with exponent-sign work, so
the pair must be interpreted in the context of the routine using it.

### 104　　$68　　EXPSGN

This byte records whether the exponent in text such as `1.2E-3` is negative.
BASIC's parser uses it before the number has been converted to the internal
floating-point representation. Other routines reuse the byte as the high
part of a temporary address, so it is not a persistent sign flag.

### 105–109　　$69–$6D　　FAC

This five-byte work area is BASIC's main floating-point accumulator: one
exponent byte followed by four mantissa bytes. The sign is held separately
in `FACSIGN` at `$6E`. Arithmetic and numeric expression evaluation put
their current result here, so it changes frequently. `USR(x)` receives
`x` here and must leave its return value here for BASIC to use.

### 110　　$6E　　FACSIGN

The sign belonging to the floating-point number in `FAC` at `$69-$6D`.
It is stored separately from that number's exponent and mantissa. A
machine-language routine returning a floating-point result through `USR`
must keep this sign consistent with the value it leaves in `FAC`.

### 111　　$6F　　SERLEN

Some BASIC math functions approximate a result by evaluating a series of
terms. This byte counts how many terms remain in that calculation. It is
internal math state; its value does not tell a program how many terms any
future call will use.

### 112　　$70　　SHIFTSIGNEXT

The floating-point routines use this byte while shifting a mantissa and
carrying its sign through the shift. Cold start clears it. It is a work
byte, not the sign of the current BASIC numeric variable.

### 113–117　　$71–$75　　ARG

`ARG` is BASIC's second floating-point work area. Like `FAC`, it contains an
exponent followed by four mantissa bytes, with its sign in a separate byte
at `$76`. An operation involving two numbers can keep one in `FAC` and the
other here. The next arithmetic operation may overwrite both.

### 118　　$76　　ARGSIGN

The sign of the floating-point number in `ARG` at `$71-$75`. BASIC keeps it
outside the five exponent-and-mantissa bytes, just as it does for `FAC`.
Code inspecting `ARG` must read this byte too to recover the complete
number.

### 119–120　　$77–$78　　STRNG1, SGNCPR, FACEXTENSION

These two bytes are a temporary string pointer during string operations.
The arithmetic code overlays them with other work: the first compares the
signs of `FAC` and `ARG`, and the second holds an extra rounding byte for
`FAC`. The aliases describe different moments in BASIC's execution, not
three values that coexist.

### 121–122　　$79–$7A　　STRNG2

A second temporary pointer used when BASIC works with two string locations,
for example while moving or comparing text. It does not identify a
particular string variable after the operation ends. The next string
expression may replace it.

### 123–146　　$7B–$92　　CHRGET, CHRGOT, TXTPTR, CHRGOT2

This range contains 24 bytes of executable code copied into zero page at
cold start. BASIC uses it to walk through the characters of a stored program
line. `TXTPTR` at `$82-$83` holds the address of the character being read;
`CHRGET` at `$7B` advances to the next non-space character, while `CHRGOT`
at `$81` checks the current one again. The rest of the range belongs to
the routine, even where a byte happens to look unused as data.

Machine code called by `SYS` can parse arguments following its address
through the fixed `BAS_` entries in the [kernel jump table](jump-table.md#calling-basic-from-machine-code).
Those entries are safer than jumping into a movable part of BASIC's image.

### 147–151　　$93–$97　　RNDSEED

`RND` updates this five-byte seed as it produces pseudo-random numbers.
The bytes use the same exponent-and-mantissa layout as `FAC`, so changing
the seed changes later `RND` results. Cold start copies only the first four
bytes, a quirk of this BASIC build; code should not assume all five bytes
were freshly initialized.

## Programs: `$98-$DF`

These 72 bytes belong to programs. BASIC, WozMon and the kernel do not read or
write them, including during cold start. A routine called by `SYS` or `USR`
can keep state here between calls. The SDK names the ends
`ZP_FREE_START` and `ZP_FREE_END`.

### 152–223　　$98–$DF　　Program work area

This is the zero-page area reserved for user programs. It is especially
useful for machine-language pointers, because the 65C02's indirect
addressing modes require their pointer bytes in zero page. Code called by
`SYS` or `USR` can keep persistent state here without saving and restoring
it around BASIC calls. Programs that share the machine must coordinate
their own use of these 72 bytes.

## System: `$E0-$FF`

The final 32 bytes belong to the machine. WozMon uses eight while it runs;
the kernel's interrupt handler and loader use the bytes at `$F0-$FB`.
The remaining bytes are reserved for future system growth.

### 224–231　　$E0–$E7　　System spare

No current kernel or BASIC routine uses these eight bytes. They remain
reserved so future system code can grow without taking back the documented
program area at `$98-$DF`. Code that needs scratch zero page should use
that program area rather than depending on this gap.

### 232　　$E8　　XAML

WozMon remembers the low byte of the address it most recently opened for
examination. Together with `XAMH` at `$E9`, it lets the monitor continue a
memory display from the previous address. BASIC does not use this byte;
entering WozMon with `MON` may change it.

### 233　　$E9　　XAMH

The high byte paired with `XAML` at `$E8`. The two bytes form the 16-bit
address WozMon is examining. They are WozMon's working state, so a program
should not expect them to survive a monitor session.

### 234　　$EA　　STL

WozMon stores the low byte of its current memory-write address here. Its
high byte is `STH` at `$EB`; together they tell the monitor where the next
entered value will be stored. This is separate from the address last opened
for examination at `$E8-$E9`.

### 235　　$EB　　STH

The high byte paired with `STL` at `$EA`. WozMon uses the pair while it
accepts bytes to store in memory. A store command can advance the address,
so these bytes may change as the command proceeds.

### 236　　$EC　　L

WozMon reads addresses and data as hexadecimal text. While it converts a
typed value into a number, it accumulates the low byte here and the high
byte in `H` at `$ED`. The result is temporary parsing state, not a saved
value from the last completed command.

### 237　　$ED　　H

The high byte of the hexadecimal number WozMon is currently parsing, paired
with `L` at `$EC`. A two-byte value can represent a full 6502 address from
`$0000` to `$FFFF`. The next typed number replaces both parser bytes.

### 238　　$EE　　YSAV

WozMon saves its position in the typed command line here before looking for
another hexadecimal value. Comparing that saved position with the parser's
new position tells it whether the user supplied a value at all. The byte
has meaning only while WozMon processes a line.

### 239　　$EF　　MODE

This byte tells WozMon how to interpret the values on the current command
line: `$00` for examining memory, `$7F` for storing bytes, and `$AE` for
examining a block. The modes explain why the same hexadecimal input can
either display or change memory. BASIC leaves the byte alone outside the
monitor.

### 240–241　　$F0–$F1　　KPTR

This is the kernel's general 16-bit pointer, with the low byte first.
`KERN_PRSTR` reads a zero-terminated string from the address stored here
and prints it; `KERN_LOAD` uses the same pointer for a destination override.
Because different kernel calls assign it different meanings, a program
must check the call's description before relying on its contents afterward.
`KERN_CHROUT` leaves it alone.

### 242–243　　$F2–$F3　　KTMP

The console uses these two bytes while calculating an overlay screen
address. `KERN_LOAD` reuses them as the address where a newly loaded program
should begin running; zero means its first loaded byte. Since the kernel
uses the pair for more than one purpose, it belongs to the system even when
the screen is idle.

### 244–245　　$F4–$F5　　KCNT

The kernel counts bytes or cells here while filling part of the text screen.
The counter is 16 bits, with its low byte at `$F4`. A fill operation changes
it as it progresses, so it cannot be used as persistent program storage.

### 246　　$F6　　KCHR

`KERN_CHROUT` saves the character it is printing in this byte while it
decides whether the character is visible text or a control code. Other
console work may reuse the saved value. It is kernel scratch, not a
reliable record of the last character printed to the screen.

### 247–248　　$F7–$F8　　KJIFFY

The kernel increments this 16-bit count on each VIA Timer 1 interrupt:
once per 6,250 PHI2 cycles, or 192 times per second at the default 1.2 MHz.
The count wraps after 65,536 ticks and pauses while interrupts are disabled.
Changing the CPU clock or Timer 1 rate changes its relation to real time;
`TI` and `TICKS` use MIA's independent clock instead.

Programs may read this count but should not write it. An interrupt can
change the low byte between two `PEEK`s, so a safe reader takes high, low,
then high again and retries if the high byte changed.

### 249　　$F9　　KLOAD_BANK

`KERN_LOAD` uses this byte to remember which 16 KiB extended-RAM bank is
receiving file data through the CPU window at `$8000-$BFFF`. A long load
may continue into the next bank when it reaches the end of the window.
The byte is loader state and changes during the transfer.

### 250　　$FA　　KLOAD_CHUNKLEN

The loader reads a file in chunks rather than copying the entire file at
once. This byte holds the number of bytes in its current chunk, allowing
the copy loop to know when to request more. It is meaningful only while
`KERN_LOAD` is active.

### 251　　$FB　　KLOAD_SCRATCH

`KERN_LOAD` uses this byte while handling a file header and the edge of a
memory bank. Its meaning changes during the load, depending on which step
is underway. Programs should treat it as kernel-owned scratch.

### 252–255　　$FC–$FF　　Kernel spare

These four bytes are not used by the current kernel, but they are reserved
for its next variables. The kernel's zero-page allocation grows into them
before it uses the larger spare area at `$E0-$E7`. A program should keep
its own state in `$98-$DF` instead.
