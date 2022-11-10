import React from "react"
import {graphql} from "gatsby"
import {Layout} from '../components/Layout';
import {Pagination} from '../components/Pagination';
import {PostCardContainer} from "../components/PostCardContainer";
import PropTypes from 'prop-types';
import {Seo} from "../components/Seo";

const Posts = ({data: {allMarkdownRemark}, pageContext}) => (
  <Layout>
    <h1 className="page__title">
      Posts
    </h1>
    <PostCardContainer posts={allMarkdownRemark.nodes}/>
    <Pagination
      pageCount={pageContext.pageCount}
      currentPage={pageContext.currentPage}
      base={pageContext.base}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!) {
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
    allMarkdownRemark(sort: {fields: {postDate: DESC}}, skip: $skip, limit: $limit) {
      nodes {
        excerpt(format: PLAIN)
        frontmatter {
          categories
          tags
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
      }
    }
  }
`;

export default Posts;

Posts.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      nodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        excerpt: PropTypes.string,
        timeToRead: PropTypes.number,
        frontmatter: PropTypes.shape({
          categories: PropTypes.arrayOf(PropTypes.string),
          tags: PropTypes.arrayOf(PropTypes.string),
          title: PropTypes.string,
          excerpt: PropTypes.string,
          featuredImage: PropTypes.shape({
            childImageSharp: PropTypes.shape({
              gatsbyImageData: PropTypes.object
            })
          })
        }),
        fields: PropTypes.shape({
          slug: PropTypes.string,
          postDate: PropTypes.string,
        }),
      }))
    })
  }),
  pageContext: PropTypes.shape({
    base: PropTypes.string.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired
  })
};

export const Head = ({location: {pathname}, data: {file, site}}) => (
  <Seo
    siteUrl={site.siteMetadata.siteUrl}
    description={site.siteMetadata.description}
    imageUrl={file.publicURL}
    author={site.siteMetadata.author}
    iconUrl={file.publicURL}
    title="Posts"
    siteTitle={site.siteMetadata.title}
    path={pathname} />
);
