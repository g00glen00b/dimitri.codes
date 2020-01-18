import React, {useContext} from 'react';
import {ImageContext} from '../imageProvider';
import Img from 'gatsby-image';
import {getImageFile, getImageWidth} from './contentHelpers';

export const ContentImage = ({src, alt, width, sizes}) => {
  const {images} = useContext(ImageContext);
  const image = getImageFile(images, src);
  const actualWidth = getImageWidth(sizes, width);

  if (image == null || image.node.localFile.childImageSharp == null) {
    console.warn(`No local image found for "${src}"`);
    return <img
        src={src}
        alt={alt}
        style={{width: actualWidth}}/>
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
