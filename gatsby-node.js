// TODO
// const {createPostPages, createCategoryPostsPages, createPagePages, createPostsPages, createTagPostsPages} = require('./src/helpers/node/createPageHelpers');
//
// const allPostsQuery = `{
//   allWordpressPost {
//     edges {
//       node {
//         id
//         slug
//         title
//       }
//     }
//   }
//
//   allWordpressPage {
//     edges {
//       node {
//         id
//         slug
//       }
//     }
//   }
//
//   allWordpressCategory {
//     edges {
//       node {
//         id
//         count
//         slug
//         name
//       }
//     }
//   }
//
//   allWordpressTag {
//     edges {
//       node {
//         id
//         count
//         slug
//         name
//       }
//     }
//   }
// }`;
//
//
//
// exports.createPages = async ({graphql, actions: {createPage}}) => {
//   const {data, errors} = await graphql(allPostsQuery);
//   if (errors) throw errors;
//   return [
//     createPagePages(data, createPage),
//     createPostPages(data, createPage),
//     createPostsPages(data, createPage),
//     createCategoryPostsPages(data, createPage),
//     createTagPostsPages(data, createPage)
//   ];
// };

exports.onCreateNode = ({node, actions: {createNodeField}}) => {
  if (node.frontmatter != null) {
    const matcher = /\d{4}-\d{2}-\d{2}-(.+?)\/index.md$/;
    const [, slug] = node.fileAbsolutePath.match(matcher);
    if (slug != null) {
      createNodeField({
        node,
        name: 'slug',
        value: slug
      });
    }
  }
};
