import React from 'react';
import SEO from '../components/Seo';
import {Layout} from '../components/Layout';
import {graphql} from 'gatsby';
import {PostDetail} from '../components/post/PostDetail';
import {Message} from '../theme';
import {OutboundLink} from 'gatsby-plugin-google-analytics';

const Post = ({data}) => {
  return (
    <Layout>
      <SEO title={data.wordpressPost.title}/>
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
      title
      content
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
`;

export default Post;
