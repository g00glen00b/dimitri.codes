import React from "react"
import {graphql} from "gatsby"
import {SEO} from '../components/Seo';
import {Pagination} from '../components/Pagination';
import {Layout} from '../components/Layout';
import {PostExcerpt} from '../components/PostExcerpt';

const Posts = ({data: {allWordpressPost}, pageContext}) => (
  <Layout>
    <h1 className="page__title">
      Posts
    </h1>
    <SEO title="Posts"/>
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

// export const query = graphql`
//   query($skip: Int!, $limit: Int!) {
//     allWordpressPost(sort: {fields: [date], order:DESC}, limit: $limit, skip: $skip) {
//       edges {
//         node {
//           id
//           categories {
//             id
//             name
//             slug
//           }
//           daysAgo: date(difference: "days")
//           title
//           excerpt
//           slug
//           tags {
//             id
//             slug
//             name
//           }
//           fields {
//             readingTime {
//               text
//             }
//           }
//         }
//       }
//     }
//   }
// `;

export default Posts;
