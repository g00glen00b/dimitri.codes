import React from 'react';
import {Layout} from '../components/Layout';
import {NotFoundBox} from '../components/NotFoundBox';
import {graphql} from "gatsby";
import {Seo} from "../components/Seo";

export const query = graphql`
  query {
    file(relativePath: {eq: "logo-square.png"}) {
      publicURL
    }
    site {
      siteMetadata {
        title
        description
        author
        siteUrl
      }
    }
  }
`;

const NotFoundPage = () => (
  <Layout simple>
    <NotFoundBox/>
  </Layout>
);

export default NotFoundPage;

export const Head = ({location: {pathname}, data: {file, site}}) => (
  <Seo
    siteUrl={site.siteMetadata.siteUrl}
    description={site.siteMetadata.description}
    imageUrl={file.publicURL}
    author={site.siteMetadata.author}
    iconUrl={file.publicURL}
    title="404: Not found"
    siteTitle={site.siteMetadata.title}
    path={pathname} />
);
