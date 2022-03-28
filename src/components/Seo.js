import React from "react"
import Helmet from "react-helmet"
import {graphql, useStaticQuery} from "gatsby"
import {Location} from '@reach/router';
import {getOpenGraphMetadata, getTwitterMetadata} from '../helpers/metadataHelpers';
import PropTypes from 'prop-types';

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

export const Seo = ({description, lang = 'en', meta = [], title, image}) => {
  const {site, file} = useStaticQuery(siteMetadataQuery);
  const metaDescription = description || site.siteMetadata.description;
  const imageUrl = image == null ? file.publicURL : image.publicURL;

  return (
    <Location>
      {({location}) => (
        <Helmet
          htmlAttributes={{lang}}
          title={title}
          titleTemplate={`%s | ${site.siteMetadata.title}`}
          meta={[
            {name: `description`, content: metaDescription},
            ...getOpenGraphMetadata(site, title, metaDescription, location, imageUrl),
            ...getTwitterMetadata(site, title, metaDescription, imageUrl),
            ...meta,
          ]}
          link={[
            {rel: `alternate`, type: `application/rss+xml`, title: `Feed`, href: `${site.siteMetadata.siteUrl}/rss.xml`},
            {rel: `icon`, href: file.publicURL}
          ]}/>
      )}
    </Location>
  )
};

Seo.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  title: PropTypes.string,
  image: PropTypes.shape({
    childImageSharp: PropTypes.shape({
      fluid: PropTypes.shape({
        src: PropTypes.string.isRequired
      })
    })
  }),
  meta: PropTypes.array
};
