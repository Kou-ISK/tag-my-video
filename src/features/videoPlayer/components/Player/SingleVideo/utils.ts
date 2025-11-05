export const formatSource = (src: string) => {
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('file://')) return trimmed;

  if (/^\\\\/.test(trimmed)) {
    const replaced = trimmed.replace(/\\/g, '/').replace(/^\/+/g, '');
    return `file://${encodeURI(replaced)}`;
  }

  if (/^[a-zA-Z]:[\\/]/.test(trimmed)) {
    const replaced = trimmed.replace(/\\/g, '/');
    return `file:///${encodeURI(replaced)}`;
  }

  const normalised = trimmed.replace(/\\/g, '/').replace(/^\/+/g, '');
  return `file:///${encodeURI(normalised)}`;
};
