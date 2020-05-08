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
import { Buffer } from "buffer";
import { resolve as urlPathJoin } from "url";

const strapiServer = "http://localhost:1337";
const outputImageDir = pathJoin(__dirname, "images");
const frontmatterImagePath = "../static/assets/img/";

const client = new ApolloClient({
  uri: `${strapiServer}/graphql`,
  fetch,
});

const writeFileAsync = promisify(writeFile);

async function getPosts() {
  const postsResponse = await client.query({
    query: postsQuery,
  });

  return postsResponse.data.posts;
}

async function download(url, outputPath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await writeFileAsync(outputPath, Buffer.from(buffer));
}

const getFilenameFromUrl = (url) => url.split("/").pop();

async function generateMarkdown(post) {
  const {
    title,
    text,
    slug,
    createdAt,
    category,
    image: { url: imageUrl },
    metaTags: { description, keywords },
  } = post;
  const date = formatDate(createdAt);
  const newSlug = slugify(`${date} ${sanitizeSlug(slug)}`);
  const filepath = pathJoin(__dirname, "posts", `${newSlug}.md`);
  const imageFilename = getFilenameFromUrl(imageUrl);

  const frontmatter = getFrontmatter({
    title,
    date: formatDatetime(createdAt),
    category,
    description,
    image: pathJoin(frontmatterImagePath, imageFilename),
    keywords: sanitizeKeywords(keywords),
  });

  return Promise.all([
    download(
      urlPathJoin(strapiServer, imageUrl),
      pathJoin(outputImageDir, imageFilename)
    ),
    writeFileAsync(filepath, `${frontmatter}\n${text}`),
  ]);
}

async function main() {
  console.time("Execution");
  const posts = await getPosts();
  await Promise.all(posts.map(generateMarkdown));
  console.timeEnd("Execution");
}

main();
