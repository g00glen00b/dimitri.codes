import React from 'react';
import {graphql} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {DangerousContent} from '../components/DangerousContent';

const Page = ({data}) => {
  return (
    <Layout>
      <SEO title={data.wordpressPage.title}/>
      <h1 className="page__title">{data.wordpressPage.title}</h1>
      <DangerousContent content={data.wordpressPage.content}/>
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

export default Page;
