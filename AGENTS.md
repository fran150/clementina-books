# Writing the Clementina books

Rules for anyone, person or agent, who edits these books.

## The reader

- Write for someone who knows how to program and roughly knows Clementina.
  Don't explain what an SDK, a library or an editor is for, and don't argue
  for the tools' design ("the SDK is a set of tools, not an engine", "the
  build never decides…"). Describe what the tools do and how to use them.
- Don't re-explain the machine in the SDK & Studio Guide. Hardware, MIA, the
  video client and Wi-Fi setup belong to the User's Manual, the Programmer's
  Reference and Mapping Clementina; link to them instead.

## The product

- Describe the final, released product. Use release downloads, Homebrew and
  end-user commands (`clementina ...`). Never use source builds, repo paths,
  `node`/`npx` scripts or "not released yet" notes in the main chapters. Dev
  setup lives only in the SDK & Studio Guide's development-install appendix.
- If a step needs something that doesn't exist yet, write the final command
  and raise the missing piece as tool work. Document a real feature limit
  plainly, without promises about future versions.
- There are no project types. A project has a BASIC program, assembly, or
  both. Say "a project with assembly", never "an assembly project".
- Use the names the tools actually ship. Check them against the SDK's
  `docs/` and `specs/` at the pinned commit.

## How design discussions show up

The books are not a record of how a decision was made. When a tool changes
because of a discussion, write only what the reader can now do and how.
Leave out:

- why the old way was replaced, or what it used to be called;
- what the tool doesn't do, unless a reader would otherwise try it;
- roadmap language: "grows with the SDK", "so far", "will", "planned";
- the reasoning or vocabulary from the discussion ("general", "not scoped
  to", "parts instead of kinds").

Before adding a sentence, ask: would a reader who never saw the discussion
need this to use the tool? If not, cut it.

## Mechanics

- Edits go in the local checkout; the owner reviews and commits in batches.
- Reference tables are generated (`node tools/generate-tables.mjs`); never
  edit them by hand.
