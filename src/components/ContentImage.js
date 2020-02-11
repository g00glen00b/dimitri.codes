import React, {useContext} from 'react';
import {ImageContext} from '../imageProvider';
import Img from 'gatsby-image';
import {getImageFile, getImageWidth} from '../helpers/contentHelpers';

const ContentImageContainer = ({fullWidth, width, children}) => (
  <div style={{width: fullWidth ? '100%' : width, maxWidth: '100%', margin: '0 auto'}}>{children}</div>
);

const ContentImagePlain = ({src, alt}) => {
  console.warn(`Fall back on plain image for "${src}"`);
  return <img src={src} alt={alt}/>;
};

const ContentImageGatsby = ({image, alt}) => {
  if (image.node.localFile.childImageSharp == null) {
    return <ContentImagePlain src={image.node.localFile.publicURL} alt={alt}/>;
  } else {
    return <Img fluid={image.node.localFile.childImageSharp.fluid} alt={alt}/>;
  }
};

export const ContentImage = ({src, alt, fullWidth, width, sizes}) => {
  const {images} = useContext(ImageContext);
  const image = getImageFile(images, src);

  const actualWidth = getImageWidth(sizes, width);

  return (
    <ContentImageContainer width={actualWidth} fullWidth={fullWidth}>
      {image == null ?
        <ContentImagePlain src={src} alt={alt} />
        :
        <ContentImageGatsby image={image} alt={alt}/>
      }
    </ContentImageContainer>
  );
};
