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
        id
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
