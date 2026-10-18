# Expressions and operators

An expression combines values with operators and functions: `A*2+1`,
`LEFT$(N$,3)+"..."`, `X>0 AND Y>0`. BASIC evaluates it from left to right,
doing higher-precedence operators first.

## Precedence

From the highest to the lowest:

| Precedence | Operators | Meaning |
| --- | --- | --- |
| 1 | `( )` | Grouping. |
| 2 | `^` | Power. |
| 3 | `-` (leading) | Negation. |
| 4 | `*` `/` | Multiply, divide. |
| 5 | `+` `-` | Add (or join strings), subtract. |
| 6 | `=` `<>` `<` `>` `<=` `>=` | Comparisons. |
| 7 | `NOT` | Bitwise NOT. |
| 8 | `AND` | Bitwise AND. |
| 9 | `OR` | Bitwise OR. |

Operators on the same level go left to right: `8/4/2` is 1. Negation binds
looser than `^`, so `-2^2` is -4, not 4. `NOT` binds looser than the
comparisons, so `NOT A=B` means `NOT (A=B)`.

Parentheses can nest, but every open parenthesis uses some of the 6502's
stack; very deep nesting gives `?OUT OF MEMORY ERROR`. A string expression
can use at most three temporary strings at once; a deeply nested string
expression gives `?FORMULA TOO COMPLEX ERROR`, and is fixed by splitting it
with a variable.

## Arithmetic

`+`, `-`, `*` and `/` work on numbers as expected. `/` by zero gives
`?DIVISION BY ZERO ERROR`. `^` raises to a power and is computed as
`EXP(Y*LOG(X))`, so its results are close but not always exact: `2^31` is
2147483651 rather than 2147483648, and `2^7=128` is false. A negative base needs a
whole exponent (`(-2)^3` is -8; `(-8)^(1/3)` gives `?ILLEGAL QUANTITY ERROR`).

There is no `MOD` operator. The remainder of A divided by B is
`A-INT(A/B)*B`.

## Comparisons

A comparison gives -1 when it is true and 0 when it is false:

```basic
PRINT 3>2, 3<2, "A"<"B"
```

```text
-1             0            -1
```

Both sides must be numbers or both strings, or BASIC stops with
`?TYPE MISMATCH ERROR`. Strings compare character by character by their
codes, and a shorter string that matches the start of a longer one is
smaller. Comparison ignores the colors and styles strings carry.

`IF` treats any value other than 0 as true, so `IF A THEN ...` runs when `A`
is not zero.

## Logical operators

`AND`, `OR` and `NOT` work on 16-bit signed integers, bit by bit. Their
operands are rounded down to whole numbers first and must lie between -32768
and 32767, or BASIC stops with `?ILLEGAL QUANTITY ERROR`.

Because true is -1 (all bits set) and false is 0, they also work as logical
operators on comparisons:

```basic
10 X=5: Y=-3
20 IF X>0 AND Y<0 THEN PRINT "SOUTH-EAST"
30 IF NOT (X=Y) THEN PRINT "DIFFERENT"
```

And on bits, which is how most Clementina status values are read:

```basic
PRINT 13 AND 4, 8 OR 1, NOT 0
```

```text
 4             9            -1
```

`NOT X` is `-X-1`. To test a bit of a value `V`, AND it with the bit's
value, 1, 2, 4, 8, 16, 32, 64, 128 and so on: `V AND 8` is nonzero when bit 3
is set. Write the constant rather than computing it with `^`, which is not
exact.

## Functions

A function returns a value and can be used anywhere an expression can:
`SQR(X)`, `LEN(A$)`, `MPEEK($14000)`. Its argument always goes in parentheses.
Clementina's own functions read MIA's state: `KEYDOWN`, `PADAXIS`, `TICKS`,
`PLAYING`, `EOF` and others. Several take a dummy argument that must be 0,
because a Microsoft BASIC function needs one: `TICKS(0)`, `INPUTDEV(0)`,
`DISKFREE(0)`.

`DEF FN` defines a function of one numeric argument inside a program:

```basic
10 DEF FNSQ(X)=X*X
20 PRINT FNSQ(7)
```

The function's name follows the same two-character rule as variable names.
Its parameter is a private copy: the variable `X` keeps its own value after
the call.
