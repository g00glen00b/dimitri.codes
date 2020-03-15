import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {ElevatorPitch} from '../components/ElevatorPitch';
import {GroupCounts} from '../components/GroupCounts';

const allTagsQuery = graphql`
  query {
    allMarkdownRemark {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`;

const IndexPage = () => {
  const {allMarkdownRemark} = useStaticQuery(allTagsQuery);

  return (
    <Layout>
      <SEO title="Tags"/>
      <ElevatorPitch/>
      <h1 className="page__title">
        Pick a tag
      </h1>
      <GroupCounts
        base="/tag"
        groups={allMarkdownRemark.group}/>
    </Layout>
  );
};

export default IndexPage;
