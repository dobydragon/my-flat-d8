/** Resolve a file in public/ against the deploy base (works under a GitHub Pages sub-path). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
