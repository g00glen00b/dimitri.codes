import React from "react"
import {graphql} from "gatsby"
import {PostItem} from '../components/post/PostItem';
import {SiteIntro} from '../components/site/SiteIntro';
import {Layout} from '../components/shared/Layout';
import {SiteDivider} from '../components/site/SiteDivider';
import {Pagination} from '../components/shared/Pagination';
import {SEO} from '../components/shared/Seo';

const Posts = ({data, pageContext}) => (
  <Layout>
    <SEO title={pageContext.name}/>
    <SiteIntro/>
    <SiteDivider/>
    {data.allWordpressPost.edges.map(({node}) => (
      <PostItem
        key={node.id}
        title={node.title}
        tags={node.tags}
        slug={node.slug}
        readingTime={node.fields.readingTime}
        excerpt={node.excerpt}
        date={node.date} />
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
          date(formatString: "MMMM Do, YYYY")
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
