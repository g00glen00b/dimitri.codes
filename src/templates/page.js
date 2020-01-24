import React from 'react';
import {graphql} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {DangerousContent} from '../components/DangerousContent';

const Page = ({data: {wordpressPage}}) => {
  return (
    <Layout>
      <SEO title={wordpressPage.title}/>
      <h1 className="page__title">{wordpressPage.title}</h1>
      <DangerousContent content={wordpressPage.content}/>
    </Layout>
  );
};

export const query = graphql`
  query ($id: String!) {
    wordpressPage(id: {eq: $id}) {
      title
      content
      slug
    }
  }
`;

export default Page;
