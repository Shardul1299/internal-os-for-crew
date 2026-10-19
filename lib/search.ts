// Global search with tokens (§2, §10): `sub:ai_educator tier:T1 src:program lang:hinglish stage:roster`.
export type ParsedQuery = { text: string; tokens: Record<string, string[]> };

export function parseQuery(q: string | null | undefined): ParsedQuery {
  const tokens: Record<string, string[]> = {};
  const words: string[] = [];
  for (const part of (q ?? "").trim().split(/\s+/).filter(Boolean)) {
    const m = part.match(/^([a-z]+):(.+)$/i);
    if (m) (tokens[m[1].toLowerCase()] ??= []).push(m[2].toLowerCase());
    else words.push(part);
  }
  return { text: words.join(" "), tokens };
}

export function sp(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
