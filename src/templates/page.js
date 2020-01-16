import React from 'react';
import {graphql} from 'gatsby';
import {SEO} from '../components/Seo';

const Page = ({data}) => {
  return (
    <main>
      <SEO title={data.wordpressPage.title}/>
      <div dangerouslySetInnerHTML={{__html: data.wordpressPage.content}}/>
    </main>
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
