import fetch from "node-fetch";
import ApolloClient, { gql } from "apollo-boost";
import { writeFile } from "fs";
import { join as pathJoin } from "path";
import { promisify } from "util";
import format from "date-fns/format";

const client = new ApolloClient({
  uri: "http://localhost:1337/graphql",
  fetch,
});

const writeFileAsync = promisify(writeFile);

async function getPosts() {
  const postsResponse = await client.query({
    query: gql`
      {
        posts {
          id
          title
          createdAt
          updatedAt
          category
          image {
            id
          }
          metaTags {
            description
          }
          slug
          text
        }
      }
    `,
  });

  return postsResponse.data.posts;
}

function formatDate(date) {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
}

function getFrontmatter(props) {
  return `---\n${Object.entries(props)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")}\n---`;
}

function sanitizeSlug(slug) {
  return slug.replace(/\/$/, "");
}

async function generateMarkdown(post) {
  const {
    title,
    text,
    slug,
    createdAt,
    category,
    metaTags: { description },
  } = post;
  const filepath = pathJoin(__dirname, "posts", `${sanitizeSlug(slug)}.md`);
  const frontmatter = getFrontmatter({
    title,
    date: formatDate(createdAt),
    category,
    description,
  });

  await writeFileAsync(filepath, `${frontmatter}\n${text}`);
}

async function main() {
  const posts = await getPosts();
  posts.forEach(generateMarkdown);
}

main();
