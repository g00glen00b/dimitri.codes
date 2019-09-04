import React from "react"
import {graphql} from "gatsby"
import {PostItem} from '../components/post/PostItem';
import {SiteIntro} from '../components/site/SiteIntro';
import {SEO} from '../components/shared/Seo';
import {Pagination} from '../components/shared/Pagination';
import {Layout} from '../components/shared/Layout';

const Posts = ({data, pageContext}) => (
  <Layout>
    <SEO title="Posts"/>
    <SiteIntro/>
    {data.allWordpressPost.edges.map(({node}) => (
      <PostItem
        key={node.id}
        date={node.date}
        tags={node.tags}
        readingTime={node.fields.readingTime}
        title={node.title}
        excerpt={node.excerpt}
        slug={node.slug} />
    ))}
    <Pagination
      pageCount={pageContext.pageCount}
      currentPage={pageContext.currentPage}
      base={pageContext.base}/>
  </Layout>
);

export const query = graphql`
  query($skip: Int!, $limit: Int!) {
    allWordpressPost(sort: {fields: [date], order:DESC}, limit: $limit, skip: $skip) {
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
