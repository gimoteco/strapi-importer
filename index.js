import fetch from "node-fetch";
import ApolloClient from "apollo-boost";
import { writeFile } from "fs";
import { join as pathJoin } from "path";
import { promisify } from "util";
import {
  sanitizeSlug,
  getFrontmatter,
  formatDatetime,
  formatDate,
  sanitizeKeywords,
} from "./utils";
import postsQuery from "./queries/posts";
import slugify from "slugify";

const client = new ApolloClient({
  uri: "http://localhost:1337/graphql",
  fetch,
});

const writeFileAsync = promisify(writeFile);

async function getPosts() {
  const postsResponse = await client.query({
    query: postsQuery,
  });

  return postsResponse.data.posts;
}

async function generateMarkdown(post) {
  const {
    title,
    text,
    slug,
    createdAt,
    category,
    metaTags: { description, keywords },
  } = post;
  const date = formatDate(createdAt);
  const newSlug = slugify(`${date} ${sanitizeSlug(slug)}`);
  const filepath = pathJoin(__dirname, "posts", `${newSlug}.md`);
  const frontmatter = getFrontmatter({
    title,
    date: formatDatetime(createdAt),
    category,
    description,
    keywords: sanitizeKeywords(keywords),
  });

  await writeFileAsync(filepath, `${frontmatter}\n${text}`);
}

async function main() {
  const posts = await getPosts();
  posts.forEach(generateMarkdown);
}

main();
