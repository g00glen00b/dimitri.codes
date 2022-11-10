import React from "react"
import {graphql} from "gatsby"
import {Layout} from '../components/Layout';
import {Pagination} from '../components/Pagination';
import {PostCardContainer} from '../components/PostCardContainer';
import PropTypes from 'prop-types';
import {Seo} from "../components/Seo";

const Posts = ({data: {allMarkdownRemark}, pageContext}) => (
  <Layout>
    <h1 className="page__title">
      Posts tagged with <strong>{pageContext.fieldValue}</strong>
    </h1>
    <PostCardContainer posts={allMarkdownRemark.nodes}/>
    <Pagination
      base={pageContext.base}
      currentPage={pageContext.currentPage}
      pageCount={pageContext.pageCount}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!, $fieldValue: String!) {
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
    allMarkdownRemark(sort: {fields: {postDate: DESC}}, skip: $skip, limit: $limit, filter: {frontmatter: {tags: {eq: $fieldValue}}}) {
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
      }
    }
  }
`;

export default Posts;

export const Head = ({location: {pathname}, data: {file, site}, pageContext}) => (
  <Seo
    siteUrl={site.siteMetadata.siteUrl}
    description={site.siteMetadata.description}
    imageUrl={file.publicURL}
    author={site.siteMetadata.author}
    iconUrl={file.publicURL}
    title={`${pageContext.fieldValue} posts`}
    siteTitle={site.siteMetadata.title}
    path={pathname} />
);

Posts.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      nodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        excerpt: PropTypes.string,
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
    fieldValue: PropTypes.string.isRequired,
    base: PropTypes.string.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired
  })
};
