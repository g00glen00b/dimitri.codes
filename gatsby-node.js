const {injectManifest, copyWorkboxLibraries} = require('workbox-build');
const {createPostPages, createCategoryPostsPages, createPagePages, createPostsPages, createTagPostsPages} = require('./gatsby-node-create-page');

const allPostsQuery = `{
  allWordpressPost {
    edges {
      node {
        id
        slug
        title
      }
    }
  }
  
  allWordpressPage {
    edges {
      node {
        id
        slug
      }
    }
  }
  
  allWordpressCategory {
    edges {
      node {
        id
        count
        slug
        name
      }
    }
  }
  
  allWordpressTag {
    edges {
      node {
        id
        count
        slug
        name
      }
    }
  }  
}`;



exports.createPages = async ({graphql, actions: {createPage}}) => {
  const {errors, data} = await graphql(allPostsQuery);
  if (errors) throw errors;
  return [
    createPagePages(data, createPage),
    createPostPages(data, createPage),
    createPostsPages(data, createPage),
    createCategoryPostsPages(data, createPage),
    createTagPostsPages(data, createPage)
  ];
};

exports.onPostBuild = async () => {
  const path = await copyWorkboxLibraries(`public`);
  const {count, size, warnings} = await injectManifest({
    swSrc: `./src/sw.js`,
    swDest: `public/sw.js`,
    dontCacheBustURLsMatching: /(\.js$|\.css$|static\/)/,
    globDirectory: `public`,
    globPatterns: [
      `**/*.woff2`,
      `app-*.js`,
      `commons-*.js`,
      `webpack-runtime-*.js`,
      `manifest.webmanifest`
    ],
  });
  if (warnings) warnings.forEach(warning => console.warn(warning));
  console.info(`Copied Workbox libraries to ${path}`);
  console.info(`Generated serviceworker, precaching ${count} files, totaling ${size} bytes`);
};
