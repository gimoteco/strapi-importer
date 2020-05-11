import fetch from "node-fetch";
import ApolloClient from "apollo-boost";
import { join as pathJoin } from "path";
import {
  sanitizeSlug,
  getFrontmatter,
  formatDatetime,
  formatDate,
  sanitizeKeywords,
  allReplace,
  download,
  writeFileAsync,
} from "./utils";
import postsQuery from "./queries/posts";
import slugify from "slugify";
import { resolve as urlPathJoin, URL } from "url";

const strapiServer = "http://localhost:1337";
const outputImageDir = pathJoin(__dirname, "images");
const newFrontMatterImagePath = "../static/assets/img/";
const newImagePath = "/assets/img/";

const client = new ApolloClient({
  uri: `${strapiServer}/graphql`,
  fetch,
});

async function getPosts() {
  const postsResponse = await client.query({
    query: postsQuery,
  });

  return postsResponse.data.posts;
}

const getFilenameFromUrl = (url) => url.split("/").pop();

function extractImagesFromText(text) {
  const imageRegex = /(?:!\[(.*?)\]\((.*?)\))/g;
  const matches = text.matchAll(imageRegex);
  const urls = [...matches].map(([, , url]) => {
    const imageFilename = getFilenameFromUrl(url);
    return {
      url,
      path: url && new URL(url).pathname,
      newPath: pathJoin(newImagePath, imageFilename),
    };
  });
  return urls;
}

function downloadLocalImagesFrom(text) {
  const localImages = extractImagesFromText(text).filter(({ url }) =>
    url.includes("http://localhost")
  );
  const fixedPathText = allReplace(text, replaceObject);
  const replaceObject = localImages.reduce((acc, { newPath, url }) => {
    acc[url] = newPath;
    return acc;
  }, {});
  const imagesPromises = localImages.map(
    ({ url: localImageUrl, path: localImagePath }) => {
      download(
        urlPathJoin(strapiServer, localImagePath),
        pathJoin(outputImageDir, getFilenameFromUrl(localImageUrl))
      );
    }
  );
  return {
    fixedPathText,
    imagesPromises,
  };
}

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

  const { fixedPathText, imagesPromises } = downloadLocalImagesFrom(text);
  const fileContent = getFrontmatter(
    {
      title,
      date: formatDatetime(createdAt),
      category,
      description,
      image: pathJoin(newFrontMatterImagePath, imageFilename),
      keywords: sanitizeKeywords(keywords),
    },
    fixedPathText
  );

  return Promise.all([
    ...imagesPromises,
    download(
      urlPathJoin(strapiServer, imageUrl),
      pathJoin(outputImageDir, imageFilename)
    ),
    writeFileAsync(filepath, fileContent),
  ]);
}

async function main() {
  console.time("Execution");
  const posts = await getPosts();
  await Promise.all(posts.map(generateMarkdown));
  console.timeEnd("Execution");
}

main();
