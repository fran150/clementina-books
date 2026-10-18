# Operators

Operators combine values in an expression. When an expression has several,
BASIC does the ones higher in this table first, and works from left to right
among operators on the same level. Parentheses change the order.
[Expressions and operators](../basic/expressions.md) explains them in more
detail.

| Precedence | Operators | Meaning |
| --- | --- | --- |
| 1 | `^` | Power. |
| 2 | `-` (leading) | Negation. |
| 3 | `*` `/` | Multiply, divide. |
| 4 | `+` `-` | Add (or join strings), subtract. |
| 5 | `=` `<` `>` `<>` `<=` `>=` | Comparisons. |
| 6 | `NOT` | Bitwise NOT. |
| 7 | `AND` | Bitwise AND. |
| 8 | `OR` | Bitwise OR. |

`<>`, `<=` and `>=` are not keywords of their own. They are made of the
`<`, `=` and `>` signs typed together, and `=<`, `=>` and `><` work the same
way.

## ^ (power)

**Operator** · `left ^ right`

Raises *left* to the power *right*. It is worked out as
`EXP(right*LOG(left))`, so the result is close but not always exact: `2^7=128`
is false. `0^0` is 1. A negative *left* needs a whole *right*, or BASIC stops
with `?ILLEGAL QUANTITY ERROR`. A result too large gives `?OVERFLOW ERROR`.

```basic
PRINT 2^10;3^2;(-2)^3;4^0.5
```

```text
 1024  9 -8  2
```

To test a bit, use `AND` with a constant (1, 2, 4, 8 and so on), not a
power of 2 worked out with `^`.

See also: [SQR](s.md#sqr), [EXP](e.md#exp), [LOG](l.md#log).

## - (minus)

**Operator** · `left - right | -right`

Subtracts *right* from *left*. With no *left*, it changes the sign of
*right*. Negation binds tighter than `*` and `/` but looser than `^`, so
`-2^2` is -4.

```basic
PRINT 7-10;-2^2;(-2)^2;2*-3
```

```text
-3 -4  4 -6
```

See also: [+](#-plus), [ABS](a.md#abs), [SGN](s.md#sgn).

## * (times)

**Operator** · `left * right`

Multiplies two numbers. A result larger than about 1.70141183E+38 gives
`?OVERFLOW ERROR`.

```basic
PRINT 6*7;1.5*4
```

```text
 42  6
```

See also: [/](#-divided-by), [^](#-power).

## / (divided by)

**Operator** · `left / right`

Divides *left* by *right*. Dividing by zero gives
`?DIVISION BY ZERO ERROR`. There is no remainder operator; the remainder of
A divided by B is `A-INT(A/B)*B`.

```basic
PRINT 7/2;8/4/2;17-INT(17/5)*5
```

```text
 3.5  1  2
```

See also: [*](#-times), [INT](i.md#int).

## + (plus)

**Operator** · `left + right | +right`

Adds two numbers, or joins two strings into one. A joined string can hold
up to 255 characters; a longer one gives `?STRING TOO LONG ERROR`. Both
sides must be numbers or both strings, or BASIC stops with
`?TYPE MISMATCH ERROR`. A leading `+` with no *left* does nothing.

```basic
PRINT 5+3;"CLEMEN"+"TINA"
```

```text
 8 CLEMENTINA
```

See also: [-](#--minus), [STR$](s.md#str), [Styled strings](../basic/styled-strings.md).

## = (equal)

**Operator** · `left = right`

Gives -1 if *left* and *right* are equal and 0 if not. Both must be numbers
or both strings. Strings are equal when they hold the same characters;
their colors and styles do not count. The same sign assigns a value in `LET`,
`FOR` and `DEF`.

```basic
PRINT 3=3;3=4;"A"="A"
```

```text
-1  0 -1
```

See also: [<](#-less-than), [>](#-greater-than), [IF](i.md#if),
[Expressions](../basic/expressions.md).

## < (less than)

**Operator** · `left < right`

Gives -1 if *left* is smaller than *right* and 0 if not. Strings compare
character by character by their codes, and a string that matches the start of
a longer one is smaller. Typed together with `=` or `>` it makes `<=` (less
or equal) and `<>` (not equal).

```basic
PRINT 2<3;"ABC"<"ABD";"AB"<"ABC";1<>2;3<=2
```

```text
-1 -1 -1 -1  0
```

See also: [>](#-greater-than), [=](#-equal), [ASC](a.md#asc).

## > (greater than)

**Operator** · `left > right`

Gives -1 if *left* is larger than *right* and 0 if not. Strings compare by
character codes, as with `<`. Typed together with `=` it makes `>=` (greater
or equal).

```basic
PRINT 3>2;"B">"A";2>=2;1>=2
```

```text
-1 -1 -1  0
```

A comparison of a number with a string gives `?TYPE MISMATCH ERROR`.

See also: [<](#-less-than), [=](#-equal), [IF](i.md#if).

## NOT

**Operator** · `NOT value`

Turns every bit of *value*, as a 16-bit integer, the other way, giving
`-value-1`. So `NOT 0` is -1 (true) and `NOT -1` is 0 (false). *value* is
rounded down to a whole number first.

| Argument | Range | Meaning |
| --- | --- | --- |
| *value* | -32768 to 32767 | Outside this range gives `?ILLEGAL QUANTITY ERROR`. |

`NOT` binds looser than the comparisons, so `NOT A=B` means `NOT (A=B)`.

```basic
PRINT NOT 0;NOT -1;NOT 5;NOT 3=4
```

```text
-1  0 -6 -1
```

See also: [AND](#and), [OR](#or), [IF](i.md#if).

## AND

**Operator** · `left AND right`

Gives the bitwise AND of two 16-bit integers: a bit is set in the result
only when it is set in both. On comparison results, -1 and 0, it works as a
logical AND. Both sides are rounded down to whole numbers first.

| Argument | Range | Meaning |
| --- | --- | --- |
| *left* | -32768 to 32767 | Outside this range gives `?ILLEGAL QUANTITY ERROR`. |
| *right* | -32768 to 32767 | The same. |

```basic
10 X=5: Y=-3
20 IF X>0 AND Y<0 THEN PRINT "SOUTH-EAST"
30 PRINT 12 AND 10;13 AND 4
```

```text
SOUTH-EAST
 8  4
```

`V AND 8` is not zero when bit 3 of *V* is set. This is how most Clementina
status values are tested.

See also: [OR](#or), [NOT](#not), [Expressions](../basic/expressions.md).

## OR

**Operator** · `left OR right`

Gives the bitwise OR of two 16-bit integers: a bit is set in the result when
it is set in either. On comparison results it works as a logical OR. It binds
looser than `AND`, so `A OR B AND C` means `A OR (B AND C)`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *left* | -32768 to 32767 | Outside this range gives `?ILLEGAL QUANTITY ERROR`. |
| *right* | -32768 to 32767 | The same. |

```basic
PRINT 12 OR 3;8 OR 1;1 OR 0 AND 0
```

```text
 15  9  1
```

See also: [AND](#and), [NOT](#not), [STYLE](s.md#style).
