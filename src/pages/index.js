import React from 'react';
import {graphql} from 'gatsby';
import {Layout} from '../components/Layout';
import {AboutHeadline} from '../components/AboutHeadline';
import {PostCardContainer} from '../components/PostCardContainer';
import {VisitBlogBanner} from '../components/VisitBlogBanner';
import {Seo} from "../components/Seo";

export const query = graphql`
  query {
    file(relativePath: {eq: "logo-square.png"}) {
      publicURL
    }
    site {
      siteMetadata {
        title
        description
        author
        siteUrl
      }
    }
    allMarkdownRemark(sort: {fields: {postDate: DESC}}, limit: 10) {
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

const IndexPage = ({data: {allMarkdownRemark: {nodes}}}) => (
  <Layout>
    <AboutHeadline/>
    <h1>Latest posts</h1>
    <PostCardContainer posts={nodes}/>
    <VisitBlogBanner/>
  </Layout>
);

export default IndexPage;

export const Head = ({location: {pathname}, data: {file, site}}) => (
  <Seo
    siteUrl={site.siteMetadata.siteUrl}
    description={site.siteMetadata.description}
    imageUrl={file.publicURL}
    author={site.siteMetadata.author}
    iconUrl={file.publicURL}
    title="Home"
    siteTitle={site.siteMetadata.title}
    path={pathname} />
);
