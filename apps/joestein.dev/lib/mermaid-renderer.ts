let engine: Promise<typeof import("mermaid")["default"]> | undefined;

function getEngine() {
  return engine ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false, securityLevel: "strict", htmlLabels: false,
      fontFamily: "var(--font-sans), sans-serif",
      suppressErrorRendering: true, maxTextSize: 20_000, maxEdges: 200,
      secure: ["secure", "securityLevel", "startOnLoad", "htmlLabels", "maxTextSize", "maxEdges", "suppressErrorRendering"],
    });
    return mermaid;
  });
}

export async function renderPortfolioDiagram(id: string, code: string): Promise<SVGSVGElement> {
  // Editorial diagrams cannot override the security or presentation contract.
  if (/%%\s*\{|^\s*---/m.test(code)) throw new Error("Diagram configuration directives are not supported.");
  const [mermaid, { default: purify }] = await Promise.all([getEngine(), import("dompurify")]);
  const { svg } = await mermaid.render(id, code);
  const fragment = purify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true }, RETURN_DOM_FRAGMENT: true,
    FORBID_TAGS: ["style", "script", "foreignObject", "image", "a", "use"], FORBID_ATTR: ["style"],
  });
  const result = fragment.querySelector("svg");
  if (!result) throw new Error("The diagram could not be rendered.");
  // Mermaid supplies intrinsic viewBox geometry; the site's token layer owns
  // width, typography, ink, and surfaces rather than generated inline styles.
  result.removeAttribute("width");
  result.removeAttribute("height");
  result.setAttribute("aria-hidden", "true");
  result.setAttribute("focusable", "false");
  return result as unknown as SVGSVGElement;
}
