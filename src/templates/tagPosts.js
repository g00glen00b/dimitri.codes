import React from "react"
import {graphql} from "gatsby"
import {SEO} from "../components/Seo"
import {Layout} from '../components/Layout';
import {PostItem} from '../components/post/PostItem';
import {Pagination} from '../components/Pagination';
import {SiteIntro} from '../components/site/SiteIntro';
import {SiteDivider} from '../theme';

const Posts = ({data, pageContext}) => (
  <Layout>
    <SEO title={`${pageContext.name} posts`}/>
    <SiteIntro/>
    <SiteDivider/>
    {data.allWordpressPost.edges.map(({node}) => (
      <PostItem key={node.id} {...node} />
    ))}
    <Pagination {...pageContext}/>
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
