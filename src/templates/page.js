import React from 'react';
import {graphql} from 'gatsby';
import {PageDetail} from '../components/page/PageDetail';
import {Layout} from '../components/shared/Layout';
import {SEO} from '../components/shared/Seo';

const Post = ({data}) => {
  return (
    <Layout>
      <SEO title={data.wordpressPage.title}/>
      <PageDetail
        content={data.wordpressPage.content}
        title={data.wordpressPage.title}/>
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
    
    wordpressPage(id: {eq: $id}) {
      title
      content
      slug
    }
  }
`;

export default Post;
