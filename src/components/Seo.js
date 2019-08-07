import React from "react"
import Helmet from "react-helmet"
import {graphql, useStaticQuery} from "gatsby"
import {Location} from '@reach/router';

const siteMetadataQuery = graphql`
  query {
    file(relativePath: {eq: "logo.png"}) {
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

const getOpenGraphMetadata = (site, title, metaDescription, location, image) => [
  {property: `og:title`, content: title},
  {property: `og:description`, content: metaDescription},
  {property: `og.site_name`, content: site.siteMetadata.title},
  {property: `og:type`, content: `website`},
  {property: `og:locale`, content: `en_US`},
  {property: `og:url`, content: `${site.siteMetadata.siteUrl}${location.pathname}`},
  {property: `og:image`, content: `${site.siteMetadata.siteUrl}${image}`},
  {property: `og:image:secure_url`, content: `${site.siteMetadata.siteUrl}${image}`},
];

const getTwitterMetadata = (site, title, metaDescription, image) => [
  {name: `twitter:card`, content: `summary`},
  {name: `twitter:creator`, content: site.siteMetadata.author},
  {name: `twitter:title`, content: title},
  {name: `twitter:description`, content: metaDescription},
  {name: `twitter:site`, content: site.siteMetadata.siteUrl},
  {name: `twitter:image`, content: `${site.siteMetadata.siteUrl}${image}`},
];

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
          ]}/>
      )}
    </Location>
  )
};
