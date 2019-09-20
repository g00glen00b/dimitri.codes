import {graphql, useStaticQuery} from 'gatsby';
import Img from 'gatsby-image';
import React from 'react';

const allMedia = graphql`
  query {
    allWordpressWpMedia {
      edges {
        node {
          slug
          source_url
          localFile {
            publicURL
            childImageSharp {
              fluid(maxWidth: 800) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  }
`;


const findImage = (media, src) => {
  const sourceUrl = src.replace(/^(http?s:\/\/.+?\/.+?)-(\d+x\d+)\.(.+?)$/g, '$1.$3');
  return media.find(({node}) => node.source_url === sourceUrl);
};

export const PostImage = ({src, alt, width, sizes}) => {
  const {allWordpressWpMedia} = useStaticQuery(allMedia);
  const image = findImage(allWordpressWpMedia.edges, src);
  const sizesWidth = sizes == null ? null : sizes.split(', ')[1];
  const actualWidth = sizesWidth == null ? (width != null ? width + 'px' : '100%') : sizesWidth;
  if (image == null || image.node.localFile.childImageSharp == null) {
    console.warn(`No local image found for "${src}"`);
    return (
      <img
        src={src}
        alt={alt}
        style={{width: actualWidth}}/>
      );
  } else {
    return (
      <div style={{
        width: actualWidth,
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        <Img
          fluid={image.node.localFile.childImageSharp.fluid}
          alt={alt}/>
      </div>
    );
  }
};
