import React from 'react';
import {graphql, useStaticQuery} from 'gatsby';
import {SEO} from '../components/Seo';
import {Layout} from '../components/Layout';
import {SoftwareLicenses} from '../components/SoftwareLicenses';

const allSoftwareLicensesQuery = graphql`
  query {
    allSoftwareLicenseLibrary(filter: {name: {nin: "g00glen00b-gatsby"}}, sort: {fields: name}) {
      edges {
        node {
          license
          label
          url
        }
      }
    }
  }
`;

const CreditsPage = () => {
  const {allSoftwareLicenseLibrary} = useStaticQuery(allSoftwareLicensesQuery);

  return (
    <Layout>
      <SEO title="Credits"/>
      <h1>Software licenses</h1>
      <SoftwareLicenses licenseNodes={allSoftwareLicenseLibrary.edges}/>
    </Layout>
  );
};

export default CreditsPage;
