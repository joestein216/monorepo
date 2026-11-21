// Only trusted provider players may be embedded; public links remain available.
export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function playerUrl(
  value: string | null | undefined,
): string | undefined {
  const clean = safeUrl(value?.replaceAll("&amp;", "&"));
  if (!clean) return undefined;
  const url = new URL(clean);
  if (url.protocol !== "https:") return undefined;
  const allowed: Record<string, string[]> = {
    "app.hearthis.at": ["/embed/"],
    "hearthis.at": ["/embed/"],
    "w.soundcloud.com": ["/player/"],
    "www.mixcloud.com": ["/widget/iframe/"],
    "open.spotify.com": ["/embed/"],
    "www.youtube.com": ["/embed/"],
    "www.youtube-nocookie.com": ["/embed/"],
    "player.vimeo.com": ["/video/"],
  };
  if (allowed[url.hostname]?.some((path) => url.pathname.startsWith(path)))
    return url.href;
  if (["youtube.com", "www.youtube.com", "youtu.be"].includes(url.hostname)) {
    const id =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v");
    if (id && /^[\w-]{11}$/.test(id))
      return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  return undefined;
}
