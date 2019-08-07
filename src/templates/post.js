import React from 'react';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {graphql} from 'gatsby';
import {PostDetail} from '../components/post/PostDetail';
import {Message} from '../theme';
import {OutboundLink} from 'gatsby-plugin-google-analytics';

const getTagMetadata = tags => tags.map(({name}) => ({name: 'article:tag', content: name}));
const getSectionMetadata = categories => categories.map(({name}) => ({name: 'article:section', content: name}));
const getTimeMetadata = (publishedAt, modifiedAt) => [
  {name: `og:updated_time`, content: modifiedAt},
  {name: `article:published_time`, content: publishedAt},
  {name: `article:modified_time`, content: modifiedAt}
];

const Post = ({data}) => {
  return (
    <Layout>
      <SEO
        title={data.wordpressPost.title}
        description={data.wordpressPost.simpleExcerpt}
        image={data.wordpressPost.featured_media.localFile.publicURL}
        meta={[
          ...getTimeMetadata(data.wordpressPost.iso, data.wordpressPost.modified),
          ...getTagMetadata(data.wordpressPost.tags),
          ...getSectionMetadata(data.wordpressPost.categories)
        ]}/>
      <PostDetail {...data.wordpressPost}/>
      <Message>
        Anything not clear?
        Feel free to contact me on <OutboundLink href="https://twitter.com/g00glen00b" target="_blank">Twitter</OutboundLink> or <OutboundLink href="https://keybase.io/g00glen00b" target="_blank">Keybase</OutboundLink>.
      </Message>
    </Layout>
  );
};

export const query = graphql`
  query ($id: String!) {
    site {
      siteMetadata {
        title
        description
      }
    }
    
    wordpressPost(id: {eq: $id}) {
      date(formatString: "MMMM Do, YYYY")
      iso: date
      modified
      title
      content
      simpleExcerpt
      slug
      featured_media {
        localFile {
          publicURL
        }
      }
      categories {
        name
      }
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
`;

export default Post;
