import {graphql, useStaticQuery} from 'gatsby';
import Img from 'gatsby-image';
import React from 'react';

const allMedia = graphql`
  query {
    allWordpressWpMedia {
      edges {
        node {
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

export const PostImage = ({src, alt, width, sizes}) => {
  const {allWordpressWpMedia} = useStaticQuery(allMedia);
  const originalSource = src.replace(/^(http?s:\/\/.+?\/.+?)-(\d+x\d+)\.(.+?)$/g, '$1.$3');
  const image = allWordpressWpMedia.edges.find(({node}) => node.source_url === originalSource);
  const sizesWidth = sizes == null ? null : sizes.split(', ')[1];
  const actualWidth = sizesWidth == null ? (width != null ? width + 'px' : '100%') : sizesWidth;
  return image == null || image.node.localFile.childImageSharp == null ? (
    <img
      src={src}
      alt={alt}
      style={{width: actualWidth}}/>
  ) : (
    <div style={{
      width: actualWidth,
      maxWidth: '100%'
    }}>
      <Img
        fluid={image.node.localFile.childImageSharp.fluid}
        alt={alt}/>
    </div>
  );
};
