const buildRuntimeBase = () => {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : "";
};

const baseUrl = (process.env.PUBLIC_URL ?? buildRuntimeBase()).replace(
  /\/+$/,
  "",
);

const normalizePath = (p: string) =>
  p.replace(/^public\//, "").replace(/^\/+/, "");

export const buildAssetUrl = (relativePath: string) => {
  const cleaned = normalizePath(relativePath);
  if (!cleaned) return "";
  const encoded = encodeURI(cleaned);
  return baseUrl ? `${baseUrl}/${encoded}` : `/${encoded}`;
};

export const buildAudioUrl = (songPath: string, song: string) => {
  if (!songPath || !song) return "";
  const normalized = songPath.endsWith("/") ? songPath : `${songPath}/`;
  return buildAssetUrl(`${normalized}${song}.mp3`);
};
