import React from "react"
import Helmet from "react-helmet"
import {graphql, useStaticQuery} from "gatsby"
import {Location} from '@reach/router';
import {getOpenGraphMetadata, getTwitterMetadata} from '../helpers/metadataHelpers';

const siteMetadataQuery = graphql`
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

export const SEO = ({description, lang = '', meta = [], title, image}) => {
  const {site, file} = useStaticQuery(siteMetadataQuery);
  const metaDescription = description || site.siteMetadata.description;
  const metaImage = image || file.publicURL;

  return (
    <Location>
      {({location}) => (
        <Helmet
          htmlAttributes={{lang}}
          title={title}
          titleTemplate={`%s | ${site.siteMetadata.title}`}
          meta={[
            {name: `description`, content: metaDescription},
            ...getOpenGraphMetadata(site, title, metaDescription, location, metaImage),
            ...getTwitterMetadata(site, title, metaDescription, metaImage),
            ...meta,
          ]}
          link={[
            {rel: `alternate`, type: `application/rss+xml`, title: `Feed`, href: `${site.siteMetadata.siteUrl}/rss.xml`}
          ]}/>
      )}
    </Location>
  )
};
