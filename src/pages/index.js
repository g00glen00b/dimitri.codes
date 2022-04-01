import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {Seo} from '../components/Seo';
import {Layout} from '../components/Layout';
import {AboutHeadline} from '../components/AboutHeadline';
import {PostCardContainer} from '../components/PostCardContainer';
import {VisitBlogBanner} from '../components/VisitBlogBanner';

const allPostsQuery = graphql`
  query {
    allMarkdownRemark(sort: {fields: fields___postDate, order: DESC}, limit: 10) {
      nodes {
        excerpt(format: PLAIN)
        frontmatter {
          categories
          title
          excerpt
          featuredImage {
            childImageSharp {
              gatsbyImageData(layout: CONSTRAINED, width: 80)
            }
          }
        }
        fields {
          slug
          postDate(formatString: "MMMM Do, YYYY")
        }
        id
        fileAbsolutePath
        timeToRead
      }
    }
  }
`;

const IndexPage = () => {
  const {allMarkdownRemark} = useStaticQuery(allPostsQuery);

  return (
    <Layout>
      <Seo title="Home"/>
      <AboutHeadline/>
      <h1>Latest posts</h1>
      <PostCardContainer posts={allMarkdownRemark.nodes}/>
      <VisitBlogBanner/>
    </Layout>
  );
};

export default IndexPage;
