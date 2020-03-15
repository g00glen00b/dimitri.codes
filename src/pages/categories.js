import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {ElevatorPitch} from '../components/ElevatorPitch';
import {GroupCounts} from '../components/GroupCounts';

const allCategoriesQuery = graphql`
  query {
    allMarkdownRemark {
      group(field: frontmatter___categories) {
        fieldValue
        totalCount
      }
    }
  }
`;

const IndexPage = () => {
  const {allMarkdownRemark} = useStaticQuery(allCategoriesQuery);
  return (
    <Layout>
      <SEO title="Categories"/>
      <ElevatorPitch/>
      <h1 className="page__title">
        Pick a category
      </h1>
      <GroupCounts
        base="/category"
        groups={allMarkdownRemark.group}/>
    </Layout>
  );
};

export default IndexPage;
