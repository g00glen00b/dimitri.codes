import React from 'react';
import {graphql} from 'gatsby';
import {PostDetail} from '../components/post/PostDetail';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import {Message} from '../components/shared/Message';
import {Layout} from '../components/shared/Layout';
import {SEO} from '../components/shared/Seo';

const getTagMetadata = tags => {
  if (tags == null) {
    return [];
  } else {
    return tags.map(({name}) => ({name: 'article:tag', content: name}));
  }
};

const getSectionMetadata = categories => {
  if (categories == null) {
    return [];
  } else {
    return categories.map(({name}) => ({name: 'article:section', content: name}));
  }
};

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
        image={data.wordpressPost.featured_media != null ? data.wordpressPost.featured_media.localFile.publicURL : null}
        meta={[
          ...getTimeMetadata(data.wordpressPost.iso, data.wordpressPost.modified),
          ...getTagMetadata(data.wordpressPost.tags),
          ...getSectionMetadata(data.wordpressPost.categories)
        ]}/>
      <PostDetail
        title={data.wordpressPost.title}
        readingTime={data.wordpressPost.fields.readingTime}
        tags={data.wordpressPost.tags}
        date={data.wordpressPost.date}
        content={data.wordpressPost.content}/>
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
      fields {
        readingTime {
          text
        }
      }
    }
  }
`;

export default Post;
