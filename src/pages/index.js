import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {AboutHeadline} from '../components/AboutHeadline';
import {PostCardContainer} from '../components/PostCardContainer';
import {VisitBlogBanner} from '../components/VisitBlogBanner';

const allPostsQuery = graphql`
  query {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, limit: 10) {
      edges {
        node {
          excerpt(format: PLAIN)
          frontmatter {
            categories
            title
            date(formatString: "MMMM Do, YYYY")
            excerpt
            featuredImage {
              childImageSharp {
                gatsbyImageData(layout: CONSTRAINED, width: 80)
              }
            }
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
      <AboutHeadline/>
      <h1>Latest posts</h1>
      <PostCardContainer posts={allMarkdownRemark.edges}/>
      <VisitBlogBanner/>
    </Layout>
  );
};

export default IndexPage;
