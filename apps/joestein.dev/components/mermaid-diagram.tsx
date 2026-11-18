"use client";

import { useEffect, useId, useRef, useState } from "react";
import { renderPortfolioDiagram } from "@/lib/mermaid-renderer";

export function MermaidDiagram({ code, caption }: { code: string; caption?: string | null }) {
  const target = useRef<HTMLSpanElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [failedSource, setFailedSource] = useState<string | null>(null);
  useEffect(() => {
    let disposed = false;
    void renderPortfolioDiagram(`diagram-${id}`, code).then((svg) => {
      if (!disposed) target.current?.replaceChildren(svg);
    }).catch(() => { if (!disposed) setFailedSource(code); });
    return () => { disposed = true; };
  }, [code, id]);
  return <figure data-slot="diagram-block">
    <span ref={target} data-slot="diagram-render" role="img" aria-label={caption || "Architecture diagram; source available below"} />
    {caption && <figcaption data-slot="diagram-caption">{caption}</figcaption>}
    {failedSource === code && <p data-slot="diagram-status" role="status">The diagram could not be drawn. Its complete source is available below.</p>}
    <details data-slot="diagram-source">
      <summary>Diagram source</summary>
      <pre data-slot="code-block"><code>{code}</code></pre>
    </details>
  </figure>;
}
