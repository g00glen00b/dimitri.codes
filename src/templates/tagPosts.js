import React from "react"
import {graphql} from "gatsby"
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';
import {Pagination} from '../components/Pagination';

const Posts = ({data: {allMarkdownRemark}, pageContext}) => (
  <Layout>
    <SEO title={`${pageContext.fieldValue} posts`}/>
    <h1 className="page__title">
      Posts tagged with <strong>{pageContext.fieldValue}</strong>
    </h1>
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
    <Pagination
      base={pageContext.base}
      currentPage={pageContext.currentPage}
      pageCount={pageContext.pageCount}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!, $fieldValue: String!) {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, skip: $skip, limit: $limit, filter: {frontmatter: {tags: {eq: $fieldValue}}}) {
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

export default Posts;
