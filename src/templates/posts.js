import React from "react"
import {graphql} from "gatsby"
import {SEO} from '../components/Seo';
import {Pagination} from '../components/Pagination';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';

const Posts = ({data: {allMarkdownRemark}, pageContext}) => (
  <Layout>
    <h1 className="page__title">
      Posts
    </h1>
    <SEO title="Posts"/>
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
      pageCount={pageContext.pageCount}
      currentPage={pageContext.currentPage}
      base={pageContext.base}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!) {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, skip: $skip, limit: $limit) {
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
