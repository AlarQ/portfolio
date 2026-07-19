---
name: write-post
description: Draft a blog Post in the author's own voice - grill the thesis, match the voice fingerprint read live from existing posts, wire the MDX, and scrub AI tells before the file lands in content/posts/.
disable-model-invocation: true
---

# Write Post

Draft a new blog **Post** that reads as if the author wrote it by hand - not as if a model generated it. Two forces drive every step: match the **voice fingerprint** (the measurable signature of the existing posts) and kill the **AI tells** (the phrasings that give machine authorship away).

Do the steps in order. Each ends on a checkable condition - don't advance until it's met.

## Step 0 - Grill the thesis

Before any prose, interview the author until the shape of the post is pinned down. Ask, and don't accept vague answers:

- **The one thesis.** What single claim does this post exist to make? One sentence. If it needs two, the post is two posts.
- **The leading-word metaphor.** The existing posts hang everything on one recruited concept - *containment vessel*, *perimeter*, *seam*, *tracer bullet*. What's this post's? A post without one drifts into a list.
- **The reader and the takeaway.** Who reads this, and what's the one thing they do differently afterward?
- **The section spine.** 3–6 section headers, in order. Rough is fine; a spine is not an outline.

**Done when** you can write the thesis, the metaphor, the takeaway, and the spine back to the author in five lines and they agree. Skipping this to "just draft" is the top failure mode - a wrong thesis costs the whole draft.

## Step 1 - Extract the voice fingerprint

Read **every** file in `content/posts/*.mdx` - the whole corpus, not a sample. Extract the author's signature along these fixed dimensions (the dimensions are stable; the values you read fresh every run, because the corpus grows):

- **Opener move** - how the first paragraph earns attention (e.g. a concrete problem the author personally chased, not an abstract intro).
- **Thesis delivery** - the pivotal claim rendered as a **bold pull-quote** early in the piece.
- **Leading-word discipline** - one metaphor named early, then repeated to carry the argument.
- **Sentence rhythm** - clause length, fragment use, where emphasis lands.
- **Em-dash habit** - the author uses em dashes deliberately and often. Note the real cadence so Step 3 doesn't over-correct.
- **Section headers** - short, plain nouns or backticked command/term names; no cute questions unless the corpus has them.
- **Second person / direct address** - where "you" shows up and where it doesn't.
- **Closer move** - how posts land (a crisp, forward-looking one-liner: "which is the whole point.", "swap the adapter, keep the scaffold.").

**Done when** you have a written fingerprint list you will draft against - concrete enough that a stranger could imitate it.

## Step 2 - Draft in the fingerprint

Write the Post, obeying the fingerprint from Step 1 and the mechanics in [mdx-reference.md](mdx-reference.md) (frontmatter schema, available MDX components, diagram workflow, slug and file rules). Concretely:

- Open with the fingerprint's opener move. State the thesis as a bold pull-quote early.
- Name the leading-word metaphor once, then let it carry the sections.
- Prefer the author's own vocabulary - read `CONTEXT.md` for the domain glossary before naming anything (Post, dek, seam, gate…). Don't invent synonyms the author rejected.
- Reach for `<Callout>` and `<Diagram>` only where the corpus does - as structural payoff, not decoration.

**Done when** a full draft exists with valid frontmatter and body, matching the fingerprint's opener, thesis-delivery, metaphor, and closer moves.

## Step 3 - Scrub AI tells

Read the draft against **every** category in [ai-writing-checklist.md](ai-writing-checklist.md) and rewrite what trips it. This is a line-by-line pass, not a skim.

**Co-located caveat - the em-dash trap.** The checklist flags em-dash *overuse*, but this author genuinely writes with em dashes (Step 1 measured the real rate). Don't strip them wholesale - that breaks the voice worse than it fixes the tell. Cut only the *formulaic* ones: the sales-punch dash that inflates a clause for drama. Keep the ones doing real syntactic work. Same posture for any tell the fingerprint shows the author authentically using: match voice first, kill only the machine cadence.

**Done when** every checklist category has been walked and each offending phrase is either rewritten or consciously kept as genuine voice (per the caveat).

## Step 4 - Land the file

Place and validate per [mdx-reference.md](mdx-reference.md):

- File at `content/posts/<slug>.mdx`; the slug is the filename minus `.mdx` and **must** match `^[a-z0-9-]+$` (the loader silently skips anything else).
- `title`, `dek`, and `date` (ISO `YYYY-MM-DD`) are present - the loader fails the build without them.
- If the post uses `<Diagram>`, author each `content/diagrams/<name>.mmd` and run `npm run prerender:mermaid` so the SVGs exist.
- Run `npm run build` (or at least the dev server) to confirm the Post renders and no frontmatter warning fired.

**Done when** the file is in place, the slug and frontmatter validate, any diagrams are prerendered, and the build renders the Post clean.
