import Head from "next/head";
import styles from "../styles/Home.module.css";
import request from "graphql-request";

const build = (name) => {
  const x = name.replace(/[^a-zA-Z]+/g, "");

  return /* GraphQL */ `${x}:posts(
    publicationState: LIVE
    sort: "published_at:desc"
    limit: 1
    where: { category: { main_category: { name: "${name}" } } }
  ) {
    id
    title
    type
    category {
      main_category {
        name
      }
    }
    media {
      formats
    }
  }`;
};

export default function Home(props) {
  console.log("Props:", props);
  const { posts } = props.featured;

  return (
    <div className={styles.container}>
      {posts.map((post) => (
        <pre style={{ width: "100%" }}>{JSON.stringify(post)}</pre>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  // --- Menu Query
  const menu = await request(
    `${process.env.STRAPI_API_URL}/graphql`,
    /* GraphQL */ `
      {
        mainCategories(publicationState: LIVE) {
          id
          name
        }
        subCategories(publicationState: LIVE) {
          id
          name
          main_category {
            id
            name
          }
        }
      }
    `
  );

  const mainCategories = menu.mainCategories.map((item) => item.name);

  const featured = await request(
    `${process.env.STRAPI_API_URL}/graphql`,
    /* GraphQL */ `
      {
        posts(
          where: { homepage_featured: true }
          sort: "published_at:desc"
          limit: 5
        ) {
          id
          title
          description
          content
          slug
          category {
            main_category {
              name
            }
          }
          type
          author {
            id
            name
          }
          homepage_featured
          view_count
          tagline
          media {
            formats
          }
          hashtags {
            id
            name
            posts {
              id
              title
            }
          }
        }
      }
    `
  );

  // --- Latest Content
  let buildQuery = "";

  mainCategories.forEach((category) => {
    const herApp = "Her App";
    const courses = "Courses & Ebooks";

    if (category === herApp || category === courses) return;

    buildQuery += build(category);
  });

  const latest = await request(
    `${process.env.STRAPI_API_URL}/graphql`,
    `{${buildQuery}}`
  );

  // --- Her TV
  const herTV = await request(
    `${process.env.STRAPI_API_URL}/graphql`,
    /* GraphQL */ `
      {
        posts(
          publicationState: LIVE
          sort: "published_at:desc"
          limit: 8
          where: { type: "Video" }
        ) {
          id
          title
          category {
            main_category {
              name
            }
          }
          media {
            formats
          }
        }
      }
    `
  );

  // --- Her Radio
  const herRadio = await request(
    `${process.env.STRAPI_API_URL}/graphql`,
    /* GraphQL */ `
      {
        posts(
          publicationState: LIVE
          sort: "published_at:desc"
          limit: 8
          where: { type: "Podcast" }
        ) {
          id
          title
          tagline
          category {
            main_category {
              name
            }
          }
          media {
            formats
          }
        }
      }
    `
  );

  // --- Trending
  const trending = await request(
    `${process.env.STRAPI_API_URL}/graphql`,
    /* GraphQL */ `
      {
        posts(publicationState: LIVE, sort: "view_count:desc", limit: 15) {
          id
          title
          type
          tagline
          category {
            name
            main_category {
              slug
            }
          }
          media {
            formats
          }
        }
      }
    `
  );

  return {
    props: {
      menu,
      featured,
      latest,
      herTV,
      herRadio,
      trending,
    },
    revalidate: 1,
  };
}
