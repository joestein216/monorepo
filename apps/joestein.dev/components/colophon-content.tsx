import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import type { COLOPHON_PAGE_QUERY_RESULT } from "@/sanity.types";
import { MermaidDiagram } from "./mermaid-diagram";

export type ColophonPage = NonNullable<COLOPHON_PAGE_QUERY_RESULT>;

export function editorialHref(value: unknown) {
  if (typeof value !== "string") return undefined;
  if (/^(\/(?!\/)|#)/.test(value) && !/[\\\u0000-\u0020]/.test(value)) return value;
  try { return ["https:", "http:", "mailto:"].includes(new URL(value).protocol) ? value : undefined; }
  catch { return undefined; }
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p data-slot="colophon-paragraph">{children}</p>,
    h2: ({ children }) => <h2 data-slot="colophon-h2">{children}</h2>,
    h3: ({ children }) => <h3 data-slot="colophon-h3">{children}</h3>,
    h4: ({ children }) => <h4 data-slot="colophon-h4">{children}</h4>,
    blockquote: ({ children }) => <blockquote data-slot="colophon-quote">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul data-slot="colophon-list">{children}</ul>,
    number: ({ children }) => <ol data-slot="colophon-list">{children}</ol>,
  },
  listItem: ({ children }) => <li data-slot="colophon-list-item">{children}</li>,
  marks: {
    code: ({ children }) => <code data-slot="inline-code">{children}</code>,
    link: ({ value, children }) => {
      const href = editorialHref(value?.href);
      return href ? <a data-slot="colophon-text-link" href={href}>{children}</a> : <>{children}</>;
    },
  },
  types: {
    mermaidDiagram: ({ value }) => <MermaidDiagram code={value.code ?? ""} caption={value.caption} />,
    codeBlock: ({ value }) => <figure data-slot="code-figure">
      {value.language && <figcaption data-slot="code-caption">{value.language}</figcaption>}
      <pre data-slot="code-block"><code>{value.code}</code></pre>
    </figure>,
  },
};

export function ColophonContent({ page }: { page: ColophonPage }) {
  return <article data-slot="colophon-article">
    <header data-slot="colophon-introduction">
      {page.eyebrow && <p data-slot="colophon-eyebrow">{page.eyebrow}</p>}
      <h1 data-slot="colophon-title">{page.title}</h1>
      {page.subtitle && <p data-slot="colophon-subtitle">{page.subtitle}</p>}
    </header>
    {page.body?.length ? <PortableText value={page.body} components={components} /> : <p data-slot="colophon-paragraph">Engineering notes are being prepared.</p>}
    <footer data-slot="colophon-footer"><Link href="/?mode=prompt" prefetch={false}>Ask Joe’s portfolio a question</Link></footer>
  </article>;
}
