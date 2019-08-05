import {graphql, useStaticQuery} from 'gatsby';
import Img from 'gatsby-image';
import React from 'react';

export const SiteLogo = () => {
  const data = useStaticQuery(graphql`
    query {
      siteLogo: file(relativePath: { eq: "logo.png" }) {
        childImageSharp {
          fixed(width: 64) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `);

  return <Img fixed={data.siteLogo.childImageSharp.fixed} alt="Site logo"/>;
};
