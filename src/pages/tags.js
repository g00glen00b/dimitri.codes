import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {ElevatorPitch} from '../components/ElevatorPitch';
import {Tags} from '../components/Tags';

const allWordpressTagQuery = graphql`
  query {
    allWordpressTag(filter: {count: {gt: 0}}) {
      edges {
        node {
          count
          slug
          name
        }
      }
    }
  }
`;

const IndexPage = () => {
  const {allWordpressTag} = useStaticQuery(allWordpressTagQuery);

  return (
    <Layout>
      <SEO title="Home"/>
      <ElevatorPitch/>
      <h1 className="page__title">Pick a tag</h1>
      <Tags tags={allWordpressTag.edges.map(({node}) => node)}/>
    </Layout>
  );
};

export default IndexPage;
