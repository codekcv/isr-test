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
  console.log("featured:", props);
  const { posts } = props.featured;

  return (
    <div className={styles.container}>
      {posts.map((post) => (
        <pre style={{ width: "100%" }}>{JSON.stringify(post)}</pre>
      ))}
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
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
