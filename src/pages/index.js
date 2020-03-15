import React from 'react';
import {graphql, Link, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';
import {ElevatorPitch} from '../components/ElevatorPitch';
import {ReadMoreBox} from '../components/ReadMoreBox';

const allPostsQuery = graphql`
  query {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, limit: 10) {
      edges {
        node {
          excerpt(format: PLAIN)
          frontmatter {
            categories
            tags
            title
            daysAgo: date(difference: "days")
          }
          fields {
            slug
          }
          id
          fileAbsolutePath
          timeToRead
        }
      }
    }
  }
`;

const IndexPage = () => {
  const {allMarkdownRemark} = useStaticQuery(allPostsQuery);

  return (
    <Layout>
      <SEO title="Home"/>
      <ElevatorPitch/>
      <h1>Latest posts</h1>
      {allMarkdownRemark.edges.map(({node}) => (
        <PostExcerpt
          key={node.id}
          categories={node.frontmatter.categories}
          excerpt={node.excerpt}
          isNew={node.frontmatter.daysAgo < 20}
          readingTime={node.timeToRead}
          slug={node.fields.slug}
          tags={node.frontmatter.tags}
          title={node.frontmatter.title}/>
      ))}
      <ReadMoreBox/>
    </Layout>
  );
};

export default IndexPage;
