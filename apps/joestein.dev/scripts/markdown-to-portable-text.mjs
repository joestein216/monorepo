import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { marked } from "marked";

// Import utility only. Published Sanity content is the runtime source of truth.
export function markdownToPortableText(markdown) {
  let ordinal = 0;
  const key = (text) => createHash("sha256").update(`${ordinal++}:${text}`).digest("hex").slice(0, 16);
  function block(tokens, extra = {}) {
    const markDefs = [];
    function spans(items, marks = []) {
      return items.flatMap((token) => {
        if (token.type === "strong" || token.type === "em") return spans(token.tokens, [...marks, token.type]);
        if (token.type === "link") {
          const id = key(token.href);
          markDefs.push({ _key: id, _type: "link", href: token.href });
          return spans(token.tokens, [...marks, id]);
        }
        if (token.type === "br") return [{ _key: key("break"), _type: "span", text: "\n", marks }];
        if (token.tokens) return spans(token.tokens, marks);
        return [{ _key: key(token.raw), _type: "span", text: token.text ?? token.raw,
          marks: token.type === "codespan" ? [...marks, "code"] : marks }];
      });
    }
    return { _key: key("block"), _type: "block", style: "normal", ...extra, children: spans(tokens), markDefs };
  }
  function convert(tokens, extra = {}) {
    return tokens.flatMap((token) => {
      switch (token.type) {
        case "space": case "hr": return [];
        case "heading": return token.depth === 1 ? [] : [block(token.tokens, { style: `h${Math.min(4, token.depth)}` })];
        case "paragraph": case "text": return [block(token.tokens ?? marked.lexer(token.text, { gfm: true })[0]?.tokens ?? [], extra)];
        case "blockquote": return convert(token.tokens, { ...extra, style: "blockquote" });
        case "list": return token.items.flatMap((item) => convert(item.tokens, { listItem: token.ordered ? "number" : "bullet", level: (extra.level ?? 0) + 1 }));
        case "code": return [{ _key: key(token.text), _type: token.lang === "mermaid" ? "mermaidDiagram" : "codeBlock",
          ...(token.lang === "mermaid" ? { caption: token.text.startsWith("stateDiagram") ? "Independent conversation state and request status" : "Published content, grounded generation, and server-hydrated receipts" } : { language: token.lang ?? "text" }), code: token.text }];
        case "table":
          // No tables occur in the supplied article. Preserve future imported
          // table values as labeled list rows rather than dropping custom data.
          return token.rows.map((row) => block(marked.Lexer.lexInline(row.map((cell, i) => `**${token.header[i].text}:** ${cell.text}`).join("; ")), { listItem: "bullet", level: 1 }));
        default: throw new Error(`Unsupported Markdown block: ${token.type}`);
      }
    });
  }
  const tokens = marked.lexer(markdown, { gfm: true });
  // The document owns the h1 and subtitle; avoid repeating them in the body.
  const intro = tokens.findIndex(token => token.type === "paragraph");
  if (intro >= 0 && tokens[intro].tokens?.every(token => token.type === "em")) tokens.splice(intro, 1);
  return convert(tokens);
}

export function buildColophonDocument(markdown) {
  return {
    _id: "page-colophon", title: "How joestein.dev Was Built", slug: { _type: "slug", current: "colophon" },
    eyebrow: "Colophon · Grounded AI & Agentic CMS Architecture",
    subtitle: "How a prompt-first, grounded AI engineering portfolio was architected, modeled, tested, and styled—and the delivery workflow behind it.",
    body: markdownToPortableText(markdown),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, destination] = process.argv.slice(2);
  if (!source || !destination) throw new Error("Provide source Markdown and destination JSON paths.");
  const document = buildColophonDocument(readFileSync(source, "utf8"));
  writeFileSync(destination, JSON.stringify(document));
  console.log(JSON.stringify({ blocks: document.body.length, diagrams: document.body.filter(block => block._type === "mermaidDiagram").length,
    bytes: Buffer.byteLength(JSON.stringify(document)) }));
}
