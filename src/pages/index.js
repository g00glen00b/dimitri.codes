import React from "react"
import {graphql, Link, useStaticQuery} from "gatsby"
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';
import {ActionTitle} from '../components/ActionTitle';
import {ElevatorPitch} from '../components/ElevatorPitch';

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      allWordpressPost(sort: {fields: [date], order:DESC}, limit: 5) {
        edges {
          node {
            id
            categories {
              id
              name
              slug
            }
            actualDate: date(formatString: "MMMM Do, YYYY")
            daysAgo: date(difference: "days")
            title
            excerpt
            slug
            tags {
              id
              slug
              name
            }
            fields {
              readingTime {
                text
              }
            }
          }
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="Home"/>
      <ElevatorPitch/>
      <ActionTitle
        title="Latest posts"
        actionLink="/category/t"
        actionText="View all"/>
      {data.allWordpressPost.edges.map(({node}) => (
        <PostExcerpt
          actualDate={node.actualDate}
          categories={node.categories}
          dateString={node.dateString}
          excerpt={node.excerpt}
          isNew={node.daysAgo < 20}
          readingTime={node.fields.readingTime}
          slug={node.slug}
          tags={node.tags}
          title={node.title}/>
      ))}
    </Layout>
  );
};

export default IndexPage;
