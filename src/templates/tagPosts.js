import React from "react"
import {graphql} from "gatsby"
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';
import {Pagination} from '../components/Pagination';

const Posts = ({data, pageContext}) => (
  <Layout>
    <SEO title={`${pageContext.name} posts`}/>
    <h1 className="page__title">
      Posts tagged with <strong>{pageContext.name}</strong>
    </h1>
    {data.allWordpressPost.edges.map(({node}) => (
      <PostExcerpt
        categories={node.categories}
        excerpt={node.excerpt}
        isNew={node.daysAgo < 20}
        readingTime={node.fields.readingTime}
        slug={node.slug}
        tags={node.tags}
        title={node.title}/>
    ))}
    <Pagination
      base={pageContext.base}
      currentPage={pageContext.currentPage}
      pageCount={pageContext.pageCount}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!, $id: String!) {
    allWordpressPost(sort: {fields: [date], order:DESC}, limit: $limit, skip: $skip, filter: {tags: {elemMatch: {id: {eq: $id}}}}) {
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

export default Posts;
