# The BASIC dictionary

This dictionary describes every word Clementina BASIC knows, in alphabetical
order: [A](a.md) · [B](b.md) · [C](c.md) · [D](d.md) · [E](e.md) ·
[F](f.md) · [G](g.md) · [I](i.md) · [K](k.md) · [L](l.md) · [M](m.md) ·
[N](n.md) · [O](o.md) · [P](p.md) · [R](r.md) · [S](s.md) · [T](t.md) ·
[U](u.md) · [V](v.md) · [W](w.md). The symbols and the words `AND`, `OR` and
`NOT` are under [Operators](operators.md). A list of all the words on one page
is in [Appendix A](../appendix/keywords.md).

## How to read an entry

Each entry starts with the word, what kind of word it is, and its form:

- A **statement** does something. It starts a statement, either at the start
  of a line or after a colon.
- A **function** gives a value, and is used inside an expression.
- An **operator** combines values inside an expression.
- A **keyword** only appears inside another statement, such as `TO` in `FOR`.

In the form:

| Written | Means |
| --- | --- |
| `CAPITALS` | Typed as shown. |
| *lowercase* | Replaced by a value; the entry says what kind. |
| `[ ]` | The part inside may be left out. |
| `...` | The part before may be repeated. |
| `\|` | One of the forms on either side. |

Unless an entry says otherwise:

- A number where the form names an argument can be any numeric expression.
  BASIC drops its fraction before checking it, and a value outside the range
  in the entry's table gives `?ILLEGAL QUANTITY ERROR`.
- A *path* is any string expression naming a file or directory on the SD card,
  from the current directory or, if it starts with `/`, from the root. Any SD
  card problem gives `?FILE I/O ERROR`.
- A *line* is a line number written in digits, not an expression. A line that
  does not exist gives `?UNDEF'D STATEMENT ERROR`.
- A string where a number belongs, or the reverse, gives
  `?TYPE MISMATCH ERROR`.

Every example has been run, and its output is what BASIC printed. A program
example is typed in and `RUN`; an example without line numbers is typed
directly.

## Words from Microsoft BASIC

About half the words are the Microsoft BASIC of 1977, the same BASIC the
Commodore 64 has, and behave the same way. The differences that matter are
listed in their entries and collected in [BASIC rules](../basic/rules.md).
The other half are Clementina's own, for MIA's graphics, sound, input, files
and memory.
