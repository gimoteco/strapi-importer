import { gql } from "apollo-boost";

export default gql`
  {
    posts {
      id
      title
      createdAt
      updatedAt
      category
      image {
        url
      }
      metaTags {
        description
        keywords
      }
      slug
      text
    }
  }
`;
