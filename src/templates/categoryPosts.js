import React from "react"
import {graphql} from "gatsby"
import {Seo} from '../components/Seo';
import {Layout} from '../components/Layout';
import {Pagination} from '../components/Pagination';
import {PostCardContainer} from '../components/PostCardContainer';
import PropTypes from 'prop-types';

const Posts = ({data: {allMarkdownRemark}, pageContext}) => (
  <Layout>
    <Seo title={pageContext.fieldValue}/>
    <h1 className="page__title">
      Posts within the <strong>{pageContext.fieldValue}</strong> category
    </h1>
    <PostCardContainer posts={allMarkdownRemark.edges}/>
    <Pagination
      pageCount={pageContext.pageCount}
      currentPage={pageContext.currentPage}
      base={pageContext.base}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!, $fieldValue: String!) {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, skip: $skip, limit: $limit, filter: {frontmatter: {categories: {eq: $fieldValue}}}) {
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

Posts.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string.isRequired,
          excerpt: PropTypes.string,
          timeToRead: PropTypes.number,
          frontmatter: PropTypes.shape({
            categories: PropTypes.arrayOf(PropTypes.string),
            date: PropTypes.string,
            title: PropTypes.string,
            excerpt: PropTypes.string,
            featuredImage: PropTypes.shape({
              childImageSharp: PropTypes.shape({
                gatsbyImageData: PropTypes.object
              })
            })
          }),
          fields: PropTypes.shape({
            slug: PropTypes.string
          })
        })
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

export default Posts;
