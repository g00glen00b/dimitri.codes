import React from 'react';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {graphql} from 'gatsby';
import {PageDetail} from '../components/page/PageDetail';

const Post = ({data}) => {
  return (
    <Layout>
      <SEO title={data.wordpressPage.title}/>
      <PageDetail {...data.wordpressPage}/>
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
