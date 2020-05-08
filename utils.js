import format from "date-fns/format";

export function formatDatetime(date) {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
}

export function formatDate(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function getFrontmatter(props) {
  return `---\n${Object.entries(props)
    .map(([key, value]) => `${key}: "${value}"`)
    .join("\n")}\n---`;
}

export function sanitizeSlug(slug) {
  return slug.replace(/\/$/, "");
}

export const sanitizeKeywords = (dirtyKeywords) =>
  dirtyKeywords
    .split(",")
    .map((word) => word.trim())
    .join(", ");
