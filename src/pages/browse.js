import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {GroupCounts} from '../components/GroupCounts';

const allCategoriesAndTagsQuery = graphql`
  query {
    allCategories: allMarkdownRemark {
      group(field: frontmatter___categories) {
        fieldValue
        totalCount
      }
    }
    allTags: allMarkdownRemark {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`;

const IndexPage = () => {
  const {allCategories, allTags} = useStaticQuery(allCategoriesAndTagsQuery);
  return (
    <Layout>
      <SEO title="Browse"/>
      <h1 className="page__title">
        Pick a category
      </h1>
      <GroupCounts
        base="/category"
        groups={allCategories.group}/>

      <h1 className="page__title">
        Pick a tag
      </h1>
      <GroupCounts
        base="/tag"
        groups={allTags.group}/>
    </Layout>
  );
};

export default IndexPage;
