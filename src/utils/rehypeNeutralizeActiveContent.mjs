import { visit } from "unist-util-visit";

/**
 * MDX explicit-JSX active-content neutralizer (comp-001 hardening).
 *
 * `mdxPresentation.tsx` maps `script`/`iframe` to no-render components, but
 * that mapping is skipped by `@mdx-js/mdx` for tags **explicitly** authored as
 * JSX in a Post/Brief body (`<script src="..." />`) - the compiler only
 * routes markdown-generated elements (e.g. `# heading` -> `h1`) through
 * `_components`; explicit JSX keeps its literal DOM tag name
 * (`node.data._mdxExplicitJsx`, see `@mdx-js/mdx`'s `recma-jsx-rewrite`).
 * Since `<script>`/`<iframe>` have no non-JSX Markdown syntax, an
 * owner-authored explicit tag would otherwise reach the DOM unneutralized.
 *
 * This rehype plugin (plain `.mjs`, not `.ts` - `@next/mdx`'s loader
 * `require.resolve()`s plugin file paths directly and cannot load an
 * unregistered `.ts` specifier) strips those elements at the hast/mdx-JSX
 * node level, before the JSX-rewrite stage runs, so the tag never survives
 * compilation regardless of how it was authored. It runs alongside, not
 * instead of, the `mdxComponents` mapping (which still neutralizes any
 * markdown-shorthand-driven case and stays as defense in depth).
 *
 * @returns {(tree: import("unist").Node) => void}
 */
export default function rehypeNeutralizeActiveContent() {
  const neutralizedTags = new Set(["script", "iframe"]);

  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== "number") return undefined;

      const isHtmlElement = node.type === "element" && neutralizedTags.has(node.tagName);
      const isMdxJsxElement =
        (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
        neutralizedTags.has(node.name);

      if (isHtmlElement || isMdxJsxElement) {
        parent.children.splice(index, 1);
        return index;
      }

      return undefined;
    });
  };
}
