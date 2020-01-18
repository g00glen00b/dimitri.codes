import React, {createContext} from 'react';
import {graphql, useStaticQuery} from 'gatsby';

export const ImageContext = createContext({images: []});

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

const ImageProvider = ({children}) => {
  const {allWordpressWpMedia: {edges: images = []} = {}} = useStaticQuery(allMedia);
  return (
    <ImageContext.Provider value={{images}}>
      {children}
    </ImageContext.Provider>
  );
};

export default ({element}) => <ImageProvider>{element}</ImageProvider>;

