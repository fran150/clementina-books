# K

## KEYCLEAR

**Statement** · `KEYCLEAR`

Throws away the characters waiting in MIA's text queue, without waiting. It
does not change which keys are held, so `KEYDOWN` is not affected. Use it
before a `GET`, so that an old key does not answer the question.

<!-- example: keys="Y" -->
```basic
10 KEYCLEAR: PRINT "SURE (Y/N)?"
20 GET K$: PRINT K$
```

```text
SURE (Y/N)?
Y
```

See also: [GET](g.md#get), [KEYDOWN](#keydown), [Input](../basic/input.md).

## KEYDOWN

**Function** · `KEYDOWN(code)`

Returns 1 while the key with USB HID usage code *code* is held down, else 0.
The code names the physical key, not its character: `A` is 4 whether Shift is
held or not. Several keys can be held at once. Reading a key does not take
anything from the text queue.

| Argument | Range | Meaning |
| --- | --- | --- |
| *code* | 0-255 | The key's HID usage code. |

Some codes: `A`-`Z` 4-29, Return 40, Space 44, the arrows 79-82 (right, left,
down, up), Left Shift 225. All of them are in
[Appendix E](../appendix/charset-keys.md).

<!-- example: hold=225 -->
```basic
10 IF KEYDOWN(225) THEN PRINT "SHIFT HELD"
```

```text
SHIFT HELD
```

See also: [CONSDOWN](c.md#consdown), [GET](g.md#get), [MOUSE](m.md#mouse),
[Input](../basic/input.md).

## KEYREPEAT

**Statement** · `KEYREPEAT delay,interval | 0`

Sets how MIA repeats a held key's character in the text queue: first after
*delay* milliseconds, then every *interval* milliseconds. `KEYREPEAT 0` turns
repeat off. At power-on the times are 400 and 60.

| Argument | Range | Meaning |
| --- | --- | --- |
| *delay* | 0-65535 | Milliseconds before the first repeat. 0 turns repeat off and takes no *interval*. |
| *interval* | 1-65535 | Milliseconds between repeats. Needed when *delay* is not 0. |

```basic
KEYREPEAT 250,30
KEYREPEAT 0
KEYREPEAT 400,60
```

makes keys repeat sooner and faster, then turns repeat off, then puts back
the usual times. A *delay* other than 0 with no *interval* gives
`?SYNTAX ERROR`. Repeat only fills the text queue: `KEYDOWN` sees a held key
as held either way.

See also: [KEYRPT](#keyrpt), [Input](../basic/input.md).

## KEYRPT

**Statement** · `KEYRPT code,enabled`

Lets one key repeat (1) or stops it repeating (0). By default only the arrows,
Backspace and Delete repeat.

| Argument | Range | Meaning |
| --- | --- | --- |
| *code* | 0-255 | The key's HID usage code. |
| *enabled* | 0-1 | 1 lets the key repeat, 0 does not. Other values give `?ILLEGAL QUANTITY ERROR`. |

```basic
KEYRPT 44,1
```

lets Space repeat. Only keys that type a character can repeat.

See also: [KEYREPEAT](#keyrepeat), [KEYDOWN](#keydown),
[Appendix E](../appendix/charset-keys.md).

## KILL

**Statement** · `KILL path`

Deletes a file, or an empty directory, from the SD card. A file that does not
exist, or a directory that is not empty, gives `?FILE I/O ERROR`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file or directory. |

```basic
10 OPEN "OLD.TXT" FOR OUTPUT AS #1: CLOSE #1
20 MKDIR "TEMP": DIR
30 KILL "OLD.TXT": KILL "TEMP"
40 PRINT "GONE": DIR
```

```text
OLD.TXT
TEMP/
GONE
```

See also: [RMDIR](r.md#rmdir), [NAME](n.md#name), [DIR](d.md#dir),
[Files and the SD card](../basic/files.md).
