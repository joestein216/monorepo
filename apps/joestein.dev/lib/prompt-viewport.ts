// Bridge only viewport geometry that CSS cannot consistently observe when a
// mobile keyboard shrinks the visual viewport without resizing page layout.
// CSS remains responsible for density and layout; the document remains scrollable.
export function observePromptViewport(shell: HTMLElement) {
  if (!window.requestAnimationFrame) return () => {};
  const dock = shell.querySelector<HTMLElement>('[data-slot="prompt-dock"]');
  const header = shell.querySelector<HTMLElement>('[data-slot="top-cover"]');
  const viewport = window.visualViewport;
  let frame = 0;
  function update() {
    frame = 0;
    const zoomed = viewport && viewport.scale !== 1;
    const height = zoomed ? window.innerHeight : viewport?.height ?? window.innerHeight;
    const inset = zoomed ? 0 : Math.max(0, window.innerHeight - height - (viewport?.offsetTop ?? 0));
    shell.style.setProperty("--viewport-bottom-inset", `${inset}px`);
    shell.dataset.viewportConstrained = String(!zoomed && height < window.innerHeight - 1);
    const headerPosition = header ? window.getComputedStyle(header).position : "static";
    const headerHeight = headerPosition === "sticky" || headerPosition === "fixed" ? header?.getBoundingClientRect().height ?? 0 : 0;
    const occupied = headerHeight + (dock?.getBoundingClientRect().height ?? 0);
    shell.dataset.controlsOverflow = String(occupied >= height);
  }
  function schedule() { if (!frame) frame = window.requestAnimationFrame(update); }
  const observer = window.ResizeObserver ? new window.ResizeObserver(schedule) : undefined;
  if (dock) observer?.observe(dock);
  if (header) observer?.observe(header);
  window.addEventListener("resize", schedule);
  viewport?.addEventListener("resize", schedule);
  viewport?.addEventListener("scroll", schedule);
  update();
  return () => {
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", schedule);
    viewport?.removeEventListener("resize", schedule);
    viewport?.removeEventListener("scroll", schedule);
    shell.style.removeProperty("--viewport-bottom-inset");
    delete shell.dataset.viewportConstrained;
    delete shell.dataset.controlsOverflow;
  };
}
