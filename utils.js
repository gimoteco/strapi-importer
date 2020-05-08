import format from "date-fns/format";
import { Buffer } from "buffer";
import fetch from "node-fetch";
import { promisify } from "util";
import { writeFile } from "fs";

export const writeFileAsync = promisify(writeFile);

export function formatDatetime(date) {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
}

export function formatDate(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function getFrontmatter(props) {
  return `---\n${Object.entries(props)
    .map(([key, value]) => `${key}: "${value}"\n`)
    .join("")}---`;
}

export function sanitizeSlug(slug) {
  return slug.replace(/\/$/, "");
}

export const sanitizeKeywords = (dirtyKeywords) =>
  dirtyKeywords
    .split(",")
    .map((word) => word.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, ""))
    .join(", ");

export const allReplace = (text, obj) => {
  let retStr = text;
  for (const x in obj) {
    retStr = retStr.replace(new RegExp(x, "g"), obj[x]);
  }
  return retStr;
};

export async function download(url, outputPath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await writeFileAsync(outputPath, Buffer.from(buffer));
}
