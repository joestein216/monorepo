type FollowElements = {
  question: HTMLElement;
  content: HTMLElement;
  header: HTMLElement;
  dock: HTMLElement;
  onRelease?: () => void;
};

// Scroll the document, never a nested panel. All bounds come from the theme's
// actual geometry, including the sticky covers and the mobile visual viewport.
export function followConversation({ question, content, header, dock, onRelease }: FollowElements) {
  if (!window.ResizeObserver || !window.requestAnimationFrame) return () => {};
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let following = true;
  let frame = 0;
  let target: number | undefined;
  const observer = new window.ResizeObserver(schedule);
  const viewport = window.visualViewport;

  function topEdge() {
    return Math.max(viewport?.offsetTop ?? 0, header.getBoundingClientRect().bottom);
  }
  function cancelMotion() {
    if (target !== undefined) window.scrollTo({ top: window.scrollY, behavior: "instant" });
    target = undefined;
  }
  function release() {
    if (!following) return;
    following = false;
    window.cancelAnimationFrame(frame);
    observer.disconnect();
    cancelMotion();
  }
  function relinquish() {
    if (!following) return;
    onRelease?.();
    release();
  }
  function reachedQuestion() {
    if (following && question.getBoundingClientRect().top <= topEdge()) relinquish();
  }
  function update() {
    frame = 0;
    if (!following || !question.isConnected || !content.isConnected) return;
    const top = topEdge();
    const bottom = Math.min((viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight), dock.getBoundingClientRect().top);
    const remaining = question.getBoundingClientRect().top - top;
    if (remaining <= 0) { relinquish(); return; }
    if (bottom <= top) return; // An expanded tray/keyboard can leave no reading area.
    const overflow = content.getBoundingClientRect().bottom - bottom;
    const next = window.scrollY + Math.min(remaining, Math.max(0, overflow));
    if (next <= window.scrollY) { cancelMotion(); return; }
    if (next === target) return;
    target = next;
    window.scrollTo({ top: next, behavior: motion.matches ? "instant" : "smooth" });
  }
  function schedule() {
    if (following && !frame) frame = window.requestAnimationFrame(update);
  }
  function motionChanged() { cancelMotion(); schedule(); }

  // Input intent, not scroll events, distinguishes readers from our own smooth
  // scroll. Never prevent default or reclaim control during the same turn.
  const inputs = ["wheel", "touchstart", "pointerdown", "click", "keydown"] as const;
  for (const type of inputs) window.addEventListener(type, relinquish, { capture: true, passive: true });
  window.addEventListener("scroll", reachedQuestion, { passive: true });
  window.addEventListener("resize", schedule);
  viewport?.addEventListener("resize", schedule);
  viewport?.addEventListener("scroll", schedule);
  motion.addEventListener("change", motionChanged);
  for (const element of [content, question, header, dock]) observer.observe(element);
  schedule();

  return () => {
    release();
    for (const type of inputs) window.removeEventListener(type, relinquish, true);
    window.removeEventListener("scroll", reachedQuestion);
    window.removeEventListener("resize", schedule);
    viewport?.removeEventListener("resize", schedule);
    viewport?.removeEventListener("scroll", schedule);
    motion.removeEventListener("change", motionChanged);
  };
}
