import React from 'react';
import {graphql, Link, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';
import {ElevatorPitch} from '../components/ElevatorPitch';
import {ReadMoreBox} from '../components/ReadMoreBox';

const allWordpressPostQuery = graphql`
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
`;

const IndexPage = () => {
  const {allWordpressPost} = useStaticQuery(allWordpressPostQuery);

  return (
    <Layout>
      <SEO title="Home"/>
      <ElevatorPitch/>
      <h1>Latest posts</h1>
      {allWordpressPost.edges.map(({node}) => (
        <PostExcerpt
          key={node.id}
          categories={node.categories}
          excerpt={node.excerpt}
          isNew={node.daysAgo < 20}
          readingTime={node.fields.readingTime}
          slug={node.slug}
          tags={node.tags}
          title={node.title}/>
      ))}
      <ReadMoreBox/>
    </Layout>
  );
};

export default IndexPage;
