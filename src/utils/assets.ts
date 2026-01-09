const baseUrl = (process.env.PUBLIC_URL ?? "").replace(/\/+$/, "");

const normalizePath = (p: string) =>
  p.replace(/^public\//, "").replace(/^\/+/, "");

export const buildAssetUrl = (relativePath: string) => {
  const cleaned = normalizePath(relativePath);
  if (!cleaned) return "";
  return baseUrl ? `${baseUrl}/${cleaned}` : `/${cleaned}`;
};

export const buildAudioUrl = (songPath: string, song: string) => {
  if (!songPath || !song) return "";
  const normalized = songPath.endsWith("/") ? songPath : `${songPath}/`;
  return buildAssetUrl(`${normalized}${song}.mp3`);
};
