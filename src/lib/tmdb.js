export async function fetchTmdbInfo(title, contentType = "tv") {
  const params = new URLSearchParams({ title, type: contentType });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`/api/tmdb?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || title,
      posterUrl: data.posterUrl || null,
      synopsis: data.synopsis || "",
      genres: Array.isArray(data.genres) ? data.genres.slice(0, 3) : [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
