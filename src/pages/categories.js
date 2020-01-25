import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {ElevatorPitch} from '../components/ElevatorPitch';
import {Tags} from '../components/Tags';

const allWordpressCategoryQuery = graphql`
  query {
    allWordpressCategory(filter: {count: {gt: 0}}) {
      edges {
        node {
          id
          count
          slug
          name
        }
      }
    }
  }
`;

const IndexPage = () => {
  const {allWordpressCategory} = useStaticQuery(allWordpressCategoryQuery);

  return (
    <Layout>
      <SEO title="Categories"/>
      <ElevatorPitch/>
      <h1 className="page__title">
        Pick a category
      </h1>
      <Tags
        base="/category"
        tags={allWordpressCategory.edges.map(({node}) => node)}/>
    </Layout>
  );
};

export default IndexPage;
