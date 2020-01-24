import React from "react"
import {graphql} from "gatsby"
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';
import {Pagination} from '../components/Pagination';

const Posts = ({data: {allWordpressPost}, pageContext}) => (
  <Layout>
    <SEO title={pageContext.name}/>
    <h1 className="page__title">
      Posts within the <strong>{pageContext.name}</strong> category
    </h1>
    {allWordpressPost.edges.map(({node}) => (
      <PostExcerpt
        key={node.id}
        categories={node.categories}
        excerpt={node.excerpt}
        isNew={node.daysAgo < 20}
        readingTime={node.fields.readingTime}
        slug={node.slug}
        tags={node.tags}
        title={node.title}/>
    ))}
    <Pagination
      pageCount={pageContext.pageCount}
      currentPage={pageContext.currentPage}
      base={pageContext.base}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!, $id: String!) {    
    allWordpressPost(sort: {fields: [date], order:DESC}, limit: $limit, skip: $skip, filter: {categories: {elemMatch: {id: {eq: $id}}}}) {
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
