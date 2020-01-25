import React from 'react';
import {graphql} from 'gatsby';
import {SEO} from '../components/Seo';
import {DangerousContent} from '../components/DangerousContent';
import {Layout} from '../components/Layout';
import {PostFooter} from '../components/PostFooter';
import {Tags} from '../components/Tags';
import {getSectionMetadata, getTagMetadata, getTimeMetadata} from '../helpers/metadataHelpers';
import {ElevatorPitch} from '../components/ElevatorPitch';

const Post = ({data: {wordpressPost, site}}) => (
  <Layout>
    <SEO
      title={wordpressPost.title}
      description={wordpressPost.simpleExcerpt}
      image={wordpressPost.featured_media != null ? wordpressPost.featured_media.localFile.publicURL : null}
      meta={[
        ...getTimeMetadata(wordpressPost.iso, wordpressPost.modified),
        ...getTagMetadata(wordpressPost.tags),
        ...getSectionMetadata(wordpressPost.categories)
      ]}/>
    <h1 className="page__title">{wordpressPost.title}</h1>
    <p className="page__metadata">
      {wordpressPost.date}, {wordpressPost.fields.readingTime.text}
    </p>
    <Tags tags={wordpressPost.tags}/>
    <DangerousContent content={wordpressPost.content}/>
    <PostFooter url={`${site.siteMetadata.siteUrl}/${wordpressPost.slug}`}/>
    <ElevatorPitch/>
  </Layout>
);

export const query = graphql`
  query ($id: String!) {
    site {
      siteMetadata {
        siteUrl
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
