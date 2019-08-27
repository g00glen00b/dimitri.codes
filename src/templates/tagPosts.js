import React from "react"
import {graphql} from "gatsby"
import {PostItem} from '../components/post/PostItem';
import {SiteIntro} from '../components/site/SiteIntro';
import {Layout} from '../components/shared/Layout';
import {SEO} from '../components/shared/Seo';
import {SiteDivider} from '../components/site/SiteDivider';
import {Pagination} from '../components/shared/Pagination';

const Posts = ({data, pageContext}) => (
  <Layout>
    <SEO title={`${pageContext.name} posts`}/>
    <SiteIntro/>
    <SiteDivider/>
    {data.allWordpressPost.edges.map(({node}) => (
      <PostItem key={node.id} {...node} />
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
          date(formatString: "MMMM Do, YYYY")
          title
          excerpt
          slug
          tags {
            id
            slug
            name
          }
          readingTime {
            text
          }
        }
      }
    }
  }
`;

export default Posts;
